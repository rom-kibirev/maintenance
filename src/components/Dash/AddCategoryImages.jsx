import React, { useEffect, useState, useMemo } from "react";
import { Box, Button, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Функция для получения всех потомков категории
function getCategoryDescendants(selectedCategory, categories) {
    const descendants = [];
    const visited = new Set();

    function findChildren(categoryId) {
        if (visited.has(categoryId)) return; // Избегаем зацикливания
        visited.add(categoryId);

        const children = categories.filter(category => category.IBLOCK_SECTION_ID === categoryId);
        // console.log(`Children of ${categoryId}:`, children);
        children.forEach(child => {
            descendants.push(child.ID);
            findChildren(child.ID); // Рекурсивный поиск
        });
    }

    // console.log('Selected Category:', selectedCategory);
    findChildren(selectedCategory);
    // console.log('Descendants:', descendants);
    return descendants;
}

// Функция для фильтрации товаров по категориям
function filterGoodsByCategory(goods, categoryIds) {
    if (goods?.length > 0) {
        console.log('\n filterGoodsByCategory', goods, categoryIds);
        const normalizedCategoryIds = categoryIds.map(String);
        const filteredGoods = goods.filter(good => normalizedCategoryIds.includes(String(good.CATEGORY_ID)))
            .sort((a, b) => a.SORT - b.SORT);
        // console.log('Filtered Goods:', filteredGoods);
        return filteredGoods;
    }
}

export default function AddCategoryImages({ selectedCategory, categories, goods, itemsPerPage = 5, patchCategoryImage }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    // const [resultGoods, setResultGoods] = useState(null);
    console.log('\n goods', goods);

    // Сбрасываем страницу при смене категории
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory]);

    // Мемоизация массивов потомков и фильтрованных товаров
    const categoryIds = useMemo(() => {
        if (!selectedCategory || !categories?.length) return [];
        return [selectedCategory, ...getCategoryDescendants(selectedCategory, categories)];
    }, [selectedCategory, categories]);

    // console.log('\n categoryIds', categoryIds);

    // useEffect(() => {
    //     if (categoryIds.length > 0) {
    //         filterGoodsByCategory(goods, categoryIds);
    //     }
    // }, [categoryIds]);

    const filteredGoods = useMemo(() => {
        if (!goods?.length || !categoryIds.length) return [];
        return filterGoodsByCategory(goods, categoryIds);
    }, [goods, categoryIds]);

    // console.log('\n filteredGoods', filteredGoods);

    const totalPages = Math.ceil(filteredGoods.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const goodsToDisplay = filteredGoods.slice(startIndex, endIndex);

    const pageNumbers = [];
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        pageNumbers.push(i);
    }

    const handleImageSelect = (imageUrl) => {
        setSelectedImage(imageUrl);
        // console.log('Selected Image:', imageUrl);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <Box>
            {!!selectedImage && (
                <Button
                    variant="contained"
                    onClick={() => patchCategoryImage(selectedImage)}
                    sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                    color="secondary"
                >
                    Установить изображение
                </Button>
            )}

            <Box className="h-[65vh] overflow-y-auto">
                {goodsToDisplay.map((good) => (
                    <Accordion key={good.ID} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{good.NAME}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box className="flex flex-row flex-wrap gap-2">
                                {good.PICTURES &&
                                    good.PICTURES.filter(picture => picture).map((picture, index) => (
                                        <Button
                                            key={index}
                                            variant={selectedImage === picture ? "contained" : "outlined"}
                                            onClick={() => handleImageSelect(picture)}
                                            sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                                            color="secondary"
                                        >
                                            <img
                                                src={`https://runtec-shop.ru/${picture}`}
                                                alt={`${good.NAME}`}
                                                style={{ width: 150, height: 150, objectFit: "cover" }}
                                            />
                                        </Button>
                                    ))}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>

            {totalPages > 1 && (
                <Box display="flex" gap={2} justifyContent="center" my={2}>
                    <Button
                        variant="outlined"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(1)}
                        color="secondary"
                    >
                        Первая
                    </Button>
                    <Button
                        variant="outlined"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        color="secondary"
                    >
                        Предыдущая
                    </Button>
                    {pageNumbers.map((page) => (
                        <Button
                            key={page}
                            variant={currentPage === page ? "contained" : "outlined"}
                            onClick={() => handlePageChange(page)}
                            color="secondary"
                        >
                            {page}
                        </Button>
                    ))}
                    <Button
                        variant="outlined"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        color="secondary"
                    >
                        Следующая
                    </Button>
                    <Button
                        variant="outlined"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        color="secondary"
                    >
                        Последняя
                    </Button>
                </Box>
            )}
        </Box>
    );
}
