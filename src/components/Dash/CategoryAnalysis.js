import React, { useEffect, useState } from 'react';
import { Button, Select, MenuItem, Box, List, ListItem, ListItemText, Chip, Typography } from '@mui/material';
import * as XLSX from 'xlsx';
import { fetchCategories } from '../../requests/api_v2';

const CategoryAnalysis = ({ token }) => {
    const [categories, setCategories] = useState([]);
    const [highlightedCategories, setHighlightedCategories] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [siteCount, setSiteCount] = useState(0);
    const [oneCCount, setOneCCount] = useState(0);
    const [statusCounts, setStatusCounts] = useState({});

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const siteData = await fetchCategories(token);
                const oneCData = await fetchCombinedOneCCategories();
                const {
                    categoriesOnlyOnSite,
                    categoriesOnlyInOneC,
                    nameChangedCategories,
                    parentChangedCategories,
                    // duplicateNames
                } = compareCategories(siteData, oneCData);

                const combinedData = [
                    ...categoriesOnlyOnSite,
                    ...categoriesOnlyInOneC,
                    ...nameChangedCategories,
                    ...parentChangedCategories
                ];
                setCategories(combinedData);
                setSiteCount(siteData.length);
                setOneCCount(oneCData.length);
                highlightDiscountedCategories(combinedData);
                calculateStatusCounts(combinedData);
            } catch (error) {
                console.error("Ошибка загрузки категорий:", error);
            }
        };

        loadCategories();
    }, [token]);

    const fetchCombinedOneCCategories = async () => {
        try {
            const response = await fetch('/data/categories 1C/merged_output.json');
            if (!response.ok) throw new Error('Ошибка сети при загрузке данных 1C');
            const data = await response.json();
            return data.filter(item => item.length > 0);
        } catch (error) {
            console.error("Ошибка загрузки данных 1C:", error);
            return [];
        }
    };

    const compareCategories = (siteData, oneCData) => {
        const siteGuids = new Set(siteData.map(cat => cat.guid));
        const oneCGuids = new Set(oneCData.map(cat => cat.guid));

        const categoriesOnlyOnSite = siteData.filter(cat => !oneCGuids.has(cat.guid));
        const categoriesOnlyInOneC = oneCData.filter(cat => !siteGuids.has(cat.guid));

        const nameChangedCategories = siteData.filter(siteCat => {
            const oneCCat = oneCData.find(oneCCat => oneCCat.guid === siteCat.guid);
            return oneCCat && siteCat.name !== oneCCat.NAME;
        });

        const parentChangedCategories = siteData.filter(siteCat => {
            const oneCCat = oneCData.find(oneCCat => oneCCat.guid === siteCat.guid);
            return oneCCat && siteCat.parent !== oneCCat.XML_PARENT_ID;
        });

        const duplicateNames = oneCData.reduce((acc, oneCCat) => {
            const duplicates = oneCData.filter(cat => cat.NAME === oneCCat.NAME && !siteGuids.has(cat.guid));
            if (duplicates.length > 1) {
                acc.push({ name: oneCCat.NAME, duplicates });
            }
            return acc;
        }, []);

        return {
            categoriesOnlyOnSite,
            categoriesOnlyInOneC,
            nameChangedCategories,
            parentChangedCategories,
            duplicateNames
        };
    };

    const getCategoryStatus = (category) => {
        const statuses = [];
        if (!category.siteExists) statuses.push({ label: "Нет на сайте", color: "error" });
        if (category.nameMismatch) statuses.push({ label: "Не совпадают имена", color: "warning" });
        if (category.parentMismatch) statuses.push({ label: "Не совпадают родители", color: "warning" });
        if (!category.active) statuses.push({ label: "Не активна", color: "default" });
        if (category.isDuplicate) statuses.push({ label: "Дубликат", color: "error" });
        return statuses.length > 0 ? statuses : [{ label: "OK", color: "success" }];
    };

    const highlightDiscountedCategories = (data) => {
        const highlighted = data?.filter(category => category.NAME.includes('Уценка'));
        setHighlightedCategories(highlighted);
    };

    const calculateStatusCounts = (data) => {
        const counts = data.reduce((acc, category) => {
            const statuses = getCategoryStatus(category).map(s => s.label);
            statuses.forEach(status => {
                acc[status] = (acc[status] || 0) + 1;
            });
            return acc;
        }, {});
        setStatusCounts(counts);
    };

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(categories);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
        XLSX.writeFile(workbook, 'CategoryAnalysis.xlsx');
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const filteredCategories = categories?.filter(category => {
        const statuses = getCategoryStatus(category).map(s => s.label);
        return statusFilter === 'all' || statuses.includes(statusFilter);
    });

    return (
        <Box>
            <Typography variant="h4">Анализ категорий</Typography>
            <Typography variant="body1">Всего на сайте: {siteCount} / Всего в 1С: {oneCCount}</Typography>
            <Button variant="contained" onClick={handleExport}>
                Экспорт в XLSX
            </Button>
            <Select value={statusFilter} onChange={handleStatusFilterChange} displayEmpty>
                <MenuItem value="all">Все</MenuItem>
                {Object.entries(statusCounts).map(([status, count]) => (
                    <MenuItem key={status} value={status}>
                        {status} ({count})
                    </MenuItem>
                ))}
            </Select>
            <List>
                {filteredCategories?.map(category => (
                    <ListItem key={category.ID}>
                        <ListItemText
                            primary={category.NAME}
                            secondary={`GUID: ${category.guid}, Parent: ${category.parent}`}
                            sx={{ bgcolor: highlightedCategories.includes(category) ? 'rgba(255,150,150,0.4)' : '' }}
                        />
                        <Box>
                            {getCategoryStatus(category).map((status, index) => (
                                <Chip
                                    key={index}
                                    label={status.label}
                                    color={status.color}
                                    size="small"
                                    sx={{ marginLeft: 1 }}
                                />
                            ))}
                        </Box>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default CategoryAnalysis;