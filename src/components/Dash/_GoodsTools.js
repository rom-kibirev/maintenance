import React, {useEffect, useState} from "react";
import Page from "../UI/Theme/Page";
import {fetchUserData} from "../../requests/api_v2";
import {
    exportGoodsToXLSX,
    fetchGoodsData,
    getCategoryDescendants,
    mergeFeed,
    sortProductsByBrand
} from "../UI/global/sortTools";
import {Alert, Box, Button, CircularProgress, FormControlLabel, Switch} from "@mui/material";
import CategoriesTree from "./CategoriesTree";
import ProductsList from "./ProductsList";
import BrandStatistics from "./BrandStatistics";
import OpenInBrowserRoundedIcon from "@mui/icons-material/OpenInBrowserRounded";
import {sendPy} from "../../requests/py";

export default function GoodsTools ({token}) {

    const [categories, setCategories] = useState(null);
    const [goods, setGoods] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // currentUser
    const [selectedCategory, setSelectedCategory] = useState(null); //
    const [categoriesIsView, setCategoriesIsView] = useState(true);
    const [isSortGoods, setIsSortGoods] = useState(false);
    const [sortedGoods, setSortedGoods] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(null);
    const [goodsInCategory, setGoodsInCategory] = useState(null);

    useEffect(() => {

        setLoading(null);

        const getData = async () => {
            try {

                const { categories, goods, feed } = await fetchGoodsData(token, true);
                setCategories(categories);
                if (goods?.length && feed?.length) {
                    setGoods(mergeFeed(goods, feed));
                }

                const response = await fetchUserData(token);
                if (response.success) setCurrentUser(response.data);

                const sorted = sortProductsByBrand(goods);
                setSortedGoods(sorted);

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

    useEffect(() => {

        const refreshData = async () => {
            if (goods?.length && isSortGoods) {

                const categoriesId = [selectedCategory, ...getCategoryDescendants(selectedCategory, categories)];
                // console.log('\n categoriesId', categoriesId);

                const filteredGoods = goods?.filter(good => categoriesId.includes(good.CATEGORY_ID));
                // console.log('\n filteredGoods', filteredGoods);
                if (filteredGoods?.length) {
                    setGoodsInCategory(filteredGoods);
                } else {
                    setGoodsInCategory(goods);
                }

                const sorted = sortProductsByBrand(filteredGoods, "count");
                setSortedGoods(sorted);
            }
            else {
                window.location.reload();
            }
        }

        refreshData();
    }, [goods, categories, selectedCategory, isSortGoods, token]);

    const upDateGoods = async () => {


        if (!currentUser) {
            setAnswer({ severity: "error", message: "Пользователь не авторизован" });
            return;
        }

        try {

            const sendData = await sendPy(`Bearer ${token}`, sortedGoods, 'goods');

            console.log(`\n sendChangedCategoriesHandler`, sendData);
        } catch (error)  {
            setAnswer({ severity: "error", message: error.message });
        }
    }

    // console.log(`\n currentUser`, currentUser);

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
            {answer && (<Alert severity={answer.severity || "info"}>{answer.message}</Alert>)}
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
            <Box className="flex flex-row gap-2">
                {categoriesIsView && <Box className="w-[400px]">
                    {categories?.length > 0 && (
                        <CategoriesTree
                            categories={categories}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            editShow
                        />
                    )}
                </Box>}
                <Box className="flex-1">
                    {(sortedGoods?.length && goodsInCategory?.length) && <Box>
                        <Box className={`flex gap-2`}>
                            <BrandStatistics
                                goods={isSortGoods ? sortedGoods : goodsInCategory}
                            />
                            <Box className={`flex gap-2 flex-col items-center`}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={() => exportGoodsToXLSX(categories, goodsInCategory)}
                                >Скачать xlsx</Button>
                                {currentUser?.user_id === 23 && <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<OpenInBrowserRoundedIcon/>}
                                    onClick={upDateGoods}
                                >Обновить данные</Button>}
                            </Box>
                        </Box>
                        <ProductsList
                            goods={isSortGoods ? sortedGoods : goodsInCategory}
                        />
                    </Box>}
                </Box>
            </Box>
        </Page>
    );
}