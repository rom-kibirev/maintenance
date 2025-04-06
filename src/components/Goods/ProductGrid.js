import React, { useState, useMemo } from "react";
import {
    Box,
    Card,
    CardContent,
    MenuItem,
    Pagination,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Button,
} from "@mui/material";
import * as XLSX from "xlsx"; // Import SheetJS for Excel export

function ProductGrid({
                         filteredProducts,
                         priceProducts,
                         feedPrice,
                         feedQuantity,
                         quantityProducts,
                     }) {
    const ITEMS_PER_PAGE = 18; // 6 items per row, 3 rows per page
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState("all"); // Filter state

    // Preprocess data into lookup maps for O(1) lookups
    const priceProductsMap = useMemo(() => {
        const map = new Map();
        priceProducts.forEach((p) => map.set(p.ID, p.PRICE));
        return map;
    }, [priceProducts]);

    const feedPriceMap = useMemo(() => {
        const map = new Map();
        feedPrice.forEach((p) => map.set(p.VENDOR, p.price));
        return map;
    }, [feedPrice]);

    const feedQuantityMap = useMemo(() => {
        const map = new Map();
        feedQuantity.forEach((q) => map.set(q.VENDOR, q.warehouse));
        return map;
    }, [feedQuantity]);

    const quantityProductsMap = useMemo(() => {
        const map = new Map();
        quantityProducts.forEach((q) => map.set(q.ID, q.QUANTITIES));
        return map;
    }, [quantityProducts]);

    // Create a merged product list with all relevant data
    const mergedProducts = useMemo(() => {
        let products = filteredProducts.map((product) => {
            const sitePrice = priceProductsMap.get(product.ID) || 0;
            const feedPriceData = feedPriceMap.get(product.VENDOR) || 0;

            const feedQtyData = feedQuantityMap.get(product.VENDOR);
            const feedAvailability = feedQtyData
                ? {
                    points: feedQtyData.filter((w) => w.count > 0).length,
                    total: feedQtyData.reduce((sum, w) => sum + parseInt(w.count || 0), 0),
                }
                : { points: 0, total: 0 };

            const siteQtyData = quantityProductsMap.get(product.ID);
            const siteAvailability = siteQtyData
                ? {
                    points: Object.values(siteQtyData).filter((q) => q > 0).length,
                    total: Object.values(siteQtyData).reduce((sum, q) => sum + parseInt(q || 0), 0),
                }
                : { points: 0, total: 0 };

            return {
                ...product,
                sitePrice,
                feedPrice: feedPriceData,
                feedAvailability,
                siteAvailability,
            };
        });

        // Sort by SORT ascending
        products.sort((a, b) => a.SORT - b.SORT);

        return products;
    }, [
        filteredProducts,
        priceProductsMap,
        feedPriceMap,
        feedQuantityMap,
        quantityProductsMap,
    ]);

    // Calculate counts for each filter
    const filterCounts = useMemo(() => {
        const counts = {
            all: mergedProducts.length,
            matchAll: 0,
            priceMismatch: 0,
            quantityMismatch: 0,
            mismatchAll: 0,
        };

        mergedProducts.forEach((product) => {
            const priceMatches = product.sitePrice === product.feedPrice;
            const quantityMatches = product.siteAvailability.total === product.feedAvailability.total;

            if (priceMatches && quantityMatches) {
                counts.matchAll += 1;
            } else if (!priceMatches && quantityMatches) {
                counts.priceMismatch += 1;
            } else if (priceMatches && !quantityMatches) {
                counts.quantityMismatch += 1;
            } else if (!priceMatches && !quantityMatches) {
                counts.mismatchAll += 1;
            }
        });

        return counts;
    }, [mergedProducts]);

    // Apply the active filter to the products
    const filteredMergedProducts = useMemo(() => {
        if (filter === "all") return mergedProducts;

        return mergedProducts.filter((product) => {
            const priceMatches = product.sitePrice === product.feedPrice;
            const quantityMatches = product.siteAvailability.total === product.feedAvailability.total;

            switch (filter) {
                case "matchAll":
                    return priceMatches && quantityMatches;
                case "priceMismatch":
                    return !priceMatches && quantityMatches;
                case "quantityMismatch":
                    return priceMatches && !quantityMatches;
                case "mismatchAll":
                    return !priceMatches && !quantityMatches;
                default:
                    return true;
            }
        });
    }, [mergedProducts, filter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredMergedProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredMergedProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Export to Excel
    const exportToExcel = () => {
        const data = filteredMergedProducts.map((product) => ({
            "Название": product.NAME,
            "Артикул": product.VENDOR,
            "Цена сайта (₽)": product.sitePrice,
            "Цена фида (₽)": product.feedPrice,
            "Остатки сайта": product.siteAvailability.total > 0
                ? `Доступно в ${product.siteAvailability.points} точках, (${product.siteAvailability.total} шт)`
                : "Нет в наличии",
            "Остатки фида": product.feedAvailability.total > 0
                ? `Доступно в ${product.feedAvailability.points} точках, (${product.feedAvailability.total} шт)`
                : "Нет в наличии",
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

        // Generate and download the Excel file
        XLSX.writeFile(workbook, `products_${filter}_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    return (
        <Box sx={{ mt: 3 }}>
            {/* Filter Dropdown and Export Button */}
            <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
                <Select
                    value={filter}
                    onChange={handleFilterChange}
                    size="small"
                    sx={{
                        width: { xs: "100%", sm: 300 },
                        bgcolor: "grey.800",
                        color: "white",
                    }}
                >
                    <MenuItem value="all">Все товары ({filterCounts.all})</MenuItem>
                    <MenuItem value="matchAll">Цена и количество совпадают ({filterCounts.matchAll})</MenuItem>
                    <MenuItem value="priceMismatch">Цена не совпадает ({filterCounts.priceMismatch})</MenuItem>
                    <MenuItem value="quantityMismatch">Количество не совпадает ({filterCounts.quantityMismatch})</MenuItem>
                    <MenuItem value="mismatchAll">Цена и количество не совпадают ({filterCounts.mismatchAll})</MenuItem>
                </Select>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={exportToExcel}
                    sx={{ bgcolor: "grey.700", "&:hover": { bgcolor: "grey.600" } }}
                >
                    Экспорт в Excel
                </Button>
            </Box>

            {/* Product Grid */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "repeat(1, 1fr)",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(4, 1fr)",
                        xl: "repeat(5, 1fr)",
                        xxl: "repeat(6, 1fr)",
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                {paginatedProducts.map((product) => (
                    <Card
                        key={product.ID}
                        sx={{
                            bgcolor: "grey.900",
                            border: "1px solid",
                            borderColor: "grey.800",
                            height: "100%",
                        }}
                    >
                        <CardContent sx={{ p: 1 }}>
                            {/* Header: Name and Vendor */}
                            <Typography variant="subtitle2" color="text.primary" gutterBottom>
                                {product.NAME}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                                Артикул: {product.VENDOR}
                            </Typography>

                            {/* Table for Prices and Quantities */}
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: "text.primary", borderColor: "grey.800" }}>
                                            Источник
                                        </TableCell>
                                        <TableCell sx={{ color: "text.primary", borderColor: "grey.800" }}>
                                            Цена
                                        </TableCell>
                                        <TableCell sx={{ color: "text.primary", borderColor: "grey.800" }}>
                                            Остатки
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/* Site Row */}
                                    <TableRow>
                                        <TableCell sx={{ color: "text.primary", borderColor: "grey.800" }}>
                                            Сайт
                                        </TableCell>
                                        <TableCell sx={{ color: "amber.400", borderColor: "grey.800" }}>
                                            {product.sitePrice.toLocaleString()} ₽
                                        </TableCell>
                                        <TableCell sx={{ color: "green.400", borderColor: "grey.800" }}>
                                            {product.siteAvailability.total > 0
                                                ? `Доступно в ${product.siteAvailability.points} точках, (${product.siteAvailability.total} шт)`
                                                : "Нет в наличии"}
                                        </TableCell>
                                    </TableRow>
                                    {/* Feed Row */}
                                    <TableRow>
                                        <TableCell sx={{ color: "text.primary", borderColor: "grey.800" }}>
                                            Фид
                                        </TableCell>
                                        <TableCell sx={{ color: "cyan.400", borderColor: "grey.800" }}>
                                            {product.feedPrice.toLocaleString()} ₽
                                        </TableCell>
                                        <TableCell sx={{ color: "purple.400", borderColor: "grey.800" }}>
                                            {product.feedAvailability.total > 0
                                                ? `Доступно в ${product.feedAvailability.points} точках, (${product.feedAvailability.total} шт)`
                                                : "Нет в наличии"}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        sx={{
                            "& .MuiPaginationItem-root": {
                                color: "white",
                                bgcolor: "grey.800",
                                "&:hover": { bgcolor: "grey.700" },
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}

export default ProductGrid;