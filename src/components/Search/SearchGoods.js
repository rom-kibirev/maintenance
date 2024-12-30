import React, { useEffect, useRef, useState, useCallback } from "react";
import { Alert, Box, CircularProgress, TextField } from "@mui/material";
import {fetchGoodsData, sortProductsByBrand, spellerYandex} from "../UI/global/sortTools";
import ProductsList from "../Dash/ProductsList";

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

// Фильтрация товаров по запросу
const filterCategories = (categories, searchWords) => {
    const normalizedSearchWords = searchWords.map(normalizeWord).filter(Boolean);
    return categories.filter((g) => {
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
    const [vendors, setVendors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [feed, setFeed] = useState([]);
    const [filteredGoods, setFilteredGoods] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState("RT-IW500 frrevekznjhysq ufqrjdthn");
    const [searchWords, setSearchWords] = useState([]);
    const debounceTimer = useRef(null);

    const handleSearchChange = useCallback((value) => {
        const cleanedValue = value
            .replace(/["'():;\t\r\n#+″“№’°±³\\]/g, "")
            .replace(/\s+/g, " ");

        setInputValue(cleanedValue); // Немедленно обновляем inputValue для пользователя

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            try {
                const wordsArray = cleanedValue.split(" ");

                // Отфильтруем слова для отправки на проверку
                const wordsToCheck = wordsArray.filter((word) => !vendors.includes(word));

                const checked = await spellerYandex(wordsToCheck.join(" ")); // Проверяем только фильтрованные слова

                const correctedWords = wordsArray.map((word) => {
                    if (vendors.includes(word.toUpperCase())) {
                        // Если слово в списке vendors, оставляем как есть
                        return word;
                    }

                    const isFraction = /^\d+\/\d+$/.test(word);
                    const isNumber = /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(word.replace(",", "."));
                    if (isFraction) return word;
                    if (isNumber) return parseFloat(word.replace(",", "."));
                    if (word.length <= 2) return word;

                    // Найдем исправление для слова
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
    }, [inputValue, vendors]);

    // Загрузка товаров
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const { categories, goods, feed } = await fetchGoodsData(token, false);
                const validGoods = goods.filter(
                    (g) => +g.COUNT > 0 && +g.PRICE > 0 // Учитываем только товары с положительным количеством и ценой
                );
                const sortedGoods = sortProductsByBrand(validGoods);
                const sortedProducts = sortedGoods?.map(g => {

                    g.SEARCHABLE_CONTENT = `${g.NAME} ${g.VENDOR}`;
                    g.LINK = categories?.find(c => c.ID === g.CATEGORY_ID).CODE !== 'razdel_ne_opredelen' ?
                        `${categories?.find(c => c.ID === g.CATEGORY_ID).CODE}/${g.CODE}` :
                        g.CODE
                    ;

                    return {
                        ...g,
                    }
                })
                const filteredCategories = categories.filter(c => c.ACTIVE);
                setCategories(filteredCategories);
                setGoods(sortedProducts);
                setVendors(sortedProducts.map(g => g.VENDOR.toUpperCase()));
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

        const matchingCategories = filterCategories(categories, searchWords);
        categories.forEach(c => {

            if ([...new Set(matchingGoods.map(g => g.CATEGORY_ID))].includes(c.ID)) matchingCategories.push(c);
        })
        // console.log('\n matchingCategories', matchingCategories);
        setFilteredCategories(matchingCategories);
    }, [searchWords, goods, categories]);

    // console.log(
    //     '\n ',{
    //         goods,
    //     vendors,
    //          filteredGoods,
    //         loading,
    //         inputValue,
    //         searchWords,
    //         categories,
    //         filteredCategories,
    //     },
    //     '\n filteredGoods', filteredGoods,
    //     '\n filteredCategories', filteredCategories,
    // );

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
                    <Alert severity="success">Всего товаров для поиска {goods?.length || 0}. Найдено:{" "} {filteredGoods?.length || 0} в {filteredCategories?.length || 0} категориях</Alert>
                )}
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : (
                filteredGoods?.length && <Box className="flex-1 flex flex-row gap-2">
                    {inputValue?.length > 3 && <Box className={`w-[500px]`}>
                        <ProductsList
                            goods={filteredGoods}
                            feed={feed}
                            viewmode
                            outsSetIsFeed
                            shortMode
                            categories={filteredCategories}
                        />
                    </Box>}
                    <Box className={`grow ml-4`}>
                        <ProductsList
                            goods={filteredGoods}
                            feed={feed}
                            viewmode
                            outsSetIsFeed
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
}