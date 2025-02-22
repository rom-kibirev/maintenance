import React, { useEffect, useState } from "react";
import Page from "../UI/Theme/Page";
import { TextField, List, ListItem, ListItemText, Box, Chip, MenuItem, Select, Button } from '@mui/material';
import {fetchCategories} from "../../requests/api_v2";
import * as XLSX from 'xlsx';

const getCategoryStatus = (category, siteCategories) => {
    const siteCategory = siteCategories.find(sc => sc.XML_ID === category.guid);

    if (!siteCategory) return [{ label: "Нет на сайте", color: "error" }];

    const statuses = [];
    if (siteCategory.NAME !== category.name)
        statuses.push({ label: "Не совпадают имена", color: "warning" });
    if (siteCategory.XML_PARENT_ID !== category.parent)
        statuses.push({ label: "Не совпадают родители", color: "warning" });
    if (!siteCategory.ACTIVE)
        statuses.push({ label: "Не активна", color: "default" });

    return statuses.length > 0 ? statuses : [{ label: "OK", color: "success" }];
};

export default function CategoriesTools1C({token}) {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [siteCategories, setSiteCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/cat_check/output/merged_output.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                const sortedData = data.sort((a, b) =>
                    a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' })
                );

                setCategories(sortedData);
                setFilteredCategories(sortedData);
            } catch (error) {
                console.error("Ошибка при загрузке категорий:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const loadSiteCategories = async () => {
            try {
                const data = await fetchCategories(token, true);
                setSiteCategories(data);
            } catch (error) {
                console.error("Ошибка при загрузке категорий с сайта:", error);
            }
        };

        loadSiteCategories();
    }, [token]);

    useEffect(() => {
        let filtered = categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.guid.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (statusFilter !== 'all') {
            filtered = filtered.filter(category => {
                const statuses = getCategoryStatus(category, siteCategories).map(s => s.label);
                return statuses.includes(statusFilter);
            });
        }

        setFilteredCategories(filtered);
    }, [searchTerm, statusFilter, categories, siteCategories]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleStatusChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const exportToExcel = () => {
        const dataToExport = filteredCategories.map(category => ({
            Название: category.name,
            GUID: category.guid,
            Родитель: category.parent,
            Статус: getCategoryStatus(category, siteCategories).map(s => s.label).join(', ')
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Категории");
        XLSX.writeFile(workbook, "categories.xlsx");
    };

    return (
        <Page label="Просмотр категорий 1C">
            <Box className={`flex flex-row gap-2 items-center`}>
                <TextField
                    disabled
                    id="catcount"
                    label="Количество всех категорий"
                    value={categories.length || ''}
                />
                <TextField
                    label="Поиск по названию или GUID"
                    variant="outlined"
                    color="warning"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    margin="normal"
                />
                <Select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    displayEmpty
                >
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="Нет на сайте">Нет на сайте</MenuItem>
                    <MenuItem value="Не совпадают имена">Не совпадают имена</MenuItem>
                    <MenuItem value="Не совпадают родители">Не совпадают родители</MenuItem>
                    <MenuItem value="Не активна">Не активна</MenuItem>
                    <MenuItem value="OK">OK</MenuItem>
                </Select>
                <Button variant="contained" color="primary" onClick={exportToExcel}>
                    Выгрузить в Excel
                </Button>
            </Box>
            <Box sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
                <List>
                    {filteredCategories.map((category) => (
                        <ListItem key={category.guid}>
                            <ListItemText
                                primary={category.name}
                                secondary={`GUID: ${category.guid}, Parent: ${category.parent}`}
                                sx={{bgcolor: category.name.includes('Уценка') ? 'rgba(255,150,150,0.4)' : ''}}
                            />
                            <Box>
                                {getCategoryStatus(category, siteCategories).map((status, index) => (
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
        </Page>
    );
}
