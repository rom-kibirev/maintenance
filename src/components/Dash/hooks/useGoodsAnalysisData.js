import { useState, useCallback, useRef } from 'react';
import { fetchGoodsData } from '../../UI/global/sortTools';
import { loadGoodsRange, getTotalParts } from '../../Goods/goodsLoader';
import { ANALYSIS_MODES, MATCHING_STATUSES, ONLY_SITE_STATUSES, ONLY_1C_STATUSES } from '../constants/goodsAnalysisConstants';

// Константы для оптимизации загрузки
const BATCH_SIZE = 2; // Уменьшаем размер батча с 5 до 2
const ANALYSIS_BATCH_SIZE = 500; // Уменьшаем размер анализа с 1000 до 500
const DEBOUNCE_TIMEOUT = 50; // Уменьшаем задержку со 100 до 50мс
const MAX_PARALLEL_REQUESTS = 3; // Максимальное количество параллельных запросов

/**
 * Отложенное выполнение функции, чтобы не блокировать UI
 * @param {Function} fn Функция для выполнения
 * @param {number} timeout Таймаут в мс
 */
const deferExecution = (fn, timeout = 0) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const result = fn();
            resolve(result);
        }, timeout);
    });
};

export const useGoodsAnalysisData = ({ token, setStatus }) => {
    const [goods, setGoods] = useState([]);
    const [filteredGoods, setFilteredGoods] = useState([]);
    const abortControllerRef = useRef(null);
    const [statistics, setStatistics] = useState({
        totalSite: 0,
        total1C: 0,
        inactive: 0,
        matching: {
            total: 0,
            categoryMismatch: 0,
            nameMismatch: 0,
            noProblems: 0
        },
        onlySite: {
            total: 0,
            nameMatch: 0,
            noMatches: 0,
            noArticle: 0
        },
        only1C: {
            total: 0,
            nameMatch: 0,
            noMatches: 0,
            noArticle: 0
        }
    });

    // Отмена предыдущих операций при новой загрузке
    const cancelPreviousOperations = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        return abortControllerRef.current.signal;
    };

    // Загрузка данных с сайта
    const fetchSiteData = useCallback(async (signal) => {
        if (!token) throw new Error('Отсутствует токен авторизации');
        
        setStatus(prev => ({ 
            ...prev, 
            progress: 10,
            message: 'Загрузка данных с сайта'
        }));
        
        try {
            const apiData = await fetchGoodsData(token);
            
            if (signal.aborted) {
                throw new Error('Операция отменена');
            }
            
            // Оптимизация: сохраняем только необходимые поля для экономии памяти
            const optimizedGoods = apiData.goods.map(g => ({
                XML_ID: g.XML_ID,
                NAME: g.NAME,
                ARTICLE: g.ARTICLE,
                CATEGORY_XML_ID: g.CATEGORY_XML_ID,
                ACTIVE: g.ACTIVE,
                SORT: g.SORT || '500'
            }));
            
            // Логирование активности товаров для отладки
            console.log('Примеры товаров с сайта:', optimizedGoods.slice(0, 5));
            
            setStatus(prev => ({ 
                ...prev, 
                progress: 33,
                message: `Загружено ${optimizedGoods.length} товаров с сайта`
            }));
            
            return optimizedGoods;
        } catch (error) {
            if (error.message !== 'Операция отменена') {
                throw error;
            }
            return [];
        }
    }, [token, setStatus]);

    // Оптимизированная функция загрузки батча
    const processBatchLoad = async (startIndex, endIndex, totalParts, goods1C, signal) => {
        const batchPromises = [];
        
        // Ограничиваем количество параллельных запросов
        for (let j = startIndex; j < Math.min(endIndex, totalParts + 1); j++) {
            if (signal.aborted) {
                throw new Error('Операция отменена');
            }
            
            const promise = loadGoodsRange(j, j)
                .then(batch => {
                    if (batch && batch.length > 0) {
                        // Оптимизируем память, сохраняя только нужные поля
                        return batch.map(item => ({
                            guid: item.guid,
                            name: item.name,
                            vendor_code: item.vendor_code,
                            category: item.category
                        }));
                    }
                    return [];
                });
                
            batchPromises.push(promise);
            
            // Если достигли лимита параллельных запросов, ждем выполнения
            if (batchPromises.length >= MAX_PARALLEL_REQUESTS) {
                const results = await Promise.all(batchPromises);
                results.forEach(optimizedBatch => goods1C.push(...optimizedBatch));
                batchPromises.length = 0; // Очищаем массив
            }
        }
        
        // Обрабатываем оставшиеся запросы
        if (batchPromises.length > 0) {
            const results = await Promise.all(batchPromises);
            results.forEach(optimizedBatch => goods1C.push(...optimizedBatch));
        }
        
        return goods1C.length;
    };

    // Загрузка данных из 1С с оптимизацией
    const fetch1CData = useCallback(async (signal) => {
        setStatus(prev => ({ 
            ...prev, 
            progress: 33,
            message: 'Загрузка данных из 1С'
        }));
        
        // Получаем общее количество частей данных
        const totalParts = await getTotalParts();
        const goods1C = [];
        
        try {
            let totalLoaded = 0;
            
            // Пакетная загрузка с прогрессивным обновлением интерфейса
            for (let i = 1; i <= totalParts; i += BATCH_SIZE) {
                if (signal.aborted) {
                    throw new Error('Операция отменена');
                }
                
                // Загружаем пакет с небольшой задержкой для разгрузки UI
                const batchCount = await deferExecution(async () => {
                    return processBatchLoad(i, i + BATCH_SIZE, totalParts, goods1C, signal);
                }, DEBOUNCE_TIMEOUT);
                
                totalLoaded += batchCount;
                
                // Обновляем прогресс
                const progress = Math.round((i / totalParts) * 100);
                setStatus(prev => ({ 
                    ...prev, 
                    progress: Math.round(33 + (progress * 0.33)),
                    message: `Загружено ${totalLoaded} товаров из 1С`
                }));
            }
            
            console.log('Примеры товаров из 1С:', goods1C.slice(0, 5));
            return goods1C;
        } catch (error) {
            if (error.message !== 'Операция отменена') {
                throw error;
            }
            return [];
        }
    }, [setStatus]);

    // Оптимизированная функция фильтрации
    const filterGoods = useCallback((mode, status, customItems = null) => {
        // Используем Web Worker для фильтрации в фоновом потоке
        const workerCode = `
            self.onmessage = function(e) {
                const { goods, mode, status } = e.data;
                let filtered = [...goods];
                
                // Фильтрация по режиму
                if (mode) {
                    filtered = filtered.filter(item => item.status === mode);
                }
                
                // Фильтрация по статусу
                if (status && status !== 'total') {
                    filtered = filtered.filter(item => {
                        if (Array.isArray(item.subStatus)) {
                            return item.subStatus.includes(status);
                        }
                        return item.subStatus === status;
                    });
                }
                
                self.postMessage(filtered);
            }
        `;

        // Создаем Blob и URL для Worker
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        // Обработка результатов
        worker.onmessage = (e) => {
            setFilteredGoods(e.data);
            
            // Очищаем ресурсы
            URL.revokeObjectURL(workerUrl);
            worker.terminate();
        };

        // Отправляем данные в Worker
        worker.postMessage({
            goods: customItems || goods,
            mode,
            status
        });

        // Логируем параметры фильтрации
        console.log('Параметры фильтрации:', { mode, status, totalItems: (customItems || goods).length });
    }, [goods]);

    // Загрузка данных
    const loadData = useCallback(async () => {
        setStatus({ loading: true, error: null, progress: 0 });
        const signal = cancelPreviousOperations();

        try {
            // Загрузка данных с сайта и из 1С
            const [siteData, data1C] = await Promise.all([
                fetchSiteData(signal),
                fetch1CData(signal)
            ]);

            // Анализ данных
            const analyzedData = await analyzeData(siteData, data1C);
            setGoods(analyzedData);
            setFilteredGoods(analyzedData);
            
            setStatus({ loading: false, error: null, progress: 100 });
        } catch (error) {
            setStatus({ loading: false, error: error.message, progress: 0 });
        }
    }, [setStatus]);

    // Оптимизированная функция анализа данных
    const analyzeData = useCallback(async (siteData, data1C) => {
        const result = [];
        const stats = { ...statistics };
        const batchSize = ANALYSIS_BATCH_SIZE;
        
        // Создаем индексы для быстрого поиска
        const data1CMap = new Map(data1C.map(item => [item.guid, item]));
        const data1CNameMap = new Map();
        data1C.forEach(item => {
            if (item.name) {
                const lowerName = item.name.toLowerCase();
                if (!data1CNameMap.has(lowerName)) {
                    data1CNameMap.set(lowerName, item);
                }
            }
        });

        // Анализируем данные батчами
        for (let i = 0; i < siteData.length; i += batchSize) {
            const batch = siteData.slice(i, i + batchSize);
            
            // Анализ совпадающих товаров
            batch.forEach(siteItem => {
                const match1C = data1CMap.get(siteItem.XML_ID);
                
                if (match1C) {
                    const problems = [];
                    
                    if (siteItem.CATEGORY_XML_ID !== match1C.category) {
                        problems.push(MATCHING_STATUSES.CATEGORY_MISMATCH);
                    }
                    
                    if (siteItem.NAME !== match1C.name) {
                        problems.push(MATCHING_STATUSES.NAME_MISMATCH);
                    }

                    result.push({
                        guid: siteItem.XML_ID,
                        name: siteItem.NAME,
                        category: siteItem.CATEGORY_XML_ID,
                        status: ANALYSIS_MODES.MATCHING,
                        source: 'Оба',
                        subStatus: problems.length ? problems : [MATCHING_STATUSES.NO_PROBLEMS],
                        siteData: siteItem,
                        data1C: match1C
                    });

                    stats.matching.total++;
                    if (problems.includes(MATCHING_STATUSES.CATEGORY_MISMATCH)) stats.matching.categoryMismatch++;
                    if (problems.includes(MATCHING_STATUSES.NAME_MISMATCH)) stats.matching.nameMismatch++;
                    if (!problems.length) stats.matching.noProblems++;
                } else {
                    // Товар только на сайте
                    let subStatus = ONLY_SITE_STATUSES.NO_MATCHES;
                    let compareData = null;

                    // Используем индекс для поиска по имени
                    const similarByName = data1CNameMap.get(siteItem.NAME.toLowerCase());
                    if (similarByName) {
                        subStatus = ONLY_SITE_STATUSES.NAME_MATCH;
                        compareData = similarByName;
                    }

                    if (!siteItem.ARTICLE || siteItem.ARTICLE.trim() === '') {
                        subStatus = ONLY_SITE_STATUSES.NO_ARTICLE;
                    }

                    result.push({
                        guid: siteItem.XML_ID,
                        name: siteItem.NAME,
                        category: siteItem.CATEGORY_XML_ID,
                        status: ANALYSIS_MODES.ONLY_SITE,
                        source: 'Сайт',
                        subStatus,
                        compareData
                    });

                    stats.onlySite.total++;
                    if (subStatus === ONLY_SITE_STATUSES.NAME_MATCH) stats.onlySite.nameMatch++;
                    else if (subStatus === ONLY_SITE_STATUSES.NO_MATCHES) stats.onlySite.noMatches++;
                    else if (subStatus === ONLY_SITE_STATUSES.NO_ARTICLE) stats.onlySite.noArticle++;
                }
            });

            // Даем UI время на обновление
            await deferExecution(() => {}, DEBOUNCE_TIMEOUT);
        }

        // Анализ товаров только в 1С (используем Set для оптимизации поиска)
        const siteGuidSet = new Set(siteData.map(item => item.XML_ID));
        const siteNameMap = new Map();
        siteData.forEach(item => {
            if (item.NAME) {
                const lowerName = item.NAME.toLowerCase();
                if (!siteNameMap.has(lowerName)) {
                    siteNameMap.set(lowerName, item);
                }
            }
        });

        // Обрабатываем товары 1С батчами
        for (let i = 0; i < data1C.length; i += batchSize) {
            const batch = data1C.slice(i, i + batchSize);
            
            batch.forEach(item1C => {
                if (!siteGuidSet.has(item1C.guid)) {
                    let subStatus = ONLY_1C_STATUSES.NO_MATCHES;
                    let compareData = null;

                    // Используем индекс для поиска по имени
                    const similarByName = siteNameMap.get(item1C.name.toLowerCase());
                    if (similarByName) {
                        subStatus = ONLY_1C_STATUSES.NAME_MATCH;
                        compareData = similarByName;
                    }

                    if (!item1C.vendor_code || item1C.vendor_code.trim() === '') {
                        subStatus = ONLY_1C_STATUSES.NO_ARTICLE;
                    }

                    result.push({
                        guid: item1C.guid,
                        name: item1C.name,
                        category: item1C.category,
                        status: ANALYSIS_MODES.ONLY_1C,
                        source: '1C',
                        subStatus,
                        compareData
                    });

                    stats.only1C.total++;
                    if (subStatus === ONLY_1C_STATUSES.NAME_MATCH) stats.only1C.nameMatch++;
                    else if (subStatus === ONLY_1C_STATUSES.NO_MATCHES) stats.only1C.noMatches++;
                    else if (subStatus === ONLY_1C_STATUSES.NO_ARTICLE) stats.only1C.noArticle++;
                }
            });

            // Даем UI время на обновление
            await deferExecution(() => {}, DEBOUNCE_TIMEOUT);
        }

        setStatistics(stats);
        return result;
    }, [statistics]);

    return {
        goods,
        filteredGoods,
        statistics,
        loadData,
        filterGoods
    };
}; 