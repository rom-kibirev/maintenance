import React, {useState, useEffect, useCallback} from "react";
import {
    Box,
    FormControlLabel,
    Switch,
    TextField,
    List,
    ListItem,
    Button,
    Collapse,
    IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CancelIcon from '@mui/icons-material/Cancel';

export default function CategoriesTree({ categories, selectedCategory, setSelectedCategory, isAddCategoryImage }) {

    const [isActive, setIsActive] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryTree, setCategoryTree] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});

    const buildCategoryTree = useCallback((categories, parentId = null) => {
        return categories
            .filter(category => category.IBLOCK_SECTION_ID === parentId)
            .map(category => ({
                ...category,
                children: buildCategoryTree(categories, category.ID)
            }));
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            // Фильтрация категорий по активности
            const filteredCategories = categories.filter(c => (isActive ? c.ACTIVE : true));

            // Если текст поиска пустой или меньше 2 символов, показываем дерево
            if (searchTerm.length < 2) {
                const tree = buildCategoryTree(filteredCategories);
                setCategoryTree(tree);
            } else {
                // Иначе показываем плоский список отфильтрованных категорий
                const flatList = filteredCategories.filter(c =>
                    c.NAME.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setCategoryTree(flatList);
            }
        }
    }, [categories, isActive, searchTerm, buildCategoryTree]);

    // Функция для управления состоянием раскрытия категорий
    const toggleCategory = (categoryId) => {
        setExpandedCategories(prevState => ({
            ...prevState,
            [categoryId]: !prevState[categoryId]
        }));
    };

    const renderCategoryTree = (category, level = 1) => (
        <Box key={category.ID} style={{ marginLeft: `${level * 10}px` }}>
            <ListItem>
                <Button
                    variant="outlined"
                    color={selectedCategory === category.ID ? "warning" : category.ACTIVE ? "info" : "error" }
                    onClick={() => setSelectedCategory(category.ID)}
                    fullWidth
                    className="flex items-center justify-start"
                    sx={{ textTransform: "none" }}
                >
                    {(category.PREVIEW_PICTURE) ? <Box className={`mr-3 rounded-md overflow-hidden`}>
                        <img
                            src={category.PREVIEW_PICTURE}
                            alt={category.NAME}
                            style={{ width: 64, height: 64, objectFit: "cover" }}
                        />
                    </Box> : <span className={`mr-2`}>{level}</span>}
                    {category.NAME}
                </Button>
                {category.children && category.children.length > 0 && (
                    <IconButton onClick={() => toggleCategory(category.ID)}>
                        {expandedCategories[category.ID] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                )}
            </ListItem>
            {category.children && (
                <Collapse in={expandedCategories[category.ID]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {category.children.map(child => renderCategoryTree(child, level + 1))}
                    </List>
                </Collapse>
            )}
        </Box>
    );

    // console.log('\n categoryTree', categoryTree);

    return (
        <Box className={`relative h-full`}>
            <FormControlLabel
                control={
                    <Switch
                        checked={isActive}
                        color="success"
                        onChange={() => setIsActive(!isActive)}
                    />
                }
                label={`${isActive ? "Активные" : "Все"} категории`}
            />

            {selectedCategory && <Button
                variant="outlined"
                color="warning"
                onClick={() => setSelectedCategory(null)}
                startIcon={<CancelIcon />}
            >
                Сбросить категории
            </Button>}

            <TextField
                label="Поиск по имени"
                variant="outlined"
                size="small"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <List className={`h-full overflow-y-auto relative max-h-[65vh]`}>
                {searchTerm.length < 2
                    ? categoryTree.map(parentCategory => renderCategoryTree(parentCategory))
                    : categoryTree.map(category => (
                        <ListItem key={category.ID}>
                            <Button
                                variant="outlined"
                                color={selectedCategory === category.ID ? "warning" : category.ACTIVE ? "info" : "error" }
                                onClick={() => setSelectedCategory(category.ID)}
                                fullWidth
                                sx={{ textTransform: "none"}}
                            >
                                {category.NAME}
                            </Button>
                        </ListItem>
                    ))
                }
            </List>
        </Box>
    );
}
