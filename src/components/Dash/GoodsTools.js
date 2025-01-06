import Page from "../UI/Theme/Page";
import {Alert, Box, Button, CircularProgress, FormControlLabel, Switch, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import CategoriesTree from "./CategoriesTree";
import BrandStatistics from "./BrandStatistics";
import BackupTableIcon from '@mui/icons-material/BackupTable';
// import OpenInBrowserRoundedIcon from "@mui/icons-material/OpenInBrowserRounded";
import StorageIcon from '@mui/icons-material/Storage';
import ProductsList from "./ProductsList";
import {fetchGoodsData, getCategoryDescendants, mergeFeed, sortProductsByBrand} from "../UI/global/sortTools";
import {fetchUserData, uploadGoods} from "../../requests/api_v2";

export default function GoodsTools({token}) {

    const [answer, setAnswer] = useState(null);
    const [categories, setCategories] = useState(null);
    const [goods, setGoods] = useState(null);
    const [feed, setFeed] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(8506);
    const [isFeed, setIsFeed] = useState(true);
    const [isSorted, setIsSorted] = useState(true);
    const [inProgress, setInProgress] = useState(false);

    useEffect(() => {

        const getData = async () => {

            setInProgress(true);
            setAnswer(null);

            try {

                const { categories, goods, feed } = await fetchGoodsData(token);
                setCategories(categories);
                if (goods?.length && feed?.length) {

                    const filterGoods = () => {

                        const categoriesId = [selectedCategory, ...getCategoryDescendants(selectedCategory, categories)];
                        const filtered = goods?.filter(good => categoriesId?.includes(good?.CATEGORY_ID));

                        return filtered;
                    }

                    const currentGoods = selectedCategory ? filterGoods() : goods;
                    const feedGoods = isFeed ? mergeFeed(currentGoods, feed) : currentGoods;
                    const sortedGoods = (feedGoods?.length && isSorted) ? sortProductsByBrand(feedGoods) : feedGoods;

                    setGoods(sortedGoods);
                    setFeed(feed);
                    setInProgress(false);
                }

                const response = await fetchUserData(token);
                if (response.success) setCurrentUser(response.data);

            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setAnswer({
                    severity: "error",
                    message: `Ошибка при загрузке данных: ${error.status}`
                })
            }
        };

        getData();
    }, [token, isFeed, isSorted, selectedCategory]);

    const handleUpload = async () => {

        setInProgress(true);

        const result = await uploadGoods(token, goods);
        if (result?.severity === "success") setAnswer(result);
    };

    return (
        <Page
            label="Управление товарами"
            subtitle="Сортировка товаров"
        >
            <Box className={`flex flex-wrap gap-2 p-1 border border-cyan-700 rounded`}>
                {inProgress && <CircularProgress color="info" size={20} sx={{marginY: "auto"}} />}
                {answer && (<Alert severity={answer?.severity || "info"}>{answer?.message || ""}</Alert>)}
                <TextField
                    label='Количество товаров'
                    variant="outlined"
                    disabled
                    value={goods?.length || 0}
                    size="small"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={isFeed}
                            color="success"
                            onChange={() => setIsFeed(!isFeed)}
                        />
                    }
                    label={`Данные ${!isFeed ? "с сайта" : "из фида"}`}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={isSorted}
                            color="secondary"
                            onChange={() => setIsSorted(!isSorted)}
                        />
                    }
                    label={`Сортировка ${!isSorted ? "с сайта" : "автоматическая"}`}
                />
                <Button
                    variant="outlined"
                    color="success"
                    // onClick={() => exportGoodsToXLSX(categories, goodsInCategory)}
                    size="small"
                ><BackupTableIcon /></Button>
                {currentUser?.user_id === 23 && <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleUpload}
                    size="small"
                ><StorageIcon/></Button>}
                {/*{currentUser?.user_id === 23 && <Button*/}
                {/*    variant="outlined"*/}
                {/*    color="error"*/}
                {/*    // onClick={upDateGoods}*/}
                {/*    size="small"*/}
                {/*><OpenInBrowserRoundedIcon/></Button>}*/}
            </Box>
            <Box className="grow flex flex-row gap-2 pt-3">
                {categories?.length > 0 && (
                    <CategoriesTree
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        editShow
                    />
                )}
                {(goods?.length) && <Box className="flex-1">
                    <BrandStatistics
                        goods={goods}
                    />
                    <ProductsList
                        goods={goods}
                        feed={feed || []}
                    />
                </Box>}
            </Box>
        </Page>
    )
}