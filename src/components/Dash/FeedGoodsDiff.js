import React, { useEffect, useState } from "react";
import Page from "../UI/Theme/Page";
import {fetchCategoryData, patchCategories} from "../../requests/api_v2";
import CategoriesTree from "./CategoriesTree";
import {Box, FormControlLabel, Switch} from "@mui/material";
import ProductsList from "./ProductsList";
import AddCategoryImages from "./AddCategoryImages";
import {fetchGoodsData} from "../UI/global/sortTools";

export default function FeedGoodsDiff ({ token }) {
    
    const [categoriesBySite, setCategoriesBySite] = useState(null);
    const [goodsBySite, setGoodsBySite] = useState(null);
    const [filteredGoodsBySite, setFilteredGoodsBySite] = useState(null);
    const [goodsByFeed, setGoodsByFeed] = useState(null); // setGoodsByFeed
    const [selectedCategory, setSelectedCategory] = useState(null); // 8785
    const [categoriesIsView, setCategoriesIsView] = useState(true);

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

    // const exportXLSX = () => {
    //     exportGoodsToXLSX(goodsBySite, goodsByFeed, categoriesBySite);
    // }

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

    return (
        <Page
            label="Сравнение по фиду"
            subtitle=""
            className="h-full"
        >
            <Box>
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
                    label={`${!isAddCategoryImage ? "Добавить изображение категории" : "Отмена"}`}
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
                            <ProductsList
                                goods={filteredGoodsBySite}
                                feed={goodsByFeed}
                                isTollsStat
                                viewmode
                                outsSetIsFeed
                            />
                        }
                    </Box>
                </Box>
            </Box>
        </Page>
    );
};