
import React, { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Alert, Box, LinearProgress, Snackbar, Typography } from "@mui/material";

export default function QuantityDataLoader({ token, server = false, putQuantities = () => {} }) {
    const [loadedPages, setLoadedPages] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: "" });

    const url = "https://runtec-shop.ru/api/v2/goods/quantity?type=full";

    const fetchServerQuantities = async (headers) => {
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
        const allWarehouses = allResponses.flatMap((response) => response);

        // Фильтруем товары с нулевыми остатками как в Python-скрипте
        const filteredWarehouses = filterZeroQuantities(allWarehouses);

        // Преобразуем данные складов в массив товаров с количеством
        return transformToProducts(filteredWarehouses);
    };

    const filterZeroQuantities = (warehouses) => {
        const filtered = [];
        for (const warehouse of warehouses) {
            const filteredGoods = (warehouse.GOODS || []).filter(good => good.QUANTITY > 0);
            if (filteredGoods.length > 0) {
                filtered.push({
                    ID_WAREHOUSE: warehouse.ID_WAREHOUSE,
                    GOODS: filteredGoods
                });
            }
        }
        return filtered;
    };

    const transformToProducts = (warehouses) => {
        const products = {};
        warehouses.forEach((warehouse, warehouseIndex) => {
            const warehouseIndexStr = String(warehouseIndex);
            (warehouse.GOODS || []).forEach(good => {
                const productId = good.ID;
                const quantity = good.QUANTITY;

                if (!products[productId]) {
                    products[productId] = { ID: productId, QUANTITIES: {} };
                }

                products[productId].QUANTITIES[warehouseIndexStr] = quantity;
            });
        });

        return Object.values(products);
    };

    const fetchLocalQuantities = async () => {
        setTotalPages(1);
        setLoadedPages(0);

        try {
            const response = await axios.get(`./data/api_v2/quantity_data/products_quantity.json`);
            setLoadedPages(1);
            return response.data.PRODUCTS || [];
        } catch (error) {
            console.error('Ошибка при загрузке локального файла остатков:', error);
            throw error;
        }
    };

    const fetchAllQuantities = useCallback(async () => {
        setLoading(true);
        setLoadedPages(0);
        setError(null);
        putQuantities([]);

        const headers = {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
        };

        try {
            const quantities = server ? await fetchServerQuantities(headers) : await fetchLocalQuantities();

            putQuantities(quantities);
            console.log(`Загружено ${quantities.length} товаров с остатками ${server ? "с сервера" : "из локального файла"}`);
            setNotification({
                open: true,
                message: `Остатки загружены (${quantities.length} товаров) ${server ? "с сервера" : "из локального файла"}`,
            });
        } catch (e) {
            console.error(`Ошибка при загрузке остатков: ${e.message}`);
            setError(`Ошибка при получении остатков: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [token, server, putQuantities]);

    useEffect(() => {
        if (token) {
            fetchAllQuantities();
        }
    }, [token, server, fetchAllQuantities]);

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
                {server ? "Сервер (Остатки)" : "Локальный (Остатки)"}
            </Typography>

            {loading && (
                <Box sx={{ width: "100%", mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Загрузка: {loadedPages * itemsPerPage} из {totalPages * itemsPerPage} записей (
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