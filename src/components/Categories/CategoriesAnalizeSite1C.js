import React, { useEffect, useState, useCallback } from "react";
import Page from "../UI/Theme/Page";
import {
    TextField,
    Box,
    Chip,
    MenuItem,
    Select,
    Button,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    CircularProgress,
    IconButton,
    Tooltip,
    TablePagination
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { fetchCategoryData } from "../../requests/api_v2";
import * as XLSX from 'xlsx';

export default function CategoriesComparison({ token }) {
    const [siteCategories, setSiteCategories] = useState([]);
    const [categories1C, setCategories1C] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [statusCounts, setStatusCounts] = useState({
        total: 0,
        total1C: 0,
        totalSite: 0,
        notOnSite: 0,
        notIn1C: 0,
        namesMismatch: 0,
        duplicateNames: 0,
        parentsMismatch: 0,
        ok: 0,
        filteredCount: 0
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const getParentNameFrom1C = useCallback((parentGuid) => {
        if (!parentGuid) return "Корневая категория (1C)";
        const parent1C = categories1C.find(cat => cat.guid === parentGuid);
        return parent1C ? parent1C.name : "Родитель не найден (1C)";
    }, [categories1C]);

    const getParentNameFromSite = useCallback((parentGuid) => {
        if (!parentGuid) return "Корневая категория (Сайт)";
        const siteParent = siteCategories.find(cat => cat.XML_ID === parentGuid);
        return siteParent ? siteParent.NAME : "Родитель не найден (Сайт)";
    }, [siteCategories]);

    const getCategoryStatus = useCallback((category) => {
        if (category.source === "1C") {
            const siteCategory = siteCategories.find(sc => sc.XML_ID === category.guid);
            if (!siteCategory) return "Нет на сайте";
            if (siteCategory.NAME !== category.name1C) return "Не совпадают имена";
            if (siteCategory.XML_PARENT_ID !== category.parent) return "Не совпадают родители";
            return "OK";
        }
        if (category.source === "Сайт") {
            const category1C = categories1C.find(c => c.guid === category.guid);
            if (!category1C) return "Нет в 1С";
            if (category1C.name !== category.nameSite) return "Не совпадают имена";
            if (category1C.parent !== category.parent) return "Не совпадают родители";
            return "OK";
        }
        return "Неизвестный статус";
    }, [siteCategories, categories1C]);

    const checkForDuplicates = useCallback((categories) => {
        const nameCount = {};
        categories.forEach(cat => {
            const name = cat.name1C || cat.nameSite;
            nameCount[name] = (nameCount[name] || 0) + 1;
        });
        return categories.map(cat => {
            const name = cat.name1C || cat.nameSite;
            return { ...cat, isDuplicate: nameCount[name] > 1 };
        });
    }, []);

    // const getDuplicates = useCallback((categoryName) => {
    //     const duplicates = [];
    //     categories1C.forEach(cat => {
    //         if (cat.name === categoryName) {
    //             duplicates.push({ source: "1C", name: cat.name, guid: cat.guid });
    //         }
    //     });
    //     siteCategories.forEach(cat => {
    //         if (cat.NAME === categoryName) {
    //             duplicates.push({ source: "Сайт", name: cat.NAME, guid: cat.XML_ID });
    //         }
    //     });
    //     return duplicates.length > 1 ? duplicates : null;
    // }, [siteCategories, categories1C]);

    const highlightDifference = useCallback((name1, name2) => {
        if (!name1 || !name2) return name1 || name2 || "";
        if (name1 === name2) return name1;
        return (
            <span>
                <span style={{ backgroundColor: "yellow" }}>{name1}</span>
                {" / "}
                <span style={{ backgroundColor: "lightgreen" }}>{name2}</span>
            </span>
        );
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const siteCategoriesResponse = await fetchCategoryData(token);
                if (siteCategoriesResponse.success) {
                    setSiteCategories(siteCategoriesResponse.data);
                }
                const response = await fetch('/data/categories 1C/merged_output.json');
                if (response.ok) {
                    const data = await response.json();
                    const uniqueCategories1C = [];
                    const guidSet = new Set();
                    data.forEach(cat => {
                        if (!guidSet.has(cat.guid)) {
                            guidSet.add(cat.guid);
                            uniqueCategories1C.push(cat);
                        }
                    });
                    setCategories1C(uniqueCategories1C);
                }
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const calculateStatusCounts = useCallback((mergedData, filtered) => {
        const nameCount = {};
        mergedData.forEach(cat => {
            const name = cat.name1C || cat.nameSite;
            nameCount[name] = (nameCount[name] || 0) + 1;
        });
        const duplicateNamesCount = Object.values(nameCount).filter(count => count > 1).length;

        return {
            total: mergedData.length,
            total1C: categories1C.length,
            totalSite: siteCategories.length,
            notOnSite: mergedData.filter(cat => cat.status === "Нет на сайте").length,
            notIn1C: mergedData.filter(cat => cat.status === "Нет в 1С").length,
            namesMismatch: mergedData.filter(cat => cat.status === "Не совпадают имена").length,
            duplicateNames: duplicateNamesCount,
            parentsMismatch: mergedData.filter(cat => cat.status === "Не совпадают родители").length,
            ok: mergedData.filter(cat => cat.status === "OK").length,
            filteredCount: filtered.length
        };
    }, [categories1C, siteCategories]);

    useEffect(() => {
        if (siteCategories.length === 0 || categories1C.length === 0) return;

        setLoading(true);
        const mergedData = [];

        categories1C.forEach(cat1C => {
            const siteMatch = siteCategories.find(siteCat => siteCat.XML_ID === cat1C.guid);
            mergedData.push({
                source: "1C",
                name1C: cat1C.name,
                nameSite: siteMatch ? siteMatch.NAME : null,
                guid: cat1C.guid,
                parent: cat1C.parent,
                parent1C: cat1C.parent,
                parentSite: siteMatch ? siteMatch.XML_PARENT_ID : null,
                hasUcenka: cat1C.name.includes("Уценка")
            });
        });

        siteCategories.forEach(siteCat => {
            const exists1C = categories1C.find(cat1C => cat1C.guid === siteCat.XML_ID);
            if (!exists1C) {
                mergedData.push({
                    source: "Сайт",
                    name1C: null,
                    nameSite: siteCat.NAME,
                    guid: siteCat.XML_ID,
                    parent: siteCat.XML_PARENT_ID,
                    parent1C: null,
                    parentSite: siteCat.XML_PARENT_ID,
                    hasUcenka: siteCat.NAME.includes("Уценка")
                });
            }
        });

        mergedData.forEach(item => {
            item.status = getCategoryStatus(item);
        });

        const updatedData = checkForDuplicates(mergedData);

        let filtered = updatedData;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(cat => cat.status === statusFilter);
        }
        if (searchTerm) {
            filtered = filtered.filter(cat =>
                (cat.name1C && cat.name1C.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (cat.nameSite && cat.nameSite.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (cat.guid && cat.guid.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setStatusCounts(calculateStatusCounts(updatedData, filtered));
        setFilteredCategories(filtered);
        setLoading(false);
    }, [siteCategories, categories1C, statusFilter, searchTerm, getCategoryStatus, checkForDuplicates, calculateStatusCounts]);

    const handleSearchChange = (event) => setSearchTerm(event.target.value);
    const handleStatusChange = (event) => setStatusFilter(event.target.value);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const exportToExcel = () => {
        const dataToExport = filteredCategories.map(category => ({
            "Статус": category.status,
            "Наименование 1C": category.name1C || "",
            "Наименование сайта": category.nameSite || "",
            "GUID": category.guid,
            "Дубликат": category.isDuplicate ? "Да" : "Нет",
            "Родитель 1C": getParentNameFrom1C(category.parent1C),
            "Родитель Сайт": getParentNameFromSite(category.parentSite),
            "Уценка": category.hasUcenka ? "Да" : "Нет"
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Категории");
        XLSX.writeFile(workbook, "categories_comparison.xlsx");
    };

    return (
        <Page label="Сравнение категорий (Сайт и 1C)">
            {loading && (
                <Box sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <CircularProgress size={60} />
                </Box>
            )}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Статистика категорий</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Paper sx={{ p: 1, minWidth: '120px' }}><Typography variant="body2">Всего категорий</Typography><Typography variant="h6">{statusCounts.total}</Typography></Paper>
                        <Paper sx={{ p: 1, minWidth: '120px' }}><Typography variant="body2">Категорий в 1C</Typography><Typography variant="h6">{statusCounts.total1C}</Typography></Paper>
                        <Paper sx={{ p: 1, minWidth: '120px' }}><Typography variant="body2">Категорий на сайте</Typography><Typography variant="h6">{statusCounts.totalSite}</Typography></Paper>
                        <Paper sx={{ p: 1, minWidth: '120px', bgcolor: 'success.light' }}><Typography variant="body2">OK</Typography><Typography variant="h6">{statusCounts.ok}</Typography></Paper>
                        <Paper sx={{ p: 1, minWidth: '120px', bgcolor: 'error.light' }}><Typography variant="body2">Нет на сайте</Typography><Typography variant="h6">{statusCounts.notOnSite}</Typography></Paper>
                        <Paper sx={{ p: 1, minWidth: '120px', bgcolor: 'warning.light' }}><Typography variant="body2">Нет в 1C</Typography><Typography variant="h6">{statusCounts.notIn1C}</Typography></Paper>
                        <Paper sx={{ p: 1, minWidth: '120px', bgcolor: 'info.light' }}><Typography variant="body2">Не совпадают имена</Typography><Typography variant="h6">{statusCounts.namesMismatch}</Typography></Paper>
                        <Paper sx={{ p: 1, minWidth: '120px', bgcolor: 'secondary.light' }}><Typography variant="body2">Дубликаты имен</Typography><Typography variant="h6">{statusCounts.duplicateNames}</Typography></Paper>
                        <Paper sx={{ p: 1, minWidth: '120px', bgcolor: 'info.light' }}><Typography variant="body2">Не совпадают родители</Typography><Typography variant="h6">{statusCounts.parentsMismatch}</Typography></Paper>
                        <Paper sx={{ p: 1, minWidth: '120px', bgcolor: 'primary.light' }}><Typography variant="body2">Отфильтровано</Typography><Typography variant="h6">{statusCounts.filteredCount}</Typography></Paper>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="Поиск по названию или GUID" variant="outlined" value={searchTerm} onChange={handleSearchChange} />
                        <FormControl fullWidth>
                            <InputLabel>Фильтр по статусу</InputLabel>
                            <Select value={statusFilter} onChange={handleStatusChange} label="Фильтр по статусу">
                                <MenuItem value="all">Все</MenuItem>
                                <MenuItem value="Нет на сайте">Нет на сайте</MenuItem>
                                <MenuItem value="Нет в 1С">Нет в 1С</MenuItem>
                                <MenuItem value="Не совпадают имена">Не совпадают имена</MenuItem>
                                <MenuItem value="Не совпадают родители">Не совпадают родители</MenuItem>
                                <MenuItem value="OK">OK</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" color="primary" onClick={exportToExcel} disabled={filteredCategories.length === 0}>
                            Выгрузить в Excel
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Статус</TableCell>
                            <TableCell>Наименование (Сайт/1C)</TableCell>
                            <TableCell>GUID/XML_ID</TableCell>
                            <TableCell>Дубликат</TableCell>
                            <TableCell>Родитель (1C / Сайт)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCategories
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((category, index) => (
                                <TableRow key={index} sx={{ bgcolor: category.hasUcenka ? 'rgba(255,150,150,0.4)' : '' }}>
                                    <TableCell>
                                        <Chip
                                            label={category.status}
                                            color={
                                                category.status === "OK" ? "success" :
                                                    category.status === "Нет на сайте" ? "error" :
                                                        category.status === "Нет в 1С" ? "warning" : "info"
                                            }
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {category.status === "Не совпадают имена"
                                            ? highlightDifference(category.nameSite, category.name1C)
                                            : (category.nameSite || category.name1C)}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2">{category.guid}</Typography>
                                            <Tooltip title="Копировать GUID">
                                                <IconButton size="small" onClick={() => copyToClipboard(category.guid)}>
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {category.isDuplicate && (
                                            <Box>
                                                <Chip label="Дубликат" color="secondary" size="small" sx={{ mb: 1 }} />
                                                {category.duplicates && category.duplicates.map((dup, i) => (
                                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                        <Typography variant="caption" display="block">
                                                            {dup.source}: {dup.name} ({dup.guid.substring(0, 8)}...)
                                                        </Typography>
                                                        <Tooltip title="Копировать GUID">
                                                            <IconButton size="small" onClick={() => copyToClipboard(dup.guid)}>
                                                                <ContentCopyIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {category.status === "Не совпадают родители" ? (
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                    <Typography variant="body2" sx={{ color: 'red', mr: 1 }}>
                                                        1C: {getParentNameFrom1C(category.parent1C)}
                                                    </Typography>
                                                    {category.parent1C && (
                                                        <Tooltip title="Копировать GUID родителя (1C)">
                                                            <IconButton size="small" onClick={() => copyToClipboard(category.parent1C)}>
                                                                <ContentCopyIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" sx={{ color: 'blue', mr: 1 }}>
                                                        Сайт: {getParentNameFromSite(category.parentSite)}
                                                    </Typography>
                                                    {category.parentSite && (
                                                        <Tooltip title="Копировать GUID родителя (Сайт)">
                                                            <IconButton size="small" onClick={() => copyToClipboard(category.parentSite)}>
                                                                <ContentCopyIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </Box>
                                        ) : (
                                            category.source === "1C"
                                                ? getParentNameFrom1C(category.parent1C)
                                                : getParentNameFromSite(category.parentSite)
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={filteredCategories.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </Page>
    );
}