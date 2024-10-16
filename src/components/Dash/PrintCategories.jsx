import { Box, Button, TextField, List, ListItem, ListItemText, Collapse } from "@mui/material";
import React, {useEffect, useState} from "react";
import BrowserUpdatedOutlinedIcon from '@mui/icons-material/BrowserUpdatedOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import VisuallyHiddenInput from "../UI/Buttons/Button";
import OpenInBrowserRoundedIcon from '@mui/icons-material/OpenInBrowserRounded';

export default function PrintCategories({ data, saveXlsxHandler, uploadXlsxHandler, sendChangedCategoriesHandler }) {

    const [categories, setCategories] = useState(null);
    const [isAllOpened, setIsAllOpened] = useState(false);
    const [mainCategoryList, setMainCategoryList] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCategoryList, setSelectedCategoryList] = useState(null);
    const [openCategories, setOpenCategories] = useState({});

    useEffect(() => {

        const updateCategories = data.filter(c => c.ACTIVE).sort((a, b) => a.SORT - b.SORT);
        setCategories(updateCategories);
    }, [data]);

    useEffect(() => {
        if (categories?.length > 0) {


            const updateMainCategoryList = categories?.filter(item => !item.IBLOCK_SECTION_ID);
            setMainCategoryList(updateMainCategoryList);

            if (!selectedCategory) setSelectedCategory(updateMainCategoryList[0].ID);
        }
    }, [categories, selectedCategory]);
    useEffect(() => {
        if (selectedCategory) {
            const updateSelectedCategoryList = categories?.filter(c => c.IBLOCK_SECTION_ID === selectedCategory);
            setSelectedCategoryList(updateSelectedCategoryList);
        }
    }, [selectedCategory, categories]);
    useEffect(() => {
        const newOpenCategories = {};
        const toggleOpenState = (categories) => {
            categories.forEach(category => {
                newOpenCategories[category.ID] = isAllOpened;
                const subCategories = categories.filter(c => c.IBLOCK_SECTION_ID === category.ID);
                if (subCategories.length > 0) {
                    toggleOpenState(subCategories);
                }
            });
        };

        if (selectedCategoryList?.length > 0) {
            toggleOpenState(selectedCategoryList);
        }
        setOpenCategories(newOpenCategories);
    }, [isAllOpened, selectedCategoryList, categories]);

    const handleCategoryClick = (ID) => {
        setOpenCategories((prevState) => ({
            ...prevState,
            [ID]: !prevState[ID],
        }));
    };
    const renderSubCategories = (categories, depth = 0) => {
        return (
            <List component="div" disablePadding>
                {categories.map(category => {
                    const subCategories = categories.filter(c => c.IBLOCK_SECTION_ID === category.ID);

                    return (
                        <React.Fragment key={category.ID}>
                            <ListItem
                                button
                                onClick={() => handleCategoryClick(category.ID)}
                                sx={{ pl: depth + 3 }}
                            >
                                <ListItemText primary={category.NAME} />
                                {subCategories.length > 0 ? (openCategories[category.ID] ? <ExpandLess /> : <ExpandMore />) : null}
                            </ListItem>
                            {subCategories.length > 0 && (
                                <Collapse in={openCategories[category.ID]} timeout="auto" unmountOnExit>
                                    {renderSubCategories(subCategories, depth + 1)}
                                </Collapse>
                            )}
                        </React.Fragment>
                    );
                })}
            </List>
        );
    };
    const renderSelectedCategories = () => {
        if (!selectedCategoryList?.length) return null;

        const midIndex = Math.ceil(selectedCategoryList.length / 2);
        const firstColumn = selectedCategoryList.slice(0, midIndex);
        const secondColumn = selectedCategoryList.slice(midIndex);

        const renderColumn = (column) => (
            <List component="nav" aria-labelledby="nested-list-subheader" className="bg-[#464B4F] rounded-xl p-3 min-w-[300px] h-full overflow-y-auto">
                {column.map(category => {
                    const subCategories = categories.filter(c => {
                        const parentKeys = Object.keys(c).filter(key => key.startsWith('IBLOCK_SECTION_ID'));

                        return parentKeys.some(key => c[key] === category.ID);
                    });

                    return (
                        <React.Fragment key={category.ID}>
                            <ListItem button onClick={() => handleCategoryClick(category.ID)}>
                                <ListItemText primary={category.NAME} />
                                {subCategories.length > 0 ? (openCategories[category.ID] ? <ExpandLess /> : <ExpandMore />) : null}
                            </ListItem>
                            {subCategories.length > 0 && (
                                <Collapse in={openCategories[category.ID]} timeout="auto" unmountOnExit>
                                    {renderSubCategories(subCategories, 1)}
                                </Collapse>
                            )}
                        </React.Fragment>
                    );
                })}
            </List>
        );

        return (
            <Box className="flex gap-3 h-full">
                <Box className={`w-1/2 h-full overflow-y-auto`}>
                    {renderColumn(firstColumn)}
                </Box>
                <Box className={`w-1/2 h-full overflow-y-auto`}>
                    {renderColumn(secondColumn)}
                </Box>
                <Box className={`bg-white p-2 rounded-xl min-w-[300px] text-black`}>@goods</Box>
            </Box>
        );
    };

    return (
        <Box className={`flex h-full flex-col gap-2`}>
            <Box className={`flex flex-wrap gap-2`}>
                <TextField
                    disabled
                    id="categories_count"
                    label="Количество категорий"
                    value={categories?.length || ''}
                />
                <TextField
                    disabled
                    id="selected_category"
                    label="Выбранная категория"
                    value={categories?.find(c => c.ID === selectedCategory)?.NAME || ''}
                />
                <Button
                    color="info"
                    variant="outlined"
                    onClick={() => setIsAllOpened(!isAllOpened)}
                    startIcon={isAllOpened ? <UnfoldLessOutlinedIcon/> : <UnfoldMoreOutlinedIcon/>}
                >
                    {isAllOpened ? "Свернуть" : "Развернуть"} категории
                </Button>
                <Button
                    color="success"
                    variant="outlined"
                    onClick={saveXlsxHandler}
                    startIcon={<BrowserUpdatedOutlinedIcon/>}
                >
                    Скачать XLSX
                </Button>
                <Button
                    component="label"
                    role={undefined}
                    color="warning"
                    variant="outlined"
                    startIcon={<UploadFileOutlinedIcon/>}
                >
                    Загрузить XLSX
                    <VisuallyHiddenInput type="file" onChange={uploadXlsxHandler}/>
                </Button>
                <Button
                    component="label"
                    role={undefined}
                    color="error"
                    variant="outlined"
                    onClick={sendChangedCategoriesHandler}
                    startIcon={<OpenInBrowserRoundedIcon/>}
                >
                    Отправить данные на сайт
                </Button>
            </Box>
            <Box className={`h-[550px] flex flex-row gap-3 text-[#f1f1ef] text-[15px] bg-[#212529] p-1`}>
                <ul className={`bg-[#464B4F] rounded-xl p-3 w-[300px] h-full overflow-y-auto`}>
                    {mainCategoryList?.map(category => (
                        <li
                            key={category.ID}
                            className={`${category.ID === selectedCategory ? "border-[#ffb61c] bg-white/5 text-[#ffb61c]" : "bg-transparent text-inherit border-transparent"} rounded-md border-l hover:border-[#ffb61c] hover:text-[#ffb61c] hover:bg-white/5 px-3 py-1.5 transform duration-200 cursor-pointer`}
                            onClick={() => setSelectedCategory(category.ID)}
                        >
                            {category.NAME}
                        </li>
                    ))}
                </ul>
                <Box className={`bg-[#464B4F] rounded-xl p-3 grow h-full`}>
                    {renderSelectedCategories()}
                </Box>
            </Box>
        </Box>
    );
}