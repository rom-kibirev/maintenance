import React, { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Alert, Box, LinearProgress, Snackbar, Typography } from "@mui/material";

export default function PricesDataLoader({ token, server = false, putPrices = () => {} }) {
    const [loadedPages, setLoadedPages] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: "" });

    const url = "https://runtec-shop.ru/api/v2/goods/prices?type=short";

    const fetchServerPrices = async (headers) => {
        const totalPagesResponse = await fetch(`${url}&page=1&limit=1000`, { headers });
        if (!totalPagesResponse.ok) {
            throw new Error(`HTTP error! status: ${totalPagesResponse.status}`);
        }
        const initialData = await totalPagesResponse.json();
        const totalPagesCount = initialData.total_pages || 1;
        setTotalPages(totalPagesCount);

        const pagePromises = Array.from({ length: totalPagesCount }, (_, i) =>
            fetch(`${url}&page=${i + 1}&limit=1000`, { headers })
                .then((res) => {
                    if (!res.ok) throw new Error(`Ошибка на странице ${i + 1}: ${res.status}`);
                    return res.json();
                })
                .then((data) => {
                    setLoadedPages((prev) => prev + 1);
                    return data.data || [];
                })
        );

        const allResponses = await Promise.all(pagePromises);
        return allResponses.flatMap((response) => response);
    };

    const fetchLocalPrices = async () => {
        setTotalPages(1);
        setLoadedPages(0);

        try {
            const response = await axios.get(`./data/api_v2/prices_data/all_prices.json`);
            setLoadedPages(1);
            return response.data || []; // Исправлено: возвращаем массив цен напрямую
        } catch (error) {
            console.error('Ошибка при загрузке локального файла:', error);
            throw error;
        }
    };

    const fetchAllPrices = useCallback(async () => {
        setLoading(true);
        setLoadedPages(0);
        setError(null);
        putPrices([]);

        const headers = {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
        };

        try {
            const rawPrices = server ? await fetchServerPrices(headers) : await fetchLocalPrices();

            // Фильтруем цены: убираем записи, где PRICE <= 0 или null/undefined
            const filteredPrices = rawPrices.filter((price) => {
                const priceValue = price.PRICE;
                return priceValue != null && priceValue > 0;
            });

            putPrices(filteredPrices);
            console.log(`Загружено ${filteredPrices.length} цен ${server ? "с сервера" : "из локального файла"} после фильтрации`);
            setNotification({
                open: true,
                message: `Цены загружены (${filteredPrices.length} после фильтрации) ${server ? "с сервера" : "из локального файла"}`,
            });
        } catch (e) {
            console.error(`Ошибка при загрузке цен: ${e.message}`);
            setError(`Ошибка при получении цен: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [token, server, putPrices]);

    useEffect(() => {
        if (token) {
            fetchAllPrices();
        }
    }, [token, server, fetchAllPrices]);

    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    const progress = useMemo(
        () => (totalPages > 0 ? (loadedPages / totalPages) * 100 : 0),
        [loadedPages, totalPages]
    );

    const itemsPerPage = server ? 1000 : 1;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {server ? "Сервер (Цены)" : "Локальный (Цены)"}
            </Typography>

            {loading && (
                <Box sx={{ width: "100%", mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Загрузка: {loadedPages * itemsPerPage} из {totalPages * itemsPerPage} цен (
                        {progress.toFixed(0)}%)
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
                autoHideDuration={1000}
                onClose={handleCloseNotification}
                message={notification.message}
            />
        </Box>
    );
}