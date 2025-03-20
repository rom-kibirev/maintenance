import React, { useState, useEffect } from 'react';
import { TextField, Autocomplete } from '@mui/material';

export default function CategorySearch({ categories, setSelectedCategory }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);

    useEffect(() => {
        if (!categories) return;
        
        if (searchTerm) {
            const filtered = categories.filter(category =>
                category.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.XML_ID.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories([]);
        }
    }, [searchTerm, categories]);

    const handleCategorySelect = (event, value) => {
        if (value) setSelectedCategory(value);
    };

    return (
        <Autocomplete
            options={filteredCategories}
            getOptionLabel={(option) => `${option.NAME} (${option.XML_ID})`}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Поиск категории"
                    variant="outlined"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{width: 250}}
                />
            )}
            onChange={handleCategorySelect}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
        />
    );
};
