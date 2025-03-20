import React, { useMemo } from 'react';
import { Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { TableVirtuoso } from 'react-virtuoso';
import { MATCHING_STATUSES, ONLY_SITE_STATUSES, ONLY_1C_STATUSES } from '../constants/goodsAnalysisConstants';

// Оптимизированный компонент для отображения ячейки с различиями
const DifferenceCell = React.memo(({ siteValue, oneСValue, label1 = 'Сайт:', label2 = '1С:' }) => (
    <>
        <Typography variant="body2" sx={{ color: '#ff9800' }}>{label1} {siteValue}</Typography>
        <Typography variant="body2" sx={{ color: '#ff9800' }}>{label2} {oneСValue}</Typography>
    </>
));

// Оптимизированный компонент для отображения статуса
const StatusChip = React.memo(({ status }) => {
    // Определение цвета фона по статусу
    // const bgColor = STATUS_COLORS[status] || '#757575';
    
    return (
        <Chip
            label={status}
            size="small"
            sx={{
                bgcolor: '#ff9800',
                color: 'white'
            }}
        />
    );
});

// Компонент пустого состояния таблицы
const EmptyTableState = React.memo(({ message }) => (
    <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e', height: '600px' }}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell style={{ backgroundColor: '#2e2e2e', color: '#ffffff' }}>Наименование</TableCell>
                    <TableCell style={{ backgroundColor: '#2e2e2e', color: '#ffffff' }}>GUID/XML_ID</TableCell>
                    <TableCell style={{ backgroundColor: '#2e2e2e', color: '#ffffff' }}>Категория</TableCell>
                    <TableCell style={{ backgroundColor: '#2e2e2e', color: '#ffffff' }}>Статус</TableCell>
                    <TableCell style={{ backgroundColor: '#2e2e2e', color: '#ffffff' }}>Источник</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: '#ffffff', padding: '30px' }}>
                        <Typography variant="subtitle1">{message || 'Нет данных для отображения'}</Typography>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>
));

const VirtualizedTable = ({ items, emptyMessage }) => {
    // Проверка на наличие данных
    console.log('VirtualizedTable render:', { itemsCount: items?.length });
    
    // Мемоизируем компоненты таблицы
    const TableComponents = useMemo(() => ({
        Scroller: React.forwardRef((props, ref) => (
            <TableContainer component={Paper} {...props} ref={ref} sx={{ backgroundColor: '#1e1e1e' }} />
        )),
        Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
        TableHead: TableHead,
        TableRow: TableRow,
        TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
    }), []);

    // Мемоизируем заголовок таблицы
    const fixedHeaderContent = useMemo(() => () => (
        <TableRow>
            <TableCell style={{ width: '35%', backgroundColor: '#2e2e2e', color: '#ffffff' }}>Наименование</TableCell>
            <TableCell style={{ width: '20%', backgroundColor: '#2e2e2e', color: '#ffffff' }}>GUID/XML_ID</TableCell>
            <TableCell style={{ width: '25%', backgroundColor: '#2e2e2e', color: '#ffffff' }}>Категория</TableCell>
            <TableCell style={{ width: '10%', backgroundColor: '#2e2e2e', color: '#ffffff' }}>Статус</TableCell>
            <TableCell style={{ width: '10%', backgroundColor: '#2e2e2e', color: '#ffffff' }}>Источник</TableCell>
        </TableRow>
    ), []);
    
    // Если нет данных, показываем сообщение
    if (!items || items.length === 0) {
        return <EmptyTableState message={emptyMessage} />;
    }

    // Мемоизируем рендер содержимого строки
    const rowContent = (index, item) => {
        // Определение дополнительных данных для отображения
        let categoryDisplay = item.category;
        let nameDisplay = item.name;
        
        // Подготовка дополнительных данных для отображения в ячейках при различных статусах
        if (item.source === 'Оба') {
            if (item.subStatus?.includes(MATCHING_STATUSES.CATEGORY_MISMATCH) && item.siteData && item.data1C) {
                categoryDisplay = (
                    <DifferenceCell 
                        siteValue={item.siteData.CATEGORY_XML_ID} 
                        oneСValue={item.data1C.category} 
                    />
                );
            }
            
            if (item.subStatus?.includes(MATCHING_STATUSES.NAME_MISMATCH) && item.siteData && item.data1C) {
                nameDisplay = (
                    <DifferenceCell 
                        siteValue={item.siteData.NAME} 
                        oneСValue={item.data1C.name} 
                    />
                );
            }
        }
        
        // Отображение сравнения данных для товаров только на сайте или только в 1С
        if (item.compareData) {
            if (item.subStatus === ONLY_SITE_STATUSES.NAME_MATCH || item.subStatus === ONLY_1C_STATUSES.NAME_MATCH) {
                nameDisplay = (
                    <DifferenceCell 
                        siteValue={item.name} 
                        oneСValue={item.compareData.name}
                        label1="Текущий:"
                        label2="Похожий:"
                    />
                );
            }
        }
        
        // Определяем статус для отображения
        const displayStatus = Array.isArray(item.subStatus) ? item.subStatus[0] : item.subStatus;
        
        return (
            <React.Fragment>
                <TableCell sx={{ color: '#ffffff' }}>{nameDisplay}</TableCell>
                <TableCell sx={{ color: '#ffffff' }}>{item.guid}</TableCell>
                <TableCell sx={{ color: '#ffffff' }}>{categoryDisplay}</TableCell>
                <TableCell>
                    <StatusChip status={displayStatus} />
                </TableCell>
                <TableCell sx={{ color: '#ffffff' }}>{item.source}</TableCell>
            </React.Fragment>
        );
    };

    return (
        <TableVirtuoso
            style={{ height: '600px' }}
            data={items}
            components={TableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={rowContent}
            // Уменьшаем высоту строки для оптимизации
            overscan={20}
            // Предзагрузка данных
            totalCount={items.length}
            // Оптимизация для виртуального скроллинга
            increaseViewportBy={{ top: 200, bottom: 200 }}
        />
    );
};

export default React.memo(VirtualizedTable); 