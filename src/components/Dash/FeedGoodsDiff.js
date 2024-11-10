import React, { useEffect, useState } from "react";
import Page from "../UI/Theme/Page";
import axios from "axios";
import { fetchCategoryData } from "../../requests/api_v2";
import CategoriesTree from "./CategoriesTree";
import {Box, FormControlLabel, Switch} from "@mui/material";
import GoodsList from "./GoodsList";
import * as XLSX from 'xlsx';

export const FeedGoodsDiff = ({ token }) => {
    
    const [categoriesBySite, setCategoriesBySite] = useState(null);
    const [goodsBySite, setGoodsBySite] = useState(null);
    const [filteredGoodsBySite, setFilteredGoodsBySite] = useState(null);
    const [goodsByFeed, setGoodsByFeed] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null); // 8785
    const [categoriesIsView, setCategoriesIsView] = useState(true);

    useEffect(() => {
        const getGoodsData = async () => {
            try {
                const categoriesResponse = await fetchCategoryData(token);
                if (categoriesResponse.success) setCategoriesBySite(categoriesResponse.data.sort((a, b) => a.SORT - b.SORT));

                const lastFileNumber = 7;
                const filePromises = [];
                const allGoods = new Map();  // Используем Map для устранения дублирующихся ключей

                for (let i = 1; i <= lastFileNumber; i++) {
                    const fileName = `all_products_part_${i}.json`;

                    filePromises.push(
                        axios.get(`./data/api_v2/goods/${fileName}`)
                            .then(response => response.data)
                            .catch(error => {
                                console.log(`Ошибка при загрузке ${fileName}:`, error);
                                return null;
                            })
                    );
                }

                const responses = await Promise.all(filePromises);

                responses.forEach(response => {
                    if (response) {
                        response.forEach(good => {
                            // Проверка на уникальность ID
                            if (!allGoods.has(good.ID)) {
                                allGoods.set(good.ID, good);
                            }
                        });
                    }
                });

                const goodsArray = Array.from(allGoods.values()).sort((a, b) => {
                    // Сначала сортируем по свойству SORT
                    if (a.SORT !== b.SORT) {
                        return a.SORT - b.SORT;
                    }

                    // Преобразуем бренды в нижний регистр для точного совпадения
                    const brandA = a.BRAND ? a.BRAND.toLowerCase() : '';
                    const brandB = b.BRAND ? b.BRAND.toLowerCase() : '';

                    // Определяем порядок брендов
                    const brandOrder = ['runtec', 'garwin', 'licota', 'металлсервис'];

                    // Функция для получения индекса бренда в списке
                    const getBrandIndex = (brand) => {
                        // Ищем индекс в списке, если бренд не найден, возвращаем очень большой индекс
                        return brandOrder.findIndex(b => brand.includes(b)) !== -1 ? brandOrder.findIndex(b => brand.includes(b)) : brandOrder.length;
                    };

                    // Сортируем по брендам
                    return getBrandIndex(brandA) - getBrandIndex(brandB);
                });

                setGoodsBySite(goodsArray);
                setFilteredGoodsBySite(goodsArray);

                const goodsByFeedUpdate = await axios.get(`./data/api_v2/goods/products.json`)
                    .then(response => response.data)
                    .catch(error => {
                        console.log(`Ошибка при загрузке feed data`, error);
                        return null;
                    });

                setGoodsByFeed(goodsByFeedUpdate);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        getGoodsData();
    }, [token]);

    useEffect(() => {
        if (selectedCategory && goodsBySite) {
            const filteredGoods = goodsBySite.filter(good => good.CATEGORY_ID === selectedCategory);
            setFilteredGoodsBySite(filteredGoods);
        } else {
            setFilteredGoodsBySite(goodsBySite);
        }
    }, [selectedCategory, goodsBySite]);

    // if (filteredGoodsBySite) console.log('\n filteredGoodsBySite', filteredGoodsBySite);
    // console.log('\n selectedCategory', selectedCategory);

    const exportXLSX = () => {
        // Предварительно создаем карту товаров для быстрого доступа по CATEGORY_ID
        const goodsMap = goodsBySite.reduce((acc, g) => {
            if (!acc[g.CATEGORY_ID]) acc[g.CATEGORY_ID] = [];
            acc[g.CATEGORY_ID].push(g);
            return acc;
        }, {});

        // Карта товаров по VENDOR для быстрого поиска
        const goodsFeedMap = (goodsByFeed || []).reduce((acc, f) => {
            acc[f.VENDOR] = f;
            return acc;
        }, {});

        // Основной экспорт данных
        const exportData = categoriesBySite.reduce((acc, c) => {
            // Заголовок категории
            acc.push([
                'Категория',
                c.ID,
                c.XML_ID,
                c.NAME,
            ]);

            // Товары внутри категории
            const goods = (goodsMap[c.ID] || []).map(g => {
                const goodFeed = goodsFeedMap[g.VENDOR] || {};
                return [
                    'Товар',
                    g.ID,
                    g.XML_ID,
                    g.NAME,
                    g.PICTURES.length,
                    g.PICTURES.map(p => 'https://runtec-shop.ru/' + p).join(','),
                    '', // Стоимость на сайте (возможно, нужно доработать)
                    '', // Остатки на сайте (возможно, нужно доработать)
                    goodFeed.picture?.length || 0,
                    (goodFeed.picture || []).join(','),
                    goodFeed.price || '',
                    goodFeed.count || '',
                ];
            });

            // Добавляем товары в категорию
            acc.push(...goods);
            return acc;
        }, []);

        // Заголовок таблицы
        exportData.unshift([
            'Тип',
            'ID',
            'GUID 1C',
            'Наименование',
            'Изображений на сайте',
            'Изображения',
            'Стоимость на сайте',
            'Остатки на сайте',
            'Изображений в фиде',
            'Изображения',
            'Стоимость в фиде',
            'Остатки в фиде',
        ]);

        // Создание рабочей книги и добавление листа
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Экспорт');

        // Генерация файла и скачивание
        XLSX.writeFile(workbook, 'Сравнение с фидом.xlsx');

        console.log('\n exportXLSX', {
            exportData,
        });
    };


    return (
        <Page
            label="Сравнение по фиду"
            subtitle=""
            className="h-full"
        >
            <FormControlLabel
                control={
                    <Switch
                        checked={categoriesIsView}
                        color="warning"
                        onChange={() => setCategoriesIsView(!categoriesIsView)}
                    />
                }
                label={`${categoriesIsView ? "Показать" : "Скрыть"} категории`}
            />
            <Box className="h-full flex flex-row gap-2">
                {categoriesIsView && <Box className="w-[400px] h-full">
                    {categoriesBySite && (
                        <CategoriesTree
                            categories={categoriesBySite}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                        />
                    )}
                </Box>}
                <Box className="flex-1">
                    {(filteredGoodsBySite?.length > 0 && goodsByFeed?.length > 0) && <GoodsList
                        selectedCategory={selectedCategory}
                        categories={categoriesBySite}
                        goods={filteredGoodsBySite}
                        feed={goodsByFeed}
                        exportXLSX={exportXLSX}
                    />}
                </Box>
            </Box>
        </Page>
    );
};
