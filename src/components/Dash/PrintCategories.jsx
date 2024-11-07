import React, { useEffect, useState } from "react";
import { Box, Button, TextField, List, ListItem, ListItemText, Collapse } from "@mui/material";
import BrowserUpdatedOutlinedIcon from '@mui/icons-material/BrowserUpdatedOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import OpenInBrowserRoundedIcon from '@mui/icons-material/OpenInBrowserRounded';
import VisuallyHiddenInput from "../UI/Buttons/Button";

export default function PrintCategories({ data, saveXlsxHandler, uploadXlsxHandler, sendChangedCategoriesHandler }) {

    const [categories, setCategories] = useState([]);
    const [isAllOpened, setIsAllOpened] = useState(false);
    const [mainCategoryList, setMainCategoryList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCategoryList, setSelectedCategoryList] = useState([]);
    const [openCategories, setOpenCategories] = useState({});

    // console.log('\n mainCategoryList', mainCategoryList);

    useEffect(() => {
        const updateCategories = data.filter(c => c.ACTIVE).sort((a, b) => a.SORT - b.SORT);
        setCategories(updateCategories);
    }, [data]);
    useEffect(() => {
        if (categories.length > 0) {
            // Находим корневые категории
            const rootCategories = categories.filter(item => !item.IBLOCK_SECTION_ID);
            setMainCategoryList(rootCategories);

            // Устанавливаем первую корневую категорию по умолчанию, если не выбрана
            if (!selectedCategory) setSelectedCategory(rootCategories[0]?.ID);
        }
    }, [categories, selectedCategory]);
    useEffect(() => {
        // Обновляем подкатегории для выбранной корневой категории
        if (selectedCategory) {
            const selectedList = categories.filter(c => c.IBLOCK_SECTION_ID === selectedCategory);
            setSelectedCategoryList(selectedList);
        }
    }, [selectedCategory, categories]);
    useEffect(() => {
        // Инициализируем состояние открытия категорий
        const newOpenCategories = {};

        const toggleOpenState = (categoryId) => {
            const subCategories = categories.filter(c => c.IBLOCK_SECTION_ID === categoryId);
            subCategories.forEach(sub => {
                newOpenCategories[sub.ID] = isAllOpened;
                toggleOpenState(sub.ID); // рекурсивно обрабатываем подкатегории
            });
        };

        // Обрабатываем корневые категории
        categories
            .filter(category => !category.IBLOCK_SECTION_ID)
            .forEach(rootCategory => {
                newOpenCategories[rootCategory.ID] = isAllOpened;
                toggleOpenState(rootCategory.ID);
            });

        setOpenCategories(newOpenCategories);
    }, [isAllOpened, categories]);

    const handleCategoryClick = (ID) => {
        // Меняем состояние открытия/закрытия для подкатегорий
        setOpenCategories(prevState => ({
            ...prevState,
            [ID]: !prevState[ID],
        }));
    };
    const renderSubCategories = (parentId, depth = 0) => {
        const subCategories = categories.filter(category => category.IBLOCK_SECTION_ID === parentId);

        return (
            <List component="div" disablePadding>
                {subCategories.map(category => (
                    <React.Fragment key={category.ID}>
                        <ListItem
                            button
                            onClick={() => handleCategoryClick(category.ID)}
                            sx={{ pl: depth * 2 + 3 }}
                        >
                            <ListItemText primary={category.NAME} />
                            {categories.some(c => c.IBLOCK_SECTION_ID === category.ID) ? (
                                openCategories[category.ID] ? <ExpandLess /> : <ExpandMore />
                            ) : null}
                        </ListItem>

                        {/* Рекурсивно рендерим подкатегории */}
                        {openCategories[category.ID] && (
                            <Collapse in={openCategories[category.ID]} timeout="auto" unmountOnExit>
                                {renderSubCategories(category.ID, depth + 1)}
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
            </List>
        );
    };
    const renderSelectedCategories = () => {
        if (!selectedCategoryList.length) return null;

        // Разделяем подкатегории на две части для правого столбца
        const midIndex = Math.ceil(selectedCategoryList.length / 2);
        const firstColumn = selectedCategoryList.slice(0, midIndex);
        const secondColumn = selectedCategoryList.slice(midIndex);

        const renderColumn = (column) => (
            <List component="div" disablePadding className="bg-[#464B4F] rounded-xl p-3 min-w-[300px] h-full overflow-y-auto">
                {column.map(category => (
                    <React.Fragment key={category.ID}>
                        <ListItem
                            button
                            onClick={() => handleCategoryClick(category.ID)}
                            sx={{ pl: 3 }}
                        >
                            <ListItemText primary={category.NAME} />
                            {openCategories[category.ID] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>

                        {/* Рекурсивно рендерим подкатегории */}
                        {openCategories[category.ID] && (
                            <Collapse in={openCategories[category.ID]} timeout="auto" unmountOnExit>
                                {renderSubCategories(category.ID, 1)}
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
            </List>
        );

        return (
            <Box className="flex gap-3 h-full">
                <Box className="w-1/2 h-full overflow-y-auto">
                    {renderColumn(firstColumn)}
                </Box>
                <Box className="w-1/2 h-full overflow-y-auto">
                    {renderColumn(secondColumn)}
                </Box>
            </Box>
        );
    };

    return (
        <Box className="flex h-full flex-col gap-2">
            <Box className="flex flex-wrap gap-2">
                <TextField
                    disabled
                    id="categories_count"
                    label="Количество категорий"
                    value={categories.length || ''}
                />
                <TextField
                    disabled
                    id="selected_category"
                    label="Выбранная категория"
                    value={categories.find(c => c.ID === selectedCategory)?.NAME || ''}
                />
                <Button
                    color="info"
                    variant="outlined"
                    onClick={() => setIsAllOpened(!isAllOpened)}
                    startIcon={isAllOpened ? <UnfoldLessOutlinedIcon /> : <UnfoldMoreOutlinedIcon />}
                >
                    {isAllOpened ? "Свернуть" : "Развернуть"} категории
                </Button>
                <Button
                    color="success"
                    variant="outlined"
                    onClick={saveXlsxHandler}
                    startIcon={<BrowserUpdatedOutlinedIcon />}
                >
                    Скачать XLSX
                </Button>
                <Button
                    component="label"
                    color="warning"
                    variant="outlined"
                    startIcon={<UploadFileOutlinedIcon />}
                >
                    Загрузить XLSX
                    <VisuallyHiddenInput type="file" onChange={uploadXlsxHandler} />
                </Button>
                <Button
                    color="error"
                    variant="outlined"
                    onClick={sendChangedCategoriesHandler}
                    startIcon={<OpenInBrowserRoundedIcon />}
                >
                    Отправить данные на сайт
                </Button>
            </Box>
            <Box className="h-[550px] flex flex-row gap-3 text-[#f1f1ef] text-[15px] bg-[#212529] p-1">
                <ul className="bg-[#464B4F] rounded-xl p-3 w-[300px] h-full overflow-y-auto">
                    {mainCategoryList.map(category => (
                        <li
                            key={category.ID}
                            className={`${
                                category.ID === selectedCategory
                                    ? "border-[#ffb61c] bg-white/5 text-[#ffb61c]"
                                    : "bg-transparent text-inherit border-transparent"
                            } rounded-md border-l hover:border-[#ffb61c] hover:text-[#ffb61c] hover:bg-white/5 px-3 py-1.5 transform duration-200 cursor-pointer`}
                            onClick={() => setSelectedCategory(category.ID)}
                        >
                            {category.NAME}
                        </li>
                    ))}
                </ul>
                <Box className="bg-[#464B4F] rounded-xl p-3 grow h-full">
                    {renderSelectedCategories()}
                </Box>
            </Box>
        </Box>
    );
}
