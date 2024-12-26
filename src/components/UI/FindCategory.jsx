import {Alert, Box, Button, TextField} from "@mui/material";
import React, {useState} from "react";
import TaskAltIcon from '@mui/icons-material/TaskAlt';

export default function FindCategories({data, handleCategoryClick}) {

    const [searchTerm, setSearchTerm] = useState(""); // Строка поиска
    const [filteredCategories, setFilteredCategories] = useState([]); // Фильтрованные категории

    const handleSearch = (e) => {
        const searchValue = e.target.value.toLowerCase();
        console.log('Search input:', searchValue); // Отладка ввода
        setSearchTerm(searchValue); // Обновляем состояние для отображения в поле ввода

        const filtered = data
            .filter(category => category.NAME.toLowerCase().includes(searchValue))
            .slice(0, 5);

        console.log('Filtered categories:', filtered); // Проверяем фильтрацию
        setFilteredCategories(filtered); // Обновляем список категорий
    };

    console.log('\n filteredCategories', filteredCategories);

    return (
        <Box>
            <TextField
                label="Поиск категории"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={handleSearch}
            />
            {filteredCategories.length > 0 && (
                <Box className={`mt-2 flex flex-wrap gap-2`}>
                    {filteredCategories.map((category) => (
                        <Button
                            key={category.ID}
                            variant="outlined"
                            color={`warning`}
                            startIcon={<TaskAltIcon />}
                            onClick={() => handleCategoryClick(category)}
                        >
                            {category.NAME}
                        </Button>
                    ))}
                </Box>
            )}
            {filteredCategories.length === 0 && searchTerm && (
                <Alert severity={`warning`} mt={2}>
                    Категории не найдены.
                </Alert>
            )}
        </Box>
    );
}