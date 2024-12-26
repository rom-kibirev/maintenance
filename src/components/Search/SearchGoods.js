import React, { useEffect, useRef, useState, useCallback } from "react";
import { Alert, Box, CircularProgress, TextField } from "@mui/material";
import {fetchGoodsData, sortProductsByBrand, spellerYandex} from "../UI/global/sortTools";
import GoodsList from "../Dash/GoodsList";

// Нормализация слова
const normalizeWord = (word) => {
    if (typeof word === "string") {
        const isFraction = /^\d+\/\d+$/.test(word); // Проверка на дробь
        const isNumber = /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(word.replace(",", "."));
        if (isFraction) return word; // Дробь остаётся текстом
        if (isNumber) return parseFloat(word.replace(",", ".")); // Преобразуем в число
        return word.trim().toUpperCase(); // Остальные строки в верхний регистр
    }
    if (typeof word === "number") return word; // Если это число, возвращаем как есть
    return null; // Неизвестный тип
};

// Фильтрация товаров по запросу
const filterGoods = (goods, searchWords) => {
    const normalizedSearchWords = searchWords.map(normalizeWord).filter(Boolean);
    return goods.filter((g) => {
        const words = g.SEARCHABLE_CONTENT?.replace(/["'():;\t\r\n#+″“№’°±³\\]/g, "")
            ?.replace(/\s+/g, " ")
            ?.trim()
            ?.toUpperCase()
            ?.split(" ")
            ?.map(normalizeWord)
            ?.filter(Boolean);
        return normalizedSearchWords.every((searchWord) => words?.includes(searchWord));
    });
};

export default function SearchGoods({ token }) {

    const [goods, setGoods] = useState([]);
    const [feed, setFeed] = useState([]);
    const [filteredGoods, setFilteredGoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState("ljvrhfn 3 ntktcrjg");
    const [searchWords, setSearchWords] = useState([]);
    const debounceTimer = useRef(null);

    const handleSearchChange = useCallback((value) => {
        const cleanedValue = value
            .replace(/["'():;\t\r\n#+″“№’°±³\\]/g, "")
            .replace(/\s+/g, " ")
            // .trim()
        ;

        setInputValue(cleanedValue); // Немедленно обновляем inputValue для пользователя

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            try {
                const wordsArray = cleanedValue.split(" ");
                const checked = await spellerYandex(cleanedValue); // Проверка правописания

                const correctedWords = wordsArray.map((word) => {
                    const isFraction = /^\d+\/\d+$/.test(word);
                    const isNumber = /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(word.replace(",", "."));
                    if (isFraction) return word;
                    if (isNumber) return parseFloat(word.replace(",", "."));
                    if (word.length <= 2) return word;

                    const suggestion = checked.find(
                        (c) => c.pos === cleanedValue.indexOf(word)
                    );
                    return suggestion?.s?.[0] || word;
                });

                setSearchWords(correctedWords); // Обновляем поисковые слова
                const correctedValue = correctedWords.join(" ");
                if (correctedValue !== inputValue) {
                    setInputValue(correctedValue); // Обновляем inputValue, если оно изменилось
                }
            } catch (error) {
                console.error("Error during spelling correction:", error);
            }
        }, 750);
    }, [inputValue]);

    // Загрузка товаров
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const { goods, feed } = await fetchGoodsData(token, false);
                const validGoods = goods.filter(
                    (g) => +g.COUNT > 0 && +g.PRICE > 0 // Учитываем только товары с положительным количеством и ценой
                );
                const sortedGoods = sortProductsByBrand(validGoods);
                const sortedProducts = sortedGoods?.map(g => {

                    g.SEARCHABLE_CONTENT = `${g.NAME} ${g.VENDOR}`

                    return {
                        ...g,
                    }
                })
                setGoods(sortedProducts);
                setFeed(feed);
            } catch (error) {
                console.error("Error loading goods:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [token]);

    // Фильтрация товаров при изменении поискового запроса
    useEffect(() => {
        if (!searchWords.length) {
            setFilteredGoods([]);
            return;
        }
        const matchingGoods = filterGoods(goods, searchWords);
        setFilteredGoods(matchingGoods);
    }, [searchWords, goods]);

    // console.log('\n ', {
    //     goods,
    //     filteredGoods,
    //     loading,
    //     inputValue,
    //     searchWords,
    // });

    return (
        <Box>
            <Box className="flex flex-wrap flex-row gap-2 items-center mb-4">
                <TextField
                    label="Поиск товаров"
                    variant="outlined"
                    fullWidth
                    onChange={(e) => handleSearchChange(e.target.value)}
                    value={inputValue}
                />
                {loading ? (
                    <Box>Search</Box>
                ) : (
                    <Alert severity="success">
                        Всего товаров для поиска {goods?.length || 0}. Найдено:{" "}
                        {filteredGoods?.length || 0}
                    </Alert>
                )}
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : (
                filteredGoods?.length > 0 && <Box className="flex-1">
                        <GoodsList
                            // selectedCategory={selectedCategory}
                            // categories={categories}
                            goods={filteredGoods}
                            feed={feed}
                            viewmode
                            outsSetIsFeed
                        />
                    </Box>
            )}
        </Box>
    );
}