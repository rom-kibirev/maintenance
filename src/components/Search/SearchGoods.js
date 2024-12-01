import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, TextField } from "@mui/material";
import { fetchGoodsData, spellerYandex } from "../UI/global/sortTools";
import PrintGoods from "./PrintGoods";
import debounce from "lodash.debounce";

export default function SearchGoods({ token }) {
    // const [setAllGoods] = useState([]); // Все товары  allGoods,
    const [goods, setGoods] = useState([]); // Отфильтрованные товары по активным условиям
    const [filteredGoodsByName, setFilteredGoodsByName] = useState(null); // Поиск по имени
    const [filteredGoodsByVendorCode, setFilteredGoodsByVendorCode] = useState(null); // Поиск по вендор-кодам
    const [loading, setLoading] = useState(true); // Индикатор загрузки

    const [userInput, setUserInput] = useState(""); // Ввод пользователя
    const [userSearch, setUserSearch] = useState([]); // Распознанный массив слов

    useEffect(() => {
        // Загрузка всех данных
        const loadData = async () => {
            setLoading(true);
            const { goods } = await fetchGoodsData(token);
            const filteredGoods = goods.filter(
                (g) => +g.quantity > 0 && +g.price > 0 // Фильтрация: товары с наличием и ценой
            );
            // setAllGoods(goods);
            setGoods(filteredGoods);
            setLoading(false);
        };

        loadData();
    }, [token]);

    // Обработка изменения ввода
    const handleSearchChange = debounce(async (input) => {
        setUserInput(input);

        const cleanedInput = input
            .replace(/["'():;\t\r\n#+″“№’°±³\\]/g, "") // Очистка символов
            .toLowerCase();

        const words = cleanedInput
            .split(" ")
            .filter((word) => word.trim().length > 0) // Убираем пустые слова
            .map((word) => {
                if (!isNaN(word.replace(",", "."))) {
                    return parseFloat(word.replace(",", ".")); // Конвертируем числа
                }
                return word;
            })
            .filter((word) => !isNaN(word) || word.length >= 2); // Убираем короткие слова

        const spellRequest = await spellerYandex(words); // Проверка правописания
        setUserSearch(spellRequest.length > 0 ? spellRequest : []);
    }, 500);

    // Фильтрация товаров
    useEffect(() => {
        if (goods.length > 0 && userSearch.length > 0) {
            const validSearchWords = userSearch
                .filter((word) => typeof word === "string" && isNaN(word)) // Только строки
                .map((word) => word.toLowerCase());

            const vendorSearch = [];
            const nameSearch = validSearchWords.map((word) => {
                const checkVendor = goods.filter((g) =>
                    g.vendor_code.toLowerCase().includes(word)
                );
                if (!word.includes("/") && checkVendor.length > 0) {
                    vendorSearch.push(word);
                    return null;
                }
                return word;
            }).filter((w) => w);

            const selectedGoods = nameSearch.length > 0
                ? goods.filter((g) =>
                    nameSearch.every((word) =>
                        g.name.toLowerCase().includes(word)
                    )
                )
                : [];

            // Фильтрация по числовым параметрам
            const hasNumberUserSearch = userSearch.some((item) => typeof item === "number");
            const filterByNumbers = [];

            if (hasNumberUserSearch) {
                selectedGoods.forEach((g) => {
                    const cleanedName = g.name.replace(/[\u0028\u0029\u00AB\u00BB]/g, ""); // Убираем спецсимволы
                    const words = cleanedName.split(" ");
                    const numbersInName = words
                        .filter((word) => /^-?\d*\.?\d+$/.test(word.replace(",", ".")))
                        .map((numStr) => parseFloat(numStr.replace(",", ".")));

                    const numbersInRequest = userSearch.filter((item) => typeof item === "number");
                    if (
                        numbersInName.length > 0 &&
                        numbersInRequest.every((num) => numbersInName.includes(num))
                    ) {
                        filterByNumbers.push(g);
                    }
                });
            }

            setFilteredGoodsByName(filterByNumbers.length > 0 ? filterByNumbers : selectedGoods);

            // Фильтрация по вендорным кодам
            if (vendorSearch.length > 0) {
                const selectedVendorGoods = goods.filter((g) =>
                    vendorSearch.every((word) =>
                        g.vendor_code.toLowerCase().includes(word)
                    )
                );
                setFilteredGoodsByVendorCode(selectedVendorGoods.length > 0 ? selectedVendorGoods : null);
            } else {
                setFilteredGoodsByVendorCode(null);
            }
        } else {
            setFilteredGoodsByName(null);
            setFilteredGoodsByVendorCode(null);
        }
    }, [goods, userSearch]);

    return (
        <Box>
            <Box className="flex flex-wrap flex-row gap-2 items-center mb-4">
                <TextField
                    label="Поиск товаров"
                    variant="outlined"
                    fullWidth
                    onChange={(e) => handleSearchChange(e.target.value)}
                    value={userInput}
                />
                <Alert severity="success">
                    Найдено по имени: {filteredGoodsByName?.length || 0}, по коду: {filteredGoodsByVendorCode?.length || 0}
                </Alert>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : (
                goods?.length > 0 && <PrintGoods
                    filteredGoodsByName={filteredGoodsByName}
                    filteredGoodsByVendorCode={filteredGoodsByVendorCode}
                />
            )}
        </Box>
    );
}
