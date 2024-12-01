import React, { useEffect, useState } from "react";
import Page from "../UI/Theme/Page";
import {fetchCategoryData, fetchUserData, patchCategories} from "../../requests/api_v2";
import CategoriesTree from "./CategoriesTree";
import {Box, FormControlLabel, Switch} from "@mui/material";
import GoodsList from "./GoodsList";
import * as XLSX from 'xlsx';
import SortGoodsTools from "./SortGoodsTools";
import AddCategoryImages from "./AddCategoryImages";
import {fetchGoodsData} from "../UI/global/sortTools";

export const FeedGoodsDiff = ({ token }) => {
    
    const [categoriesBySite, setCategoriesBySite] = useState(null);
    const [goodsBySite, setGoodsBySite] = useState(null);
    const [filteredGoodsBySite, setFilteredGoodsBySite] = useState(null);
    const [goodsByFeed, setGoodsByFeed] = useState(null); // setGoodsByFeed
    const [selectedCategory, setSelectedCategory] = useState(null); // 8785
    const [categoriesIsView, setCategoriesIsView] = useState(true);

    if (selectedCategory) console.log('\n selectedCategory', selectedCategory);

    const [currentUser, setCurrentUser] = useState(null);
    const [isSortGoods, setIsSortGoods] = useState(false);
    const [isAddCategoryImage, setIsAddCategoryImage] = useState(false);

    useEffect(() => {
        const getData = async () => {
            try {
                const categoriesResponse = await fetchCategoryData(token);
                if (categoriesResponse.success) setCategoriesBySite(categoriesResponse.data.sort((a, b) => a.SORT - b.SORT));
                //
                // const goodsData = await fetchGoodsSelfApiData(token);
                // console.log('\n goodsData', goodsData);

                const { goods, feed } = await fetchGoodsData(token, true);
                // console.log('\n sortedGoods', goods);

                setGoodsBySite(goods);
                setFilteredGoodsBySite(goods);
                setGoodsByFeed(feed);

                const response = await fetchUserData(token);
                if (response.success) setCurrentUser(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        getData();
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
                    g.PICTURES.filter(p => p).length,
                    g.PICTURES.map(p => p ? 'https://runtec-shop.ru/' + p : null).join(','),
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

    // console.log('\n ', {
    //     goodsBySite,
    //     goodsByFeed,
    // });

    const patchCategoryImage = async (img) => {
        try {

            const currentCategory = categoriesBySite?.find(c => c.ID === selectedCategory);

            currentCategory.PREVIEW_PICTURE = 'https://runtec-shop.ru/' + img;

            // console.log('\n patchCategoryImage', {
            //     // categoriesBySite,
            //     currentCategory,
            //     img,
            // });
            
            const response = await patchCategories(token, [currentCategory]);
            // console.log('\n ', response.success);
            if (response.success) {
                const categoriesResponse = await fetchCategoryData(token);
                if (categoriesResponse.success) setCategoriesBySite(categoriesResponse.data.sort((a, b) => a.SORT - b.SORT));
            }
        } catch (error) {
            console.error('Error patching category image:', error);
        }
    }

    // console.log('\n ', {
    //         filteredGoodsBySite,
    //         goodsByFeed,
    //     },
    //     (filteredGoodsBySite && goodsByFeed),
    //     filteredGoodsBySite?.length, goodsByFeed?.length,
    //     (filteredGoodsBySite?.length > 0 && goodsByFeed?.length > 0),
    // );

    return (
        <Page
            label="Сравнение по фиду"
            subtitle=""
            className="h-full"
        >
            {(currentUser?.user_id === 23) && <Box>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isSortGoods}
                            color="error"
                            onChange={() => setIsSortGoods(!isSortGoods)}
                        />
                    }
                    label={`${!isSortGoods ? "Сортировать товары" : "Отмена"}`}
                />
            </Box>}
            {(!isSortGoods) && <Box>
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
                <FormControlLabel
                    control={
                        <Switch
                            checked={!!isAddCategoryImage}
                            color="success"
                            onChange={() => setIsAddCategoryImage(!isAddCategoryImage)}
                        />
                    }
                    label={`${!isSortGoods ? "Добавить изображение категории" : "Отмена"}`}
                />
                <Box className="h-full flex flex-row gap-2">
                    {categoriesIsView && <Box className="w-[400px] h-full">
                        {categoriesBySite && (
                            <CategoriesTree
                                categories={categoriesBySite}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                isAddCategoryImage={isAddCategoryImage}
                            />
                        )}
                    </Box>}
                    <Box className="flex-1">
                        {(isAddCategoryImage && goodsBySite) ? <AddCategoryImages
                                selectedCategory={selectedCategory}
                                categories={categoriesBySite}
                                goods={goodsBySite}
                                patchCategoryImage={patchCategoryImage}
                            /> :
                            (filteredGoodsBySite?.length > 0 && goodsByFeed?.length > 0) &&
                            <GoodsList
                                selectedCategory={selectedCategory}
                                categories={categoriesBySite}
                                goods={filteredGoodsBySite}
                                feed={goodsByFeed}
                                exportXLSX={exportXLSX}
                            />
                        }
                    </Box>
                </Box>
            </Box>}
            {(isSortGoods && currentUser?.user_id === 23) && <SortGoodsTools
                goods={filteredGoodsBySite}
                setGoods={setFilteredGoodsBySite}
                token={token}
            />}
        </Page>
    );
};