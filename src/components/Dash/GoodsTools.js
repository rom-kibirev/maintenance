import Page from "../UI/Theme/Page";
import {Alert, Box, Button, CircularProgress, FormControlLabel, Switch, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import CategoriesTree from "./CategoriesTree";
import BrandStatistics from "./BrandStatistics";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ProductsList from "./ProductsList";
import {fetchGoodsData, getCategoryDescendants, mergeFeed, sortProductsByBrand} from "../UI/global/sortTools";
import {fetchUserData, uploadGoods} from "../../requests/api_v2";
import {checkAccess} from "../UI/global/userStatus";

export default function GoodsTools({token}) {

    const [answer, setAnswer] = useState(null);
    const [categories, setCategories] = useState(null);
    const [goods, setGoods] = useState(null);
    const [feed, setFeed] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(8165);
    const [isFeed, setIsFeed] = useState(true);
    const [isSorted, setIsSorted] = useState(false);
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

        if (checkAccess(currentUser)) {
            const result = await uploadGoods(token, goods);
            if (result?.severity === "success") setAnswer(result);
        }
    };

    // console.log(`\n selectedCategory`, selectedCategory);

    return (
        <Page
            label="Управление товарами"
            subtitle="Сортировка товаров"
        >
            <Box className={`flex flex-wrap gap-2 p-3 border bg-amber-500/5 border-amber-500/50 rounded`}>
                {inProgress && <CircularProgress color="info" size={20} sx={{marginY: "auto"}} />}
                {answer && (<Alert severity={answer?.severity || "info"}>{answer?.message || ""}</Alert>)}
                <TextField
                    label='Количество товаров'
                    variant="outlined"
                    disabled
                    value={goods?.length || 0}
                    size="small"
                    sx={{width: 125}}
                />
                {selectedCategory && <TextField
                    label='Выбранная категория'
                    variant="outlined"
                    disabled
                    value={categories?.find(c => c.ID === selectedCategory)?.NAME || ""}
                    size="small"
                    sx={{width: 150}}
                />}
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
                    variant="contained"
                    color="info"
                    // onClick={() => exportGoodsToXLSX(categories, goodsInCategory)}
                    size="small"
                ><BackupTableIcon /></Button>
                {checkAccess(currentUser) && <Button
                    variant="contained"
                    color="error"
                    onClick={handleUpload}
                    size="small"
                ><CloudUploadOutlinedIcon/></Button>}
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