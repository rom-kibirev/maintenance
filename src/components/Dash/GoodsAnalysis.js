import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    Pagination
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Page from '../UI/Theme/Page';
import { fetchAllGoods } from '../UI/global/sortTools';

const ITEMS_PER_PAGE = 50;

const CopyButton = ({ text }) => (
    <Tooltip title="Копировать">
        <IconButton 
            size="small" 
            onClick={() => navigator.clipboard.writeText(text)}
        >
            <ContentCopyIcon fontSize="small" />
        </IconButton>
    </Tooltip>
);

export default function GoodsAnalysis({ token }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Загрузка данных
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const result = await fetchAllGoods(
                    () => {},
                    token
                );
                
                // Подготавливаем данные сразу при загрузке
                const siteGoodsMap = new Map(result.siteGoods.map(item => [item.XML_ID, item]));
                const goods1CMap = new Map(result.goods1C.map(item => [item.guid, item]));
                
                const preparedData = {
                    siteGoods: result.siteGoods,
                    goods1C: result.goods1C,
                    stats: {
                        site: {
                            total: result.siteGoods.length,
                            inactive: result.siteGoods.filter(item => item.ACTIVE === false),
                            withoutCategory: result.siteGoods.filter(item => !item.CATEGORY_ID),
                            notFoundIn1C: result.siteGoods.filter(item => !goods1CMap.has(item.XML_ID))
                        },
                        goods1C: {
                            total: result.goods1C.length,
                            withoutCategory: result.goods1C.filter(item => !item.category),
                            notFoundOnSite: result.goods1C.filter(item => !siteGoodsMap.has(item.guid))
                        }
                    }
                };

                setData(preparedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) loadData();
    }, [token]);

    // Получаем отфильтрованные элементы
    const getFilteredItems = () => {
        if (!data || !selectedFilter) return [];

        switch (selectedFilter) {
            case 'inactive':
                return data.stats.site.inactive;
            case 'withoutCategory':
                return data.stats.site.withoutCategory;
            case 'notFoundIn1C':
                return data.stats.site.notFoundIn1C;
            case 'goods1CWithoutCategory':
                return data.stats.goods1C.withoutCategory;
            case 'notFoundOnSite':
                return data.stats.goods1C.notFoundOnSite;
            default:
                return [];
        }
    };

    // Активация товаров
    const handleActivateAll = async () => {
        if (!data?.stats.site.inactive.length) return;

        try {
            // Здесь будет запрос к API для активации
            const updatedSiteGoods = data.siteGoods.map(good => 
                data.stats.site.inactive.some(item => item.ID === good.ID)
                    ? { ...good, ACTIVE: true }
                    : good
            );

            // Обновляем состояние с новыми данными
            setData(prevData => ({
                ...prevData,
                siteGoods: updatedSiteGoods,
                stats: {
                    ...prevData.stats,
                    site: {
                        ...prevData.stats.site,
                        inactive: []
                    }
                }
            }));

            if (selectedFilter === 'inactive') {
                setSelectedFilter('');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <Page label="Анализ товаров">
                <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress color="warning" />
                    <Typography sx={{ mt: 1 }}>
                        Загрузка данных...
                    </Typography>
                </Box>
            </Page>
        );
    }

    if (error) {
        return (
            <Page label="Анализ товаров">
                <Alert severity="error">{error}</Alert>
            </Page>
        );
    }

    if (!data) {
        return (
            <Page label="Анализ товаров">
                <Typography>Нет данных</Typography>
            </Page>
        );
    }

    const filteredItems = getFilteredItems();
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const currentItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <Page label="Анализ товаров">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Статистика товаров с сайта */}
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Товары с сайта:</Typography>
                    <Typography>Всего: {data.stats.site.total}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>Выключены: {data.stats.site.inactive.length}</Typography>
                        {data.stats.site.inactive.length > 0 && (
                            <Button
                                variant="contained"
                                color="warning"
                                size="small"
                                onClick={handleActivateAll}
                            >
                                Включить все
                            </Button>
                        )}
                    </Box>
                    <Typography>Без категорий: {data.stats.site.withoutCategory.length}</Typography>
                    <Typography>Не найдены в 1С: {data.stats.site.notFoundIn1C.length}</Typography>
                </Paper>

                {/* Статистика товаров из 1С */}
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Товары из 1С:</Typography>
                    <Typography>Всего: {data.stats.goods1C.total}</Typography>
                    <Typography>Без категорий: {data.stats.goods1C.withoutCategory.length}</Typography>
                    <Typography>Отсутствуют на сайте: {data.stats.goods1C.notFoundOnSite.length}</Typography>
                </Paper>

                {/* Фильтры и таблица */}
                <Paper sx={{ p: 2 }}>
                    <Select
                        value={selectedFilter}
                        onChange={(e) => {
                            setSelectedFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        size="small"
                        sx={{ minWidth: 300, mb: 2 }}
                        displayEmpty
                    >
                        <MenuItem value="">Выберите фильтр</MenuItem>
                        <MenuItem value="inactive">Выключенные товары ({data.stats.site.inactive.length})</MenuItem>
                        <MenuItem value="withoutCategory">Товары без категорий ({data.stats.site.withoutCategory.length})</MenuItem>
                        <MenuItem value="notFoundIn1C">Не найдены в 1С ({data.stats.site.notFoundIn1C.length})</MenuItem>
                        <MenuItem value="goods1CWithoutCategory">Товары 1С без категорий ({data.stats.goods1C.withoutCategory.length})</MenuItem>
                        <MenuItem value="notFoundOnSite">Отсутствуют на сайте ({data.stats.goods1C.notFoundOnSite.length})</MenuItem>
                    </Select>

                    {currentItems.length > 0 && (
                        <>
                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Название</TableCell>
                                            <TableCell>Артикул</TableCell>
                                            <TableCell>Категория</TableCell>
                                            <TableCell>XML_ID</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentItems.map((item) => (
                                            <TableRow key={item.ID || item.guid}>
                                                <TableCell>
                                                    {item.ID || item.guid}
                                                    <CopyButton text={item.ID || item.guid} />
                                                </TableCell>
                                                <TableCell>
                                                    {item.NAME || item.name}
                                                    <CopyButton text={item.NAME || item.name} />
                                                </TableCell>
                                                <TableCell>
                                                    {item.article || '-'}
                                                    {item.article && <CopyButton text={item.article} />}
                                                </TableCell>
                                                <TableCell>
                                                    {item.CATEGORY_ID || item.category || '-'}
                                                    {(item.CATEGORY_ID || item.category) && 
                                                        <CopyButton text={item.CATEGORY_ID || item.category} />
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {item.XML_ID || item.guid || '-'}
                                                    {(item.XML_ID || item.guid) && 
                                                        <CopyButton text={item.XML_ID || item.guid} />
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Pagination 
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={(_, page) => setCurrentPage(page)}
                                        color="warning"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Paper>
            </Box>
        </Page>
    );
} 