import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { ANALYSIS_MODES, MATCHING_STATUSES } from '../constants/goodsAnalysisConstants';

export const useExportToExcel = (filteredGoods, selectedMode, selectedStatus) => {
    // Экспорт в Excel
    const exportToExcel = useCallback(() => {
        // Общий формат данных для экспорта
        const formatDataForExport = (items) => items.map(item => {
            const baseData = {
                'Наименование': item.name || '',
                'GUID/XML_ID': item.guid || '',
                'Артикул': item.vendor_code || '',
                'Категория': item.category || '',
                'Статус': Array.isArray(item.subStatus) ? item.subStatus.join(', ') : item.subStatus || '',
                'Источник': item.source || ''
            };
            
            // Добавляем специфичные данные в зависимости от статуса
            if (item.source === 'Оба') {
                if (item.subStatus?.includes(MATCHING_STATUSES.CATEGORY_MISMATCH) && item.siteData && item.data1C) {
                    baseData['Категория сайта'] = item.siteData.CATEGORY_XML_ID || '';
                    baseData['Категория 1С'] = item.data1C.category || '';
                }
                
                if (item.subStatus?.includes(MATCHING_STATUSES.ARTICLE_MISMATCH) && item.siteData && item.data1C) {
                    baseData['Артикул сайта'] = item.siteData.ARTICLE || '';
                    baseData['Артикул 1С'] = item.data1C.vendor_code || '';
                }
                
                if (item.subStatus?.includes(MATCHING_STATUSES.NAME_MISMATCH) && item.siteData && item.data1C) {
                    baseData['Наименование сайта'] = item.siteData.NAME || '';
                    baseData['Наименование 1С'] = item.data1C.name || '';
                }
            }
            
            // Добавляем информацию о сопоставлении для товаров только на сайте или только в 1С
            if (item.compareData) {
                if (item.status === ANALYSIS_MODES.ONLY_SITE) {
                    baseData['Похожий артикул 1С'] = item.compareData.vendor_code || '';
                    baseData['Похожее наименование 1С'] = item.compareData.name || '';
                } else if (item.status === ANALYSIS_MODES.ONLY_1C) {
                    baseData['Похожий артикул сайта'] = item.compareData.ARTICLE || '';
                    baseData['Похожее наименование сайта'] = item.compareData.NAME || '';
                }
            }
            
            return baseData;
        });

        // Форматирование данных для сайта
        const formatSiteDataForExport = (items) => items.filter(item => 
            item.source === 'Сайт' || item.source === 'Оба'
        ).map(item => ({
            'Наименование': item.name || '',
            'XML_ID': item.guid || '',
            'Артикул': item.vendor_code || '',
            'Категория': item.category || '',
            'Активность': item.active ? 'Да' : 'Нет'
        }));

        // Форматирование данных для 1С
        const format1CDataForExport = (items) => items.filter(item => 
            item.source === '1C' || item.source === 'Оба'
        ).map(item => ({
            'Наименование': item.name || '',
            'GUID': item.guid || '',
            'Артикул': item.vendor_code || '',
            'Категория': item.category || ''
        }));

        const wb = XLSX.utils.book_new();
        let dataToExport = filteredGoods;

        if (selectedMode) {
            // Если выбран конкретный режим, создаем специализированные листы
            
            // Основной лист для выбранного режима
            const wsMain = XLSX.utils.json_to_sheet(formatDataForExport(dataToExport));
            XLSX.utils.book_append_sheet(wb, wsMain, selectedMode);
            
            // Если выбран подстатус, создаем отдельный лист для подстатуса
            if (selectedStatus) {
                const statusData = dataToExport.filter(item => 
                    Array.isArray(item.subStatus) 
                        ? item.subStatus.includes(selectedStatus) 
                        : item.subStatus === selectedStatus
                );
                
                if (statusData.length > 0) {
                    const wsStatus = XLSX.utils.json_to_sheet(formatDataForExport(statusData));
                    XLSX.utils.book_append_sheet(wb, wsStatus, `${selectedMode} - ${selectedStatus}`);
                }
            } else {
                // Если подстатус не выбран, создаем отдельные листы для каждого подстатуса
                const statusesMap = new Map();
                
                dataToExport.forEach(item => {
                    const statuses = Array.isArray(item.subStatus) ? item.subStatus : [item.subStatus];
                    statuses.forEach(subStatus => {
                        if (!statusesMap.has(subStatus)) {
                            statusesMap.set(subStatus, []);
                        }
                        statusesMap.get(subStatus).push(item);
                    });
                });
                
                statusesMap.forEach((items, subStatus) => {
                    if (items.length > 0) {
                        const wsStatus = XLSX.utils.json_to_sheet(formatDataForExport(items));
                        const sheetName = subStatus ? `${selectedMode} - ${subStatus.slice(0, 25)}` : selectedMode;
                        XLSX.utils.book_append_sheet(wb, wsStatus, sheetName);
                    }
                });
            }
        } else {
            // Создаем общие листы, если режим не выбран
            
            // Лист с товарами сайта
            const siteItems = formatSiteDataForExport(dataToExport);
            if (siteItems.length > 0) {
                const siteSheet = XLSX.utils.json_to_sheet(siteItems);
                XLSX.utils.sheet_add_aoa(siteSheet, [[`Всего товаров на сайте: ${siteItems.length}`]], { origin: -1 });
                XLSX.utils.book_append_sheet(wb, siteSheet, 'Товары сайта');
            }

            // Лист с товарами 1С
            const items1C = format1CDataForExport(dataToExport);
            if (items1C.length > 0) {
                const oneCSheet = XLSX.utils.json_to_sheet(items1C);
                XLSX.utils.sheet_add_aoa(oneCSheet, [[`Всего товаров в 1С: ${items1C.length}`]], { origin: -1 });
                XLSX.utils.book_append_sheet(wb, oneCSheet, 'Товары 1С');
            }

            // Создаем отдельные листы по режимам анализа
            Object.entries(ANALYSIS_MODES).forEach(([mode, label]) => {
                const modeItems = dataToExport.filter(item => item.status === mode);
                if (modeItems.length > 0) {
                    const modeSheet = XLSX.utils.json_to_sheet(formatDataForExport(modeItems));
                    XLSX.utils.sheet_add_aoa(modeSheet, [[`${label}: ${modeItems.length}`]], { origin: -1 });
                    XLSX.utils.book_append_sheet(wb, modeSheet, label);
                }
            });

            // Добавляем общий лист со всеми товарами
            const totalSheet = XLSX.utils.json_to_sheet(formatDataForExport(dataToExport));
            XLSX.utils.sheet_add_aoa(totalSheet, [[`Общее количество товаров: ${dataToExport.length}`]], { origin: -1 });
            XLSX.utils.book_append_sheet(wb, totalSheet, 'Все товары');
        }

        // Формируем имя файла в зависимости от выбранного режима и статуса
        let fileName = 'Анализ_товаров';
        if (selectedMode) {
            fileName += `_${selectedMode}`;
            if (selectedStatus) {
                fileName += `_${selectedStatus.replace(/\s+/g, '_')}`;
            }
        } else {
            fileName += '_полный';
        }
        fileName += '.xlsx';

        XLSX.writeFile(wb, fileName);
    }, [filteredGoods, selectedMode, selectedStatus]);

    return { exportToExcel };
}; 