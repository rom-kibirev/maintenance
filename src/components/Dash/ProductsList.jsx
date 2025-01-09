import React, { useState, useMemo, useRef, useLayoutEffect } from "react";
import { Box, FormControlLabel, Switch, TextField } from "@mui/material";
import PrintGoods from "../Search/PrintGoods";
import { FixedSizeGrid } from "react-window";
import {mergeFeed} from "../UI/global/sortTools";

export default function ProductsList({ goods, isAddImgCategory, feed, isTollsStat, outsSetIsFeed, shortMode, categories, viewmode }) {
    const [isFeed, setIsFeed] = useState(outsSetIsFeed); // Переключатель "данные из фида"
    const [containerWidth, setContainerWidth] = useState(0); // Для рендеринга сетки
    const containerRef = useRef(null); // Ссылка на контейнер для измерения ширины
    
    // console.log(`\n goods`, goods);

    // Изменяем ширину контейнера при изменении размеров окна
    useLayoutEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, [goods]);

    // Настройки сетки
    const columnWidth = shortMode ? 500: 300; // Ширина одной колонки
    const columnHeight = shortMode ? 80 : 450; // Высота одной колонки
    const columnCount = Math.max(1, Math.floor(shortMode ? 1 : (containerWidth / columnWidth))); // Количество колонок

    // Сортировка и подготовка данных для рендера
    const sortedGoods = useMemo(() => {
        if (!goods || goods.length === 0) return [];

        const sortedGoods = goods.sort((a, b) => a.SORT - b.SORT);
        const findGoods = isFeed ? mergeFeed(sortedGoods, feed) : sortedGoods;

        if (categories) categories.forEach(c => {

            findGoods.unshift({...c, LINK: c.CODE, PICTURES: [c.PREVIEW_PICTURE], category:true});
        })

        // console.log('\n sortedGoods', findGoods);

        return (findGoods);
    }, [categories, goods, isFeed, feed]);

    const rowCount = sortedGoods?.length && Math.ceil(sortedGoods.length / columnCount); // Количество строк

    // Рендер ячейки сетки
    const renderCell = ({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= sortedGoods.length) return null; // Если ячейка пуста

        return (
            <div style={style}>
                <PrintGoods filteredGoods={[sortedGoods[index]]} isFeed={isFeed} shortMode={shortMode} viewmode={viewmode} />
            </div>
        );
    };

    return (
        <Box>
            {/* Панель инструментов */}
            {isTollsStat && (
                <Box className="flex flex-row gap-2 items-center mb-2">
                    {/* Переключатель фид/сайт */}
                    {(!isAddImgCategory && feed?.length > 0) && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isFeed}
                                    color="success"
                                    onChange={() => setIsFeed((prev) => !prev)}
                                />
                            }
                            label={`Данные ${isFeed ? "из фида" : "с сайта"}`}
                        />
                    )}
                    {/* Показ количества товаров */}
                    <TextField
                        label="Количество товаров"
                        variant="outlined"
                        disabled
                        value={goods.length}
                    />
                    {/* Кнопка экспорта */}
                </Box>
            )}
            {/* Сетка товаров/категорий */}
            <Box ref={containerRef} sx={{ width: "100%", height: "100%" }}>
                {sortedGoods?.length > 0 && (
                    <FixedSizeGrid
                        height={650} // Высота контейнера
                        width={containerWidth} // Динамическая ширина
                        columnWidth={columnWidth} // Ширина ячейки
                        rowHeight={columnHeight} // Высота ячейки
                        columnCount={columnCount} // Колонки
                        rowCount={rowCount} // Строки
                    >
                        {renderCell}
                    </FixedSizeGrid>
                )}
            </Box>
        </Box>
    );
}
