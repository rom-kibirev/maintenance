import React, { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Alert, Box, LinearProgress, Snackbar, Typography } from "@mui/material";

export default function GoodsDataLoader({ token, server = false, putProducts = () => {} }) {
    const [loadedPages, setLoadedPages] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '' });

    const url = "https://runtec-shop.ru/api/v2/goods";

    // Функция загрузки данных с сервера
    const fetchServerProducts = async (headers) => {
        try {
            // Используем axios вместо fetch для более удобной обработки ошибок
            const totalPagesResponse = await axios.get(`${url}?page=1&limit=1000`, {
                headers,
                timeout: 30000, // увеличиваем таймаут до 30 секунд
            });

            const initialData = totalPagesResponse.data;
            const totalPagesCount = initialData.total_pages || 1;
            setTotalPages(totalPagesCount);

            const allProducts = [];
            // Загружаем страницы последовательно вместо параллельно для снижения нагрузки
            for (let i = 0; i < totalPagesCount; i++) {
                try {
                    const response = await axios.get(`${url}?page=${i + 1}&limit=1000`, {
                        headers,
                        timeout: 30000
                    });

                    if (response.data && Array.isArray(response.data.data)) {
                        allProducts.push(...response.data.data);
                    } else {
                        console.warn(`Страница ${i + 1}: неожиданный формат данных`);
                    }

                    setLoadedPages(i + 1);
                } catch (pageError) {
                    console.warn(`Ошибка загрузки страницы ${i + 1}: ${pageError.message}`);
                    // Продолжаем с следующей страницей
                }

                // Добавляем небольшую задержку между запросами
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            return allProducts;
        } catch (e) {
            throw new Error(`Ошибка загрузки с сервера: ${e.message}`);
        }
    };

    // Функция загрузки локальных данных
    const fetchLocalProducts = async () => {
        const totalParts = 23;
        setTotalPages(totalParts);

        const partPromises = Array.from({ length: totalParts }, (_, i) =>
            axios.get(`./data/api_v2/goods/all_products_part_${i + 1}.json`)
                .then(response => {
                    setLoadedPages(prev => prev + 1);
                    return response.data;
                })
                .catch(err => {
                    console.warn(`Ошибка загрузки файла part_${i + 1}: ${err.message}`);
                    return null; // Пропускаем проблемный файл
                })
        );

        const allResponses = await Promise.all(partPromises);
        return allResponses
            .filter(data => data !== null)
            .flatMap(data => data || []);
    };

    // Основная функция загрузки
    const fetchAllProducts = useCallback(async () => {
        setLoading(true);
        setLoadedPages(0);
        setTotalPages(0);  // Сбрасываем totalPages перед каждой загрузкой
        putProducts([]);
        setError(null);

        const headers = {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`
        };

        try {
            const allProducts = server ? await fetchServerProducts(headers) : await fetchLocalProducts();
            putProducts(allProducts);
            console.log(`Загружено ${allProducts.length} товаров ${server ? 'с сервера' : 'из 23 локальных файлов'}`);
            setNotification({
                open: true,
                message: `Данные загружены (${allProducts.length} товаров) ${server ? 'с сервера' : 'из локальных файлов'}`
            });
        } catch (e) {
            console.error(`Ошибка при загрузке: ${e.message}`);
            setError(`Ошибка при получении данных: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [token, server, putProducts]);

    useEffect(() => {
        if (token) {
            fetchAllProducts();
        }
    }, [token, server, fetchAllProducts]);

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const progress = useMemo(() => (
        totalPages > 0 ? (loadedPages / totalPages) * 100 : 0
    ), [loadedPages, totalPages]);

    const itemsPerPage = server ? 1000 : 3000;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {server ? "Сервер" : "Локальный"}
            </Typography>

            {loading && (
                <Box sx={{ width: "100%", mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Загрузка: {(loadedPages * itemsPerPage)} из {(totalPages * itemsPerPage)} товаров
                        &nbsp;({progress.toFixed(0)}%)
                    </Typography>
                    <LinearProgress variant="determinate" color="warning" value={progress} />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                message={notification.message}
            />
        </Box>
    );
}