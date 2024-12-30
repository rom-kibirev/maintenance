import React, { useState, useMemo, useRef, useLayoutEffect } from "react";
import { Box, FormControlLabel, Switch, Button, TextField } from "@mui/material";
import BrowserUpdatedOutlinedIcon from "@mui/icons-material/BrowserUpdatedOutlined";
import PrintGoods from "../Search/PrintGoods";
import { FixedSizeGrid } from "react-window";

export default function ProductsList({ goods, exportXLSX, isAddImgCategory, feed, viewmode, isTollsStat, outsSetIsFeed, shortMode, categories }) {
    const [isFeed, setIsFeed] = useState(outsSetIsFeed); // Переключатель "данные из фида"
    const [isExporting, setIsExporting] = useState(false); // Блокировка кнопки экспорта
    const [containerWidth, setContainerWidth] = useState(0); // Для рендеринга сетки
    const containerRef = useRef(null); // Ссылка на контейнер для измерения ширины

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
    const columnCount = Math.max(1, Math.floor(shortMode ? 1 : (containerWidth / columnWidth))); // Количество колонок

    // if (shortMode) console.log('\n containerWidth', containerWidth);

    // Оптимизация данных фида через useMemo
    const feedMap = useMemo(() => new Map(feed?.map((f) => [f.VENDOR, f])), [feed]);

    // Сортировка и подготовка данных для рендера
    const sortedGoods = useMemo(() => {
        if (!goods || goods.length === 0) return [];

        const findGoods = goods.sort((a, b) => a.SORT - b.SORT).map((g) => {
            const feedData = isFeed ? feedMap.get(g.VENDOR) : null;

            return {
                ...g,
                COUNT: feedData?.count || 0,
                WAREHOUSE: feedData?.warehouse?.length || 0,
                PRICE: feedData?.price || 0,
                PICTURES: isFeed ? feedData?.picture : g.PICTURES,
            };
        });

        if (categories) categories.forEach(c => {

            findGoods.unshift({...c, LINK: c.CODE, PICTURES: [c.PREVIEW_PICTURE], category:true});
        })

        // console.log('\n sortedGoods', findGoods);

        return (findGoods);
    }, [categories, goods, isFeed, feedMap]);

    const rowCount = Math.ceil(sortedGoods.length / columnCount); // Количество строк

    // Функция экспорта
    const handleExport = async () => {
        if (isExporting) return; // Предотвращение повторных кликов
        setIsExporting(true); // Блокируем кнопку
        try {
            await exportXLSX(); // Выполнение экспорта
        } catch (error) {
            console.error("Ошибка при экспорте:", error);
        } finally {
            setIsExporting(false); // Разблокируем кнопку
        }
    };

    // Рендер ячейки сетки
    const renderCell = ({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= sortedGoods.length) return null; // Если ячейка пуста

        return (
            <div style={style}>
                <PrintGoods filteredGoods={[sortedGoods[index]]} isFeed={isFeed} shortMode={shortMode} />
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
                    {!viewmode && (
                        <Button
                            color="success"
                            variant="outlined"
                            onClick={handleExport}
                            disabled={isExporting} // Блокировка во время экспорта
                            startIcon={<BrowserUpdatedOutlinedIcon />}
                        >
                            {isExporting ? "Скачивание..." : "Скачать XLSX"}
                        </Button>
                    )}
                </Box>
            )}
            {/* Сетка товаров/категорий */}
            <Box ref={containerRef} sx={{ width: "100%", height: "100%" }}>
                {sortedGoods.length > 0 && (
                    <FixedSizeGrid
                        height={650} // Высота контейнера
                        width={containerWidth} // Динамическая ширина
                        columnWidth={columnWidth} // Ширина ячейки
                        rowHeight={shortMode ? 80 : 450} // Высота ячейки
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
