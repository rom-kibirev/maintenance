import React, { useState } from "react";
import { Box, Button, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function getCategoryDescendants(selectedCategory, categories) {
    const descendants = [];
    function findChildren(categoryId) {
        const children = categories.filter(category => category.IBLOCK_SECTION_ID === categoryId);
        children.forEach(child => {
            descendants.push(child.ID);
            findChildren(child.ID);
        });
    }
    findChildren(selectedCategory);
    return descendants;
}

function filterGoodsByCategory(goods, categoryIds) {
    return goods.filter(good => categoryIds.includes(good.CATEGORY_ID)).sort((a, b) => b.COUNT - a.COUNT);
}

export default function AddCategoryImages({ selectedCategory, categories, goods, itemsPerPage = 5, patchCategoryImage }) {
    const [selectedImage, setSelectedImage] = useState('/upload/iblock/e7d/g2tw44xzsc8igad2xahgnt3pkqm3wtzi.jpeg');
    const [currentPage, setCurrentPage] = useState(1);

    const handleImageSelect = (imageUrl) => {
        setSelectedImage(imageUrl);
        console.log(imageUrl);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (selectedCategory && categories?.length > 0 && goods?.length > 0) {
        const categoryIds = [selectedCategory, ...getCategoryDescendants(selectedCategory, categories)];
        const filteredGoods = filterGoodsByCategory(goods, categoryIds);

        const totalPages = Math.ceil(filteredGoods.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const goodsToDisplay = filteredGoods.slice(startIndex, endIndex);

        const pageNumbers = [];
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            pageNumbers.push(i);
        }

        return (
            <Box>
                {!!selectedImage && <Button
                    variant="contained"
                    onClick={() => patchCategoryImage(selectedImage)}
                    sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                    color={`secondary`}
                >
                    Установить изображение
                </Button>}
                <Box className={`h-[65vh] overflow-y-auto`}>{goodsToDisplay.map((good) => (
                    <Accordion key={good.ID} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{good.NAME}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box className="flex flex-row flex-wrap gap-2">
                                {good.PREVIEW_PICTURE && (
                                    <Button
                                        variant={selectedImage === good.PREVIEW_PICTURE ? "contained" : "outlined"}
                                        onClick={() => handleImageSelect(good.PREVIEW_PICTURE)}
                                        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                                        color={`secondary`}
                                    >
                                        <img
                                            src={`https://runtec-shop.ru/${good.PREVIEW_PICTURE}`}
                                            alt={`${good.NAME} Preview`}
                                            style={{ width: 150, height: 150, objectFit: "cover" }}
                                        />
                                    </Button>
                                )}

                                {good.PICTURES &&
                                    good.PICTURES.map((picture, index) => (
                                        <Button
                                            key={index}
                                            variant={selectedImage === picture ? "contained" : "outlined"}
                                            onClick={() => handleImageSelect(picture)}
                                            sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                                            color={`secondary`}
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
                ))}</Box>

                {totalPages > 1 && (<Box display="flex" gap={2} justifyContent="center" my={2}>
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
                    </Box>)}
            </Box>
        );
    }

    return null;
}
