import React, { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Alert, Box, LinearProgress, Snackbar, Typography } from "@mui/material";

export default function FeedDataLoader({ putFeedProducts = () => {} }) {
    const [loading, setLoading] = useState(false); // Состояние загрузки
    const [error, setError] = useState(null); // Ошибка
    const [notification, setNotification] = useState({ open: false, message: "" }); // Уведомление
    const [loadedItems, setLoadedItems] = useState(0); // Количество загруженных элементов
    const [totalItems, setTotalItems] = useState(0); // Общее количество элементов

    const url = "./data/api_v2/goods/products.json"; // Локальный путь к файлу

    // Функция загрузки и преобразования данных из фида
    const fetchFeedProducts = useCallback(async () => {
        setLoading(true);
        setLoadedItems(0);
        putFeedProducts([]);
        setError(null);

        try {
            const response = await axios.get(url);
            const rawData = response.data || [];

            // Преобразуем и фильтруем данные только по цене
            const transformedData = rawData
                .map((item) => ({
                    VENDOR: item.VENDOR,
                    price: parseFloat(item.price), // Преобразуем строку в число
                    warehouse: item.warehouse || [],
                }))
                .filter((item) => item.price > 0); // Оставляем только товары с ценой > 0

            setTotalItems(rawData.length); // Общее количество до фильтрации
            setLoadedItems(transformedData.length); // Количество после фильтрации
            putFeedProducts(transformedData); // Передаем отфильтрованные данные в родительский компонент
            console.log(`Загружено ${transformedData.length} товаров из локального фида после фильтрации`);
            setNotification({
                open: true,
                message: `Данные из фида загружены (${transformedData.length} товаров после фильтрации)`,
            });
        } catch (e) {
            console.error(`Ошибка при загрузке данных из фида: ${e.message}`);
            setError(`Ошибка при получении данных из фида: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [putFeedProducts]);

    // Загружаем данные при монтировании компонента
    useEffect(() => {
        fetchFeedProducts();
    }, [fetchFeedProducts]);

    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    // Прогресс загрузки
    const progress = useMemo(
        () => (totalItems > 0 ? (loadedItems / totalItems) * 100 : 0),
        [loadedItems, totalItems]
    );

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Локальный фид (Цены и остатки)
            </Typography>

            {loading && (
                <Box sx={{ width: "100%", mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Загрузка: {loadedItems} из {totalItems} товаров ({progress.toFixed(0)}%)
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