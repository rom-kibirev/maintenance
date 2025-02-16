import React, { useEffect, useState } from "react";
import Page from "../UI/Theme/Page";
import {TextField, List, ListItem, ListItemText, Box} from '@mui/material';

export default function CategoriesTools1C() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/cat_check/output/merged_output.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCategories(data);
                setFilteredCategories(data);
            } catch (error) {
                console.error("Ошибка при загрузке категорий:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const filtered = categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.guid.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCategories(filtered);
    }, [searchTerm, categories]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
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
            </Box>
            <List>
                {filteredCategories.map((category) => (
                    <ListItem key={category.guid}>
                        <ListItemText
                            primary={category.name}
                            secondary={`GUID: ${category.guid}, Parent: ${category.parent}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Page>
    );
}