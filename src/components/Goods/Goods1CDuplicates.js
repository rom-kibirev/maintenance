import Page from "../UI/Theme/Page";
import React, {useEffect, useState} from "react";
import {fetchAllGoods} from "../UI/global/sortTools";
import {Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button} from "@mui/material";
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';

export default function Goods1CDuplicates({ token }) {
    const [goods1C, setGoods1C] = useState([]);
    const [duplicates, setDuplicates] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const getData = async () => {
            const { goods1C } = await fetchAllGoods(() => {});

            setGoods1C(goods1C);
            
            // Поиск дубликатов по имени
            const nameMap = new Map();
            const duplicatesList = [];
            
            goods1C.forEach(item => {
                if (!nameMap.has(item.name)) {
                    nameMap.set(item.name, [item]);
                } else {
                    nameMap.get(item.name).push(item);
                }
            });
            
            // Собираем только те товары, у которых есть дубликаты
            nameMap.forEach((items, name) => {
                if (items.length > 1) {
                    duplicatesList.push(...items);
                }
            });
            
            setDuplicates(duplicatesList);
        }

        getData();
    }, []);
    
    if (goods1C) console.log(`\n goods1C`, goods1C);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Группируем дубликаты по имени для отображения в таблице
    const groupedDuplicates = duplicates.reduce((acc, item) => {
        if (!acc[item.name]) {
            acc[item.name] = [];
        }
        acc[item.name].push(item);
        return acc;
    }, {});

    const tableData = Object.values(groupedDuplicates).map(group => ({
        guid1: group[0]?.guid || '',
        name1: group[0]?.name || '',
        guid2: group[1]?.guid || '',
        name2: group[1]?.name || ''
    }));

    const exportToExcel = () => {
        // Создаем рабочую книгу
        const wb = XLSX.utils.book_new();
        
        // Подготавливаем данные для экспорта
        const exportData = tableData.map(row => ({
            'GUID 1': row.guid1,
            'Наименование 1': row.name1,
            'GUID 2': row.guid2,
            'Наименование 2': row.name2
        }));

        // Создаем лист
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Добавляем лист в книгу
        XLSX.utils.book_append_sheet(wb, ws, "Дубликаты");
        
        // Сохраняем файл
        XLSX.writeFile(wb, "Дубликаты_товаров.xlsx");
    };

    return (
        <Page label="Дубли товаров в 1С">
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 2, mb: 2}}>
                <TextField
                    label='Количество товаров'
                    disabled
                    value={goods1C?.length || 0}
                    size="small"
                    sx={{width: 120, mr: 2}}
                />
                <TextField
                    label='Количество дублей'
                    disabled
                    value={duplicates?.length || 0}
                    size="small"
                    sx={{width: 120, mr: 2}}
                />
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={exportToExcel}
                    sx={{ ml: 'auto' }}
                >
                    Выгрузить в Excel
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>GUID 1</TableCell>
                            <TableCell>Наименование 1</TableCell>
                            <TableCell>GUID 2</TableCell>
                            <TableCell>Наименование 2</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.guid1}</TableCell>
                                    <TableCell>{row.name1}</TableCell>
                                    <TableCell>{row.guid2}</TableCell>
                                    <TableCell>{row.name2}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={tableData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Строк на странице:"
                />
            </TableContainer>
        </Page>
    )
}