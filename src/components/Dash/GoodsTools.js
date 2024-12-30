import React, {useEffect, useState} from "react";
import Page from "../UI/Theme/Page";
import {fetchUserData} from "../../requests/api_v2";
import {exportGoodsToXLSX, fetchGoodsData, getCategoryDescendants, sortProductsByBrand} from "../UI/global/sortTools";
import {Alert, Box, Button, CircularProgress, FormControlLabel, Switch} from "@mui/material";
import CategoriesTree from "./CategoriesTree";
import ProductsList from "./ProductsList";
import BrandStatistics from "./BrandStatistics";
import {getGoodsStatus} from "../../requests/local_php";
// import {fetchFeedData, fetchGoodsMainData} from "../../requests/api_main";

export default function GoodsTools ({token}) {

    const [categories, setCategories] = useState(null);
    const [goods, setGoods] = useState(null);
    const [, setCurrentUser] = useState(null); // currentUser
    const [selectedCategory, setSelectedCategory] = useState(null); //
    const [categoriesIsView, setCategoriesIsView] = useState(true);
    const [isSortGoods, setIsSortGoods] = useState(true);
    const [sortedGoods, setSortedGoods] = useState(null);

    const [loading, setLoading] = useState(null);

    useEffect(() => {

        setLoading(null);

        const getData = async () => {
            try {

                const getDataLocal = await getGoodsStatus(token);
                console.log('\n getDataLocal', getDataLocal);

                const { categories, goods } = await fetchGoodsData(token, true);
                setCategories(categories);
                setGoods(goods);

                const response = await fetchUserData(token);
                if (response.success) setCurrentUser(response.data);


                const sorted = sortProductsByBrand(goods);
                setSortedGoods(sorted);

                // const goodsLimit = 10;
                // const [feedData, goodsData] = await Promise.all([
                //     fetchFeedData(),
                //     fetchGoodsMainData(token, goodsLimit),
                // ]);
                // console.log('\n main',
                //     {
                //         feedData,
                //         goodsData
                //     }
                // );
                // setLoading({
                //     "feedData": {
                //         "status": "info",
                //         "message": "Another process is currently running.",
                //         "data": []
                //     },
                //     "goodsData": {
                //         "status": "info",
                //         "message": "Another process is currently running.",
                //         "data": []
                //     }
                // });

            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setLoading({
                    "error": {
                        "status": "error",
                        "message": error.message,
                        "data": ['error']
                    }
                });
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

    // const promoCategories = goods?.length && categories?.map((c,i) => {
    //
    //     const good = goods?.find(good => good.CATEGORY_ID === good?.ID);
    //
    //     return {
    //         "ID": c.ID,
    //         "NAME": c.NAME,
    //         "ACTIVE": c.ACTIVE,
    //         "GOODS_PREVIEW": good?.ID || c.GOODS_PREVIEW,
    //         "IBLOCK_SECTION_ID": c.IBLOCK_SECTION_ID,
    //         "CODE": c.CODE,
    //         "PREVIEW_PICTURE": c.PREVIEW_PICTURE,
    //         "SORT": c.SORT,
    //     }
    // })
    // const products = outCategoryList?.map(c => {
    //
    //     const good = goods?.find(good => good.ID === c.GOODS_PREVIEW);
    //
    //     return {
    //         "ACTIVE": good?.ACTIVE,
    //         "BRAND": good?.BRAND,
    //         "CATEGORY_ID": good?.CATEGORY_ID,
    //         "CODE": good?.CODE,
    //         "COUNTRY": good?.COUNTRY,
    //         "ID": good?.ID,
    //         "VENDOR": good?.VENDOR,
    //         "PRICE": good?.PRICE,
    //         "NAME": good?.NAME,
    //         "PICTURES": good?.PICTURES,
    //         "PREVIEW_PICTURE": good?.PREVIEW_PICTURE,
    //     };
    // }).filter(g => g.ID);

    // console.log('\n GoodsTools', {
    //     // categories,
    //     // promoCategories,
    //     // selectedCategory,
    //     goods,
    //     // sortedGoods,
    //     // goodsInCategory,
    //     // currentUser,
    // });
    
    // if (loading) console.log('\n loading', loading);

    return (
        <Page
            label="Управление товарами"
            subtitle=""
        >
            {loading && Object.keys(loading)?.map(key => {

                const answer = loading[key];

                    return (
                        answer && <Alert key={key} severity={loading[key].status}>
                            <Box className={`flex gap-3`}>
                                {!loading[key].data?.length && <CircularProgress color={loading[key].status} size={20}/>}
                                {loading[key].message}
                            </Box>
                        </Alert>
                    );
                })}
            <Box className="flex flex-row gap-2">
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
                        <ProductsList
                            selectedCategory={selectedCategory}
                            categories={categories}
                            goods={isSortGoods ? sortedGoods : goodsInCategory}
                            feed={[]}
                            viewmode
                        />
                    </Box>}
                </Box>
            </Box>
        </Page>
    );
}