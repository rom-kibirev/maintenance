import {Box} from "@mui/material";
import ProductCard from "./ProductCard";
import React, {useEffect, useRef, useState} from "react";
import {VariableSizeList as List} from "react-window";
import debounce from "lodash.debounce";

export default function PrintGoods ({filteredGoods, isFeed, shortMode, viewmode}) {

    const [columns, setColumns] = useState(5);
    const cardHeight = 400;

    const containerRef = useRef();
    const getRowHeight = (index) => {
        const itemsPerRow = columns;
        const startIndex = index * itemsPerRow;
        const endIndex = startIndex + itemsPerRow;
        const rowItems = filteredGoods?.slice(startIndex, endIndex);

        // Определяем максимальную высоту контента в строке
        const rowHeights = rowItems?.map((item) => {
            // const contentHeight = cardHeight; // Примерная высота карточки
            return cardHeight;
        });

        // console.log('\n rowHeights', rowHeights, rowItems);

        if (rowHeights > 0) return Math.max(...rowHeights);
    };

    useEffect(() => {
        const updateColumns = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;

                if (width < 300) setColumns(1);
                else if (width < 720) setColumns(2);
                else if (width < 1240) setColumns(4);
                else setColumns(5);
            }
        };

        const observer = new ResizeObserver(debounce(updateColumns, 100));
        if (containerRef.current) observer.observe(containerRef.current);

        // Сохраняем значение containerRef.current в переменную
        const currentRef = containerRef.current;

        return () => {
            // Используем переменную в функции очистки
            if (currentRef) observer.disconnect();
        };
    }, []);

    const RowRenderer = ({ index, style }) => {
        const itemsPerRow = columns;
        const startIndex = index * itemsPerRow;
        const rowItems = filteredGoods?.slice(startIndex, startIndex + itemsPerRow);

        // console.log('\n RowRenderer', filteredGoods);

        return (
            <Box style={style} display="grid" gridTemplateColumns={`repeat(${shortMode ? 1 : columns}, 1fr)`} gap="20px">
                {rowItems?.map((product) => (
                    <Box key={product.ID} className={shortMode ? 'w-full' : `max-w-[250px]`}>
                        <ProductCard product={product} isFeed={isFeed} shortMode={shortMode} viewmode={viewmode} />
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <Box ref={containerRef} className={`w-full`}>
            <List
                height={700}
                itemCount={Math.ceil(filteredGoods?.length / columns)}
                itemSize={getRowHeight}
                width="100%"
            >
                {RowRenderer}
            </List>
        </Box>
    )
}