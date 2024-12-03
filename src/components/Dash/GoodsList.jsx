import { Box, FormControlLabel, Switch, Button, TextField } from "@mui/material";
import React, { useState, useMemo, useRef, useLayoutEffect } from "react";
import BrowserUpdatedOutlinedIcon from "@mui/icons-material/BrowserUpdatedOutlined";
import PrintGoods from "../Search/PrintGoods";
import { FixedSizeGrid } from "react-window";
// import {generateSortStatistics} from "../UI/global/sortTools";

export default function GoodsList({ goods, exportXLSX, isAddImgCategory, feed, viewmode, isTollsStat }) {
    const [isFeed, setIsFeed] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef(null);

    // Следим за изменением ширины контейнера
    useLayoutEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        // console.log('\n updateWidth', updateWidth());
        return () => window.removeEventListener("resize", updateWidth);
    }, [goods]);

    // Динамическое количество колонок
    const columnWidth = 300; // Ширина одного товара
    const columnCount = Math.max(1, Math.floor(containerWidth / columnWidth));

    // Оптимизация feedMap через мемоизацию
    const feedMap = useMemo(
        () => new Map(feed?.map((f) => [f.VENDOR, f])),
        [feed]
    );

    // const goodsSorted = generateSortStatistics(goods);
    // console.log('\n goodsSorted', goodsSorted,goods);

    // Оптимизация sortedGoods через мемоизацию
    const sortedGoods = useMemo(() => {
        if (!goods || goods.length === 0) return [];

        return goods.sort((a, b) => a.SORT - b.SORT).map((g) => {
            const feedData = isFeed ? feedMap.get(g.VENDOR) : null;
            const pictures = isFeed
                ? feedData?.picture
                : g.PICTURES

            return {
                ...g,
                COUNT: feedData?.count || 0,
                WAREHOUSE: feedData?.warehouse?.length || 0,
                PRICE: feedData?.price || 0,
                PICTURES: pictures,
            };
        });
    }, [goods, isFeed, feedMap]);

    // Количество строк
    const rowCount = Math.ceil(sortedGoods.length / columnCount);

    const renderCell = ({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= sortedGoods.length) return null; // Пустая ячейка

        return (
            <div style={style}>
                <PrintGoods filteredGoods={[sortedGoods[index]]} isFeed={isFeed} />
            </div>
        );
    };

    return (
        <Box>
            {isTollsStat && <Box className="flex flex-row gap-2 items-center mb-2">
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
                <TextField
                    label="Количество товаров"
                    variant="outlined"
                    disabled
                    value={goods.length}
                />
                {!viewmode && <Button
                    color="success"
                    variant="outlined"
                    onClick={exportXLSX}
                    startIcon={<BrowserUpdatedOutlinedIcon/>}
                >
                    Скачать XLSX
                </Button>}
            </Box>}

            <Box ref={containerRef} sx={{width: "100%", height: "100%" }}>
                {sortedGoods.length > 0 && (
                    <FixedSizeGrid
                        height={650} // Высота контейнера
                        width={containerWidth} // Динамическая ширина контейнера
                        columnWidth={columnWidth} // Ширина одной ячейки
                        rowHeight={400} // Высота одной ячейки
                        columnCount={columnCount} // Динамическое количество колонок
                        rowCount={rowCount} // Количество строк
                    >
                        {renderCell}
                    </FixedSizeGrid>
                )}
            </Box>
        </Box>
    );
}
