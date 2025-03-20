import React, { useEffect, useRef } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import { useInView } from 'react-intersection-observer';

const STATUS_COLORS = {
    'OK': '#4caf50',
    'Не активен': '#ff9800',
    'Не совпадают категории': '#f44336',
    'Не совпадают имена': '#e91e63',
    'Нет на сайте': '#9c27b0'
};

export default function GoodsComparisonList({ items, onLoadMore, hasMore, loading }) {
    const { ref, inView } = useInView({
        threshold: 0,
    });

    useEffect(() => {
        if (inView && hasMore && !loading) {
            onLoadMore();
        }
    }, [inView, hasMore, loading, onLoadMore]);

    return (
        <Box className="h-full overflow-auto">
            <TableContainer component={Paper} className="bg-transparent">
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Артикул</TableCell>
                            <TableCell>Наименование</TableCell>
                            <TableCell>Категория</TableCell>
                            <TableCell>Статус</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={`${item.guid || item.vendor_code}-${index}`}>
                                <TableCell>{item.vendor_code}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>{item.status}</TableCell>
                            </TableRow>
                        ))}
                        {hasMore && (
                            <TableRow ref={ref}>
                                <TableCell colSpan={4} align="center">
                                    {loading && <CircularProgress size={24} />}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
} 