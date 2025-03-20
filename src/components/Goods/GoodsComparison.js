import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Switch, FormControlLabel, Button, CircularProgress, Alert, TextField, Chip } from '@mui/material';
import { fetchGoodsData } from '../UI/global/sortTools';
import * as XLSX from 'xlsx';
import Page from '../UI/Theme/Page';
import GoodsComparisonList from './GoodsComparisonList';
import SaveIcon from '@mui/icons-material/Save';
import { loadGoodsRange, getTotalParts } from './goodsLoader';

const STATUS_COLORS = {
    'OK': '#4caf50',
    'Найден по артикулу': '#2196f3',
    'Не активен': '#ff9800',
    'Не совпадают категории': '#f44336',
    'Не совпадают имена': '#e91e63',
    'Нет на сайте': '#9c27b0'
};

// const utils = {
//     filterActive: (items, isActive) => items?.filter(g => isActive ? g.ACTIVE : !g.ACTIVE) || [],
//     getWebsiteIds: (websiteGoods) => new Set(websiteGoods.map(g => g.XML_ID)),
//     filterByWebsite: (goods1C, websiteIds) => [...new Set(goods1C.filter(g => websiteIds.has(g.GUID)))],
//     filterMissingGoods: (goods1C, websiteIds) => goods1C.filter(g => !websiteIds.has(g.GUID)),
// };

export default function GoodsComparison({ token }) {
    const [status, setStatus] = useState({ loading: false, error: null });
    const [data, setData] = useState({
        goods: [],
        goods1C: [],
        feed: []
    });
    const [filters, setFilters] = useState({
        comparisonMode: 'log',
        statusFilter: 'all',
        page: 1
    });
    const [loading, setLoading] = useState(false);
    const [currentPart, setCurrentPart] = useState(1);
    const [totalParts, setTotalParts] = useState(1);
    const [loadedGoods, setLoadedGoods] = useState([]);
    const [partsCache, setPartsCache] = useState({});

    // Инициализация данных
    const initializeData = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            setStatus({ loading: true, error: null });

            // Загружаем базовые данные и первую часть товаров параллельно
            const [baseData, total, firstPart] = await Promise.all([
                fetchGoodsData(token),
                getTotalParts(),
                loadGoodsRange(1, 1)
            ]);

            setTotalParts(total);
            setCurrentPart(1);
            setPartsCache({ 1: firstPart });
            setLoadedGoods(firstPart);
            setData({
                ...baseData,
                goods1C: firstPart
            });
        } catch (error) {
            console.error('Error initializing data:', error);
            setStatus({
                loading: false,
                error: `Ошибка при загрузке данных: ${error.message || error}`
            });
        } finally {
            setLoading(false);
            setStatus(prev => ({ ...prev, loading: false }));
        }
    }, [token]);

    // Загрузка следующей части товаров
    const loadMoreGoods = useCallback(async () => {
        if (loading || currentPart >= totalParts) return;

        try {
            setLoading(true);
            const nextPart = currentPart + 1;
            
            // Проверяем кэш
            if (partsCache[nextPart]) {
                setLoadedGoods(prev => [...prev, ...partsCache[nextPart]]);
                setCurrentPart(nextPart);
                setData(prev => ({ ...prev, goods1C: [...prev.goods1C, ...partsCache[nextPart]] }));
                return;
            }

            // Загружаем новую часть
            const newPart = await loadGoodsRange(nextPart, nextPart);
            setLoadedGoods(prev => [...prev, ...newPart]);
            setPartsCache(prev => ({ ...prev, [nextPart]: newPart }));
            setCurrentPart(nextPart);
            setData(prev => ({ ...prev, goods1C: [...prev.goods1C, ...newPart] }));
        } catch (error) {
            console.error('Error loading more goods:', error);
            setStatus(prev => ({
                ...prev,
                error: 'Ошибка при загрузке дополнительных товаров'
            }));
        } finally {
            setLoading(false);
        }
    }, [currentPart, totalParts, loading, partsCache]);

    // Единая точка инициализации
    useEffect(() => {
        initializeData();
    }, [initializeData]);

    // Оптимизированный индекс товаров
    const siteGoodsIndexes = useMemo(() => {
        if (!data.goods?.length) return { guidIndex: new Map(), articleIndex: new Map(), nameIndex: new Map() };

        const indexes = data.goods.reduce((acc, good) => {
            if (good.XML_ID) {
                acc.guidIndex.set(good.XML_ID.toLowerCase(), good);
                acc.guidIndex.set(good.XML_ID.toLowerCase().replace(/[^a-z0-9]/g, ''), good);
            }
            
            if (good.ARTICLE) {
                const normalizedArticle = good.ARTICLE.toLowerCase().replace(/[^a-z0-9]/g, '');
                acc.articleIndex.set(normalizedArticle, good);
            }
            
            if (good.NAME) {
                acc.nameIndex.set(good.NAME.toLowerCase(), good);
            }
            
            return acc;
        }, {
            guidIndex: new Map(),
            articleIndex: new Map(),
            nameIndex: new Map()
        });

        return indexes;
    }, [data.goods]);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            setStatus({ loading: true, error: null });
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rawData = XLSX.utils.sheet_to_json(firstSheet);
                    
                    if (!rawData.length) {
                        throw new Error('Файл не содержит данных');
                    }
                    
                    const jsonData = rawData.map(row => ({
                        guid: row['GUID'] || row['Guid'] || row['guid'] || row['XML_ID'] || row['xml_id'] || '',
                        vendor_code: row['Артикул'] || row['ARTICLE'] || row['article'] || row['vendor_code'] || '',
                        name: row['Наименование'] || row['NAME'] || row['name'] || '',
                        category: row['Категория'] || row['CATEGORY'] || row['category'] || '',
                        brand: row['Бренд'] || row['BRAND'] || row['brand'] || '',
                        country: row['Страна'] || row['COUNTRY'] || row['country'] || '',
                        description: row['Описание'] || row['DESCRIPTION'] || row['description'] || '',
                        waiting_date: row['Дата поступления'] || row['WAITING_DATE'] || row['waiting_date'] || '',
                        features: row['Особенности'] || row['FEATURES'] || row['features'] || [],
                        equipment: row['Комплектация'] || row['EQUIPMENT'] || row['equipment'] || [],
                        parameters: row['Параметры'] || row['PARAMETERS'] || row['parameters'] || [],
                        additional_parameters: row['Доп. параметры'] || row['ADDITIONAL_PARAMETERS'] || [],
                        analogues: row['Аналоги'] || row['ANALOGUES'] || row['analogues'] || [],
                        related: row['Сопутствующие'] || row['RELATED'] || row['related'] || []
                    }));
                    
                    setData(prev => ({ ...prev, goods1C: jsonData }));
                    setFilters(prev => ({ ...prev, page: 1 }));
                } catch (error) {
                    console.error('Ошибка при обработке XLSX файла:', error);
                    setStatus({
                        loading: false,
                        error: "Ошибка при обработке XLSX файла. Проверьте формат файла."
                    });
                } finally {
                    setStatus(prev => ({ ...prev, loading: false }));
                }
            };
            reader.onerror = () => {
                setStatus({
                    loading: false,
                    error: "Ошибка при чтении файла"
                });
            };
            reader.readAsArrayBuffer(file);
        }
    }, []);

    // Обрабатываем и фильтруем товары
    const { filteredGoods, statusCounts } = useMemo(() => {
        const counts = {
            'OK': 0,
            'Найден по артикулу': 0,
            'Не активен': 0,
            'Не совпадают категории': 0,
            'Не совпадают имена': 0,
            'Нет на сайте': 0
        };

        // console.log('Товары из 1С:', data.goods1C);

        // Обогащаем данными с сайта
        const processedGoods = data.goods1C.map(importedGood => {
            let siteGood = null;
            let foundBy = '';

            // 1. Поиск по GUID
            if (importedGood.guid) {
                const guidVariants = [
                    importedGood.guid.toLowerCase(),
                    importedGood.guid.toLowerCase().replace(/[^a-z0-9]/g, '')
                ];

                for (const variant of guidVariants) {
                    siteGood = siteGoodsIndexes.guidIndex.get(variant);
                    if (siteGood) {
                        foundBy = 'GUID';
                        // console.log('Найдено по GUID:', { imported: importedGood.guid, site: siteGood.XML_ID });
                        break;
                    }
                }
            }

            // 2. Поиск по артикулу
            if (!siteGood && importedGood.vendor_code) {
                const articleVariants = [
                    importedGood.vendor_code.toLowerCase(),
                    importedGood.vendor_code.replace(/[\s-]/g, '').toLowerCase(),
                    importedGood.vendor_code.replace(/\s/g, '-').toLowerCase(),
                    importedGood.vendor_code.replace(/[^a-z0-9]/g, '').toLowerCase()
                ];

                for (const variant of articleVariants) {
                    siteGood = siteGoodsIndexes.articleIndex.get(variant);
                    if (siteGood) {
                        foundBy = 'Артикул';
                        // console.log('Найдено по артикулу:', { imported: importedGood.vendor_code, site: siteGood.ARTICLE });
                        break;
                    }
                }
            }

            // 3. Поиск по имени
            if (!siteGood && importedGood.name) {
                siteGood = siteGoodsIndexes.nameIndex.get(importedGood.name.toLowerCase());
                if (siteGood) {
                    foundBy = 'Имя';
                    // console.log('Найдено по имени:', { imported: importedGood.name, site: siteGood.NAME });
                }
            }

            // Отладочная информация
            // console.log('Проверка товара:', {
            //     guid: importedGood.guid,
            //     vendor_code: importedGood.vendor_code,
            //     name: importedGood.name,
            //     found: !!siteGood,
            //     foundBy: foundBy
            // });
            
            if (!siteGood) {
                counts['Нет на сайте']++;
                return {
                    ...importedGood,
                    status: 'Нет на сайте',
                    siteCategory: null,
                    siteName: null,
                    siteArticle: null,
                    foundBy: 'Не найден'
                };
            }

            if (!siteGood.ACTIVE) {
                counts['Не активен']++;
                return {
                    ...importedGood,
                    status: 'Не активен',
                    siteCategory: siteGood.CATEGORY_XML_ID,
                    siteName: siteGood.NAME,
                    siteArticle: siteGood.ARTICLE,
                    foundBy
                };
            }

            if (foundBy === 'Артикул') {
                counts['Найден по артикулу']++;
                return {
                    ...importedGood,
                    status: 'Найден по артикулу',
                    siteCategory: siteGood.CATEGORY_XML_ID,
                    siteName: siteGood.NAME,
                    siteArticle: siteGood.ARTICLE,
                    siteGuid: siteGood.XML_ID,
                    foundBy
                };
            }

            if (siteGood.CATEGORY_XML_ID !== importedGood.category) {
                counts['Не совпадают категории']++;
                return {
                    ...importedGood,
                    status: 'Не совпадают категории',
                    siteCategory: siteGood.CATEGORY_XML_ID,
                    siteName: siteGood.NAME,
                    siteArticle: siteGood.ARTICLE,
                    foundBy
                };
            }

            if (siteGood.NAME !== importedGood.name) {
                counts['Не совпадают имена']++;
                return {
                    ...importedGood,
                    status: 'Не совпадают имена',
                    siteCategory: siteGood.CATEGORY_XML_ID,
                    siteName: siteGood.NAME,
                    siteArticle: siteGood.ARTICLE,
                    foundBy
                };
            }

            counts['OK']++;
            return {
                ...importedGood,
                status: 'OK',
                siteCategory: siteGood.CATEGORY_XML_ID,
                siteName: siteGood.NAME,
                siteArticle: siteGood.ARTICLE,
                foundBy
            };
        });

        // Применяем фильтр
        const filtered = filters.statusFilter === 'all' 
            ? processedGoods 
            : processedGoods.filter(item => item.status === filters.statusFilter);

        return { filteredGoods: filtered, statusCounts: counts };
    }, [data.goods1C, filters.statusFilter, siteGoodsIndexes]);

    // const handlePageChange = useCallback((event, value) => {
    //     setFilters(prev => ({ ...prev, page: value }));
    // }, []);

    const exportToExcel = useCallback(() => {
        setStatus(prev => ({ ...prev, loading: true }));
        
        try {
            const exportData = filteredGoods.map(item => ({
                'Артикул 1С': item.vendor_code || '',
                'Артикул сайта': item.siteArticle || '',
                'GUID 1С': item.guid || '',
                'GUID сайта': item.siteGuid || item.guid || '',
                'Наименование 1С': item.name || '',
                'Наименование сайта': item.siteName || '',
                'Категория 1С': item.category || '',
                'Категория сайта': item.siteCategory || '',
                'Статус': item.status
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Сравнение товаров');
            XLSX.writeFile(wb, 'Сравнение товаров.xlsx');
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            setStatus(prev => ({ 
                ...prev, 
                error: 'Ошибка при экспорте в Excel' 
            }));
        } finally {
            setStatus(prev => ({ ...prev, loading: false }));
        }
    }, [filteredGoods]);

    const saveToJson = useCallback(() => {
        if (filters.statusFilter !== 'Нет на сайте' || !filteredGoods.length) return;

        try {
            setStatus(prev => ({ ...prev, loading: true }));

            // Подготавливаем данные для сохранения
            const jsonData = filteredGoods.map(item => ({
                guid: item.guid,
                vendor_code: item.vendor_code,
                category: item.category,
                name: item.name,
                brand: item.brand,
                country: item.country,
                description: item.description,
                waiting_date: item.waiting_date,
                features: item.features || [],
                equipment: item.equipment || [],
                parameters: item.parameters || [],
                additional_parameters: item.additional_parameters || [],
                analogues: item.analogues || [],
                related: item.related || []
            }));

            // Создаем и скачиваем файл
            const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'goods_not_on_site.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Ошибка при сохранении JSON:', error);
            setStatus(prev => ({ 
                ...prev, 
                error: 'Ошибка при сохранении JSON файла' 
            }));
        } finally {
            setStatus(prev => ({ ...prev, loading: false }));
        }
    }, [filteredGoods, filters.statusFilter]);

    return (
        <Page label="Сравнение товаров">
            <Box className="flex flex-col h-full">
                <Box className="flex flex-row gap-2 p-3 border bg-zinc-900/50 border-amber-500/20 rounded sticky top-0 z-10">
                    {status.loading && <CircularProgress color="info" size={20} />}
                    {status.error && <Alert severity="error">{status.error}</Alert>}

                    <FormControlLabel
                        control={
                            <Switch
                                checked={filters.comparisonMode === 'xlsx'}
                                onChange={(e) => {
                                    const newMode = e.target.checked ? 'xlsx' : 'log';
                                    setFilters(prev => ({ 
                                        ...prev, 
                                        comparisonMode: newMode,
                                        page: 1
                                    }));
                                    // Если переключаемся обратно в режим лога, возвращаем исходные данные
                                    if (newMode === 'log') {
                                        setData(prev => ({
                                            ...prev,
                                            goods1C: loadedGoods
                                        }));
                                    }
                                }}
                            />
                        }
                        label="Режим XLSX"
                    />
                    
                    {filters.comparisonMode === 'xlsx' && (
                        <>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                                id="xlsx-upload"
                            />
                            <label htmlFor="xlsx-upload">
                                <Button variant="contained" component="span">
                                    Загрузить XLSX
                                </Button>
                            </label>
                        </>
                    )}

                    <TextField
                        label="Товары на сайте"
                        disabled
                        value={data.goods?.length || 0}
                        size="small"
                        sx={{width: 120}}
                    />
                    <TextField
                        label="Товары 1С"
                        disabled
                        value={data.goods1C?.length || 0}
                        size="small"
                        sx={{width: 120}}
                    />

                    <Box className="flex gap-2 items-center">
                        {Object.entries(statusCounts).map(([statusName, count]) => (
                            <Chip
                                key={statusName}
                                label={`${statusName}: ${count}`}
                                onClick={() => setFilters(prev => ({ 
                                    ...prev, 
                                    statusFilter: statusName === filters.statusFilter ? 'all' : statusName 
                                }))}
                                sx={{ 
                                    bgcolor: filters.statusFilter === statusName ? STATUS_COLORS[statusName] : 'transparent',
                                    borderColor: STATUS_COLORS[statusName],
                                    border: '1px solid',
                                    '&:hover': {
                                        bgcolor: `${STATUS_COLORS[statusName]}80`
                                    }
                                }}
                            />
                        ))}
                    </Box>

                    <Button 
                        variant="contained" 
                        onClick={exportToExcel}
                        disabled={status.loading}
                    >
                        Экспорт в Excel
                    </Button>

                    {filters.statusFilter === 'Нет на сайте' && filteredGoods.length > 0 && (
                        <Button 
                            variant="contained" 
                            color="secondary"
                            onClick={saveToJson}
                            disabled={status.loading}
                            startIcon={<SaveIcon />}
                        >
                            Сохранить JSON
                        </Button>
                    )}
                </Box>

                <Box className="flex-1 min-h-0 bg-zinc-900/50 border-amber-500/20 rounded">
                    <GoodsComparisonList 
                        items={filteredGoods} 
                        onLoadMore={loadMoreGoods}
                        hasMore={currentPart < totalParts}
                        loading={loading}
                    />
                </Box>
            </Box>
        </Page>
    );
} 