import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    Collapse
} from "@mui/material";
import BrowserUpdatedOutlinedIcon from '@mui/icons-material/BrowserUpdatedOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import OpenInBrowserRoundedIcon from '@mui/icons-material/OpenInBrowserRounded';
import VisuallyHiddenInput from "../UI/Buttons/Button";
import { editContentUsers } from "../UI/users";
import ProductCard from "../Search/ProductCard";

export default function PrintCategories({
                                            data,
                                            saveXlsxHandler,
                                            uploadXlsxHandler,
                                            sendChangedCategoriesHandler,
                                            currentUser,
                                            out,
                                            previewProducts,
                                            feed
                                        }) {
    const [categories, setCategories] = useState([]);
    const [isAllOpened, setIsAllOpened] = useState(false);
    const [mainCategoryList, setMainCategoryList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCategoryList, setSelectedCategoryList] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [hoveredProduct, setHoveredProduct] = useState({
        "ACTIVE": true,
        "BRAND": "RUNTEC",
        "CATEGORY_ID": 8800,
        "CODE": "sverlo-po-derevu-runtec-hrc45-3-x-80mm-hex-1-4",
        "COUNTRY": "КИТАЙ",
        "ID": 39405,
        "VENDOR": "RT-DT3",
        "PRICE": null,
        "NAME": "Сверло по дереву Runtec HRC45 3 x 80мм HEX 1/4\"",
        "PICTURES": [
            "/upload/iblock/3b9/t24909mgarty6tfzdlh3pl6phu3l1geu.jpeg",
            "/upload/iblock/1b0/psd4ullrnyi0nvn3cesy8sm3qnnxzvx4.jpeg",
            "/upload/iblock/35c/uaruknkbo1mfm2lbt895ics7xcf1ekne.jpeg"
        ],
        "PREVIEW_PICTURE": "/upload/iblock/3b9/t24909mgarty6tfzdlh3pl6phu3l1geu.jpeg",
        "COUNT": 5,
        "WAREHOUSE": 15,
    });
    // if (hoveredProduct) console.log('\n hoveredProduct', hoveredProduct);

    // Инициализация и сортировка категорий
    useEffect(() => {
        const updateCategories = data.filter(c => c.ACTIVE).sort((a, b) => a.SORT - b.SORT);
        setCategories(updateCategories);
    }, [data]);

    // Обновление списка главных категорий
    useEffect(() => {
        if (categories.length > 0) {
            const rootCategories = categories.filter(item => !item.IBLOCK_SECTION_ID);
            setMainCategoryList(rootCategories);

            if (!selectedCategory) setSelectedCategory(rootCategories[0]?.ID);
        }
    }, [categories, selectedCategory]);

    // Обновление списка подкатегорий для выбранной категории
    useEffect(() => {
        if (selectedCategory) {
            const selectedList = categories.filter(c => c.IBLOCK_SECTION_ID === selectedCategory);
            setSelectedCategoryList(selectedList);
        }
    }, [selectedCategory, categories]);

    // Состояние открытия/закрытия категорий
    useEffect(() => {
        const newOpenCategories = {};
        const toggleOpenState = (categoryId) => {
            const subCategories = categories.filter(c => c.IBLOCK_SECTION_ID === categoryId);
            subCategories.forEach(sub => {
                newOpenCategories[sub.ID] = isAllOpened;
                toggleOpenState(sub.ID);
            });
        };

        categories
            .filter(category => !category.IBLOCK_SECTION_ID)
            .forEach(rootCategory => {
                newOpenCategories[rootCategory.ID] = isAllOpened;
                toggleOpenState(rootCategory.ID);
            });

        setOpenCategories(newOpenCategories);
    }, [isAllOpened, categories]);

    // Обработчик клика по категории
    const handleCategoryClick = (ID) => {
        setOpenCategories(prevState => ({
            ...prevState,
            [ID]: !prevState[ID],
        }));
    };

    // Обработчик наведения на категорию
    const handleCategoryHover = (category) => {
        // console.log('\n category', category);

        // Рекурсивная функция для сбора всех GOODS_PREVIEW текущей категории и ее дочерних элементов
        const collectGoodsPreview = (parentId) => {
            const collectedGoods = [];
            const subCategories = categories.filter(c => c.IBLOCK_SECTION_ID === parentId);

            // Добавляем GOODS_PREVIEW текущей категории, если он есть
            if (parentId !== null) {
                const currentCategory = categories.find(c => c.ID === parentId);
                if (currentCategory?.GOODS_PREVIEW) {
                    collectedGoods.push(currentCategory.GOODS_PREVIEW);
                }
            }

            // Рекурсивно собираем GOODS_PREVIEW из дочерних категорий
            subCategories.forEach(subCategory => {
                collectedGoods.push(...collectGoodsPreview(subCategory.ID));
            });

            return collectedGoods;
        };

        if (Array.isArray(previewProducts) && previewProducts.length > 0) {
            // Собираем все GOODS_PREVIEW текущей категории и дочерних
            const allGoodsPreview = collectGoodsPreview(category.ID);

            // Находим первый товар в previewProducts
            const product = previewProducts.find(p => allGoodsPreview.includes(p.ID));
            if (product) {
                const feedProduct = feed?.find(f => f.VENDOR === product?.VENDOR);
                product.PRICE = feedProduct?.price;
                product.COUNT = feedProduct?.count;
                product.WAREHOUSE = feedProduct?.warehouse?.length;
            }

            // console.log('\n product', product, feedProduct);
            setHoveredProduct(product ? product : null);
        } else {
            setHoveredProduct("");
        }
    };

    // Обработчик ухода с категории
    const handleCategoryLeave = () => {
        setHoveredProduct("");
    };

    // Рекурсивный рендеринг подкатегорий
    const renderSubCategories = (parentId, depth = 0) => {
        const subCategories = categories.filter(category => category.IBLOCK_SECTION_ID === parentId);

        return (
            <List component="div" disablePadding>
                {subCategories.map(category => (
                    <React.Fragment key={category.ID}>
                        <ListItem
                            button
                            onMouseEnter={() => handleCategoryHover(category)}
                            onMouseLeave={handleCategoryLeave}
                            onClick={() => handleCategoryClick(category.ID)}
                            sx={{ pl: depth * 2 + 3 }}
                        >
                            <ListItemText primary={category.NAME} />
                            {categories.some(c => c.IBLOCK_SECTION_ID === category.ID) && (
                                openCategories[category.ID] ? <ExpandLess /> : <ExpandMore />
                            )}
                        </ListItem>

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

    // Рендеринг подкатегорий выбранной категории
    const renderSelectedCategories = () => {
        if (!selectedCategoryList.length) return null;

        const midIndex = Math.ceil(selectedCategoryList.length / 2);
        const firstColumn = selectedCategoryList.slice(0, midIndex);
        const secondColumn = selectedCategoryList.slice(midIndex);

        const renderColumn = (column) => (
            <List component="div" disablePadding className="bg-[#464B4F] rounded-xl p-3 min-w-[300px] h-full overflow-y-auto">
                {column.map(category => (
                    <React.Fragment key={category.ID}>
                        <ListItem
                            button
                            onMouseEnter={() => handleCategoryHover(category)}
                            onMouseLeave={handleCategoryLeave}
                            onClick={() => handleCategoryClick(category.ID)}
                            sx={{ pl: 3 }}
                        >
                            <ListItemText primary={category.NAME} />
                            {openCategories[category.ID] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>

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
                <Box className={`w-1/3 h-full overflow-y-auto overflow-x-hidden`}>
                    {renderColumn(firstColumn)}
                </Box>
                <Box className={`w-1/3 h-full overflow-y-auto overflow-x-hidden`}>
                    {renderColumn(secondColumn)}
                </Box>
                {hoveredProduct && <ProductCard product={hoveredProduct} width={250} autoplay />}
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
                <TextField
                    disabled
                    id="hovered_product"
                    label="Товар категории"
                    value={hoveredProduct?.NAME || ''}
                />
                {!out && <React.Fragment>
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
                    {editContentUsers.includes(currentUser?.user_id) && <Button
                        color="error"
                        variant="outlined"
                        onClick={sendChangedCategoriesHandler}
                        startIcon={<OpenInBrowserRoundedIcon />}
                    >
                        Отправить данные на сайт
                    </Button>}
                </React.Fragment>}
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