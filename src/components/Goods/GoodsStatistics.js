import Page from "../UI/Theme/Page";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import goodsFrom1C from "../Goods/goods/goods.json";
import { fetchGoodsData } from "../UI/global/sortTools";
import { searchByNameAndVendor, searchGoods1C } from "../UI/global/searchUtils";
import {
    Alert, Box, CircularProgress, FormControlLabel,
    Switch, TextField, Pagination
} from "@mui/material";
import ProductsList from "../Dash/ProductsList";
import Products1CList from "./Products1CList";

const ITEMS_PER_PAGE = 50;

const utils = {
    filterActive: (items, isActive) => items?.filter(g => isActive ? g.ACTIVE : !g.ACTIVE) || [],

    getWebsiteIds: (websiteGoods) => new Set(websiteGoods.map(g => g.XML_ID)),

    filterByWebsite: (goods1C, websiteIds) =>
        [...new Set(goods1C.filter(g => websiteIds.has(g.guid)))],

    filterMissingGoods: (goods1C, websiteIds) =>
        goods1C.filter(g => !websiteIds.has(g.guid)),

    getCategoryInfo: (guid, categories) => {
        const category = categories.find(c => c.XML_ID === guid);
        if (!category) return { error: 'Категория не найдена' };
        if (!category.ACTIVE) return { error: 'Категория отключена', category };
        return { category };
    },

    enrichGoodsWithCategories: (goods, categories) =>
        goods.map(good => {
            const { category, error } = utils.getCategoryInfo(good.category, categories);
            return {
                ...good,
                categoryName: category?.NAME || 'Категория не найдена',
                categoryError: error
            };
        })
};

export default function GoodsStatistics({ token }) {
    const [status, setStatus] = useState({ loading: false, error: null });
    const [data, setData] = useState({
        categories: [],
        goods: [],
        feed: [],
        goods1C: goodsFrom1C
    });
    const [filters, setFilters] = useState({
        search: '',
        goodsActive: true,
        showMissing: false,
        page: 1
    });

    const loadData = useCallback(async () => {
        if (!token) return;

        setStatus({ loading: true, error: null });
        try {
            const result = await fetchGoodsData(token, true);
            setData(prev => ({ ...prev, ...result }));
        } catch (error) {
            setStatus({
                loading: false,
                error: `Ошибка при загрузке данных: ${error.message || error.status}`
            });
        } finally {
            setStatus(prev => ({ ...prev, loading: false }));
        }
    }, [token]);

    useEffect(() => { loadData(); }, [loadData]);

    const filteredData = useMemo(() => {
        const websiteIds = utils.getWebsiteIds(data.goods);

        if (!filters.showMissing) {
            const activeGoods = utils.filterActive(data.goods, filters.goodsActive);
            const searchedGoods = searchByNameAndVendor(activeGoods, filters.search);
            const matched1C = utils.filterByWebsite(data.goods1C, websiteIds);
            const searched1C = searchGoods1C(matched1C, filters.search);

            return {
                goods: searchedGoods,
                goods1C: searched1C,
                totalPages: 1
            };
        }

        const missingGoods = utils.filterMissingGoods(data.goods1C, websiteIds);
        const searchedGoods = searchGoods1C(missingGoods, filters.search);
        const enrichedGoods = utils.enrichGoodsWithCategories(searchedGoods, data.categories);

        const totalPages = Math.ceil(enrichedGoods.length / ITEMS_PER_PAGE);
        const paginatedGoods = enrichedGoods.slice(
            (filters.page - 1) * ITEMS_PER_PAGE,
            filters.page * ITEMS_PER_PAGE
        );

        return {
            goods: [],
            goods1C: paginatedGoods,
            totalPages
        };
    }, [data, filters]);

    const handleSearchChange = useCallback((e) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    }, []);

    const handleToggle = useCallback((field) => () => {
        setFilters(prev => ({
            ...prev,
            [field]: !prev[field],
            page: 1
        }));
    }, []);

    return (
        <Page label="Сравнение товаров">
            <Box className="flex flex-col h-full">
                {/* Фиксированная панель управления */}
                <Box className="flex flex-row gap-2 p-3 border bg-zinc-900/50 border-amber-500/20 rounded sticky top-0 z-10">
                    {status.loading && <CircularProgress color="info" size={20} />}
                    {status.error && <Alert severity="error">{status.error}</Alert>}

                    <TextField
                        label="Поиск по наименованию/артикулу"
                        value={filters.search}
                        onChange={handleSearchChange}
                        size="small"
                        className="flex-1"
                    />

                    <TextField
                        label="Категории"
                        disabled
                        value={data.categories?.length}
                        size="small"
                        sx={{width: 80}}
                    />
                    <TextField
                        label="Товары"
                        disabled
                        value={filteredData.goods?.length}
                        size="small"
                        sx={{width: 80}}
                    />
                    <TextField
                        label="Товары 1С"
                        disabled
                        value={filteredData.goods1C?.length}
                        size="small"
                        sx={{width: 80}}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={filters.showMissing}
                                color="warning"
                                onChange={handleToggle('showMissing')}
                            />
                        }
                        label="Показать отсутствующие товары"
                    />

                    {!filters.showMissing && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={filters.goodsActive}
                                    color="success"
                                    onChange={handleToggle('goodsActive')}
                                />
                            }
                            label={`${filters.goodsActive ? "А" : "Не а"}ктивные товары`}
                        />
                    )}
                </Box>

                {/* Контент со скроллом */}
                <Box className="flex-1 min-h-0 bg-zinc-900/50 border-amber-500/20 rounded">
                    {!filters.showMissing ? (
                        <ProductsList
                            goods={filteredData.goods}
                            categories={data.categories}
                            feed={data.feed}
                            goods1C={data.goods1C}
                        />
                    ) : (
                        <Box className="flex flex-col h-full">
                            {/* Скроллируемый список товаров */}
                            <Box className="flex-1 overflow-auto">
                                <Products1CList goods={filteredData.goods1C} />
                            </Box>

                            {/* Фиксированная пагинация внизу */}
                            {filteredData.totalPages > 1 && (
                                <Box className="sticky bottom-0 flex justify-center p-4 bg-zinc-900/90 border-t border-amber-500/20">
                                    <Pagination
                                        count={filteredData.totalPages}
                                        page={filters.page}
                                        onChange={(_, value) => setFilters(prev => ({ ...prev, page: value }))}
                                        color="primary"
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </Page>
    );
}