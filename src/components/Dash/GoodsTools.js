import React, {useEffect, useState} from "react";
import Page from "../UI/Theme/Page";
import {fetchUserData} from "../../requests/api_v2";
import {exportGoodsToXLSX, fetchGoodsData, getCategoryDescendants, sortProductsByBrand} from "../UI/global/sortTools";
import {Box, Button, FormControlLabel, Switch} from "@mui/material";
import CategoriesTree from "./CategoriesTree";
import GoodsList from "./GoodsList";
import BrandStatistics from "./BrandStatistics";

export const GoodsTools = ({token}) => {

    const [categories, setCategories] = useState(null);
    const [goods, setGoods] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null); //
    const [categoriesIsView, setCategoriesIsView] = useState(true);
    const [isSortGoods, setIsSortGoods] = useState(true);
    const [sortedGoods, setSortedGoods] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {

                const { categories, goods } = await fetchGoodsData(token, true);
                setCategories(categories);
                setGoods(goods);

                const response = await fetchUserData(token);
                if (response.success) setCurrentUser(response.data);


                const sorted = sortProductsByBrand(goods);
                setSortedGoods(sorted);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        getData();
    }, [token]);

    const [goodsInCategory, setGoodsInCategory] = useState(null);

    useEffect(() => {

        const refreshData = async () => {
            if (goods?.length) {

                const categoriesId = [selectedCategory, ...getCategoryDescendants(selectedCategory, categories)];
                // console.log('\n categoriesId', categoriesId);

                const filteredGoods = goods?.filter(good => categoriesId.includes(good.CATEGORY_ID));
                // console.log('\n filteredGoods', filteredGoods);
                if (filteredGoods?.length) {
                    setGoodsInCategory(filteredGoods);

                    const sorted = sortProductsByBrand(filteredGoods);
                    setSortedGoods(sorted);
                } else {
                    setGoodsInCategory(goods);

                    const sorted = sortProductsByBrand(goods);
                    setSortedGoods(sorted);
                }
            }
        }

        refreshData();
    }, [goods, categories, selectedCategory, isSortGoods, token]);

    console.log('\n GoodsTools', {
        // categories,
        // selectedCategory,
        // goods,
        // sortedGoods,
        goodsInCategory,
        currentUser,
    });

    return (
        <Page
            label="Управление товарами"
            subtitle=""
        >
            <Box className="h-full flex flex-row gap-2">
                <FormControlLabel
                    control={
                        <Switch
                            checked={categoriesIsView}
                            color="warning"
                            onChange={() => setCategoriesIsView(!categoriesIsView)}
                        />
                    }
                    label={`${!categoriesIsView ? "Показать" : "Скрыть"} категории`}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={isSortGoods}
                            color="error"
                            onChange={() => setIsSortGoods(!isSortGoods)}
                        />
                    }
                    label={`${isSortGoods ? "Отмена" : "Сортировать товары"}`}
                />
            </Box>
            <Box className="h-full flex flex-row gap-2">
                {categoriesIsView && <Box className="w-[400px] h-full">
                    {categories?.length > 0 && (
                        <CategoriesTree
                            categories={categories}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                        />
                    )}
                </Box>}
                <Box className="flex-1">
                    {(sortedGoods?.length && goodsInCategory?.length) && <Box>
                        <Button
                            variant="outlined"
                            sx={{mb:2}}
                            color="success"
                            onClick={() => exportGoodsToXLSX(categories, goodsInCategory)}
                        >Скачать xlsx</Button>
                        <BrandStatistics
                            goods={isSortGoods ? sortedGoods : goodsInCategory}
                        />
                        <GoodsList
                            selectedCategory={selectedCategory}
                            categories={categories}
                            goods={isSortGoods ? sortedGoods : goodsInCategory}
                            feed={[]}
                            viewmode={true}
                        />
                    </Box>}
                </Box>
            </Box>
        </Page>
    );
}