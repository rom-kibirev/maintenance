
import {outCategoryList, outProductList} from "../../data/infoForOutside";
import Page from "../UI/Theme/Page";
import PrintCategories from "../Dash/PrintCategories";
import React, {useEffect, useState} from "react";
import {Box} from "@mui/material";
import ProductsList from "../Dash/ProductsList";
import {fetchGoodsData} from "../UI/global/sortTools";
import Header from "../UI/Theme/Header";

export default function CatalogView () {

    const [goodsByFeed, setGoodsByFeed] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const {feed} = await fetchGoodsData(null, false);
                setGoodsByFeed(feed);
            } catch (e) {
                console.log('\n ', e);
            }
        }

            getData();
        }, []);

    // console.log('\n CatalogView', {
    //     outCategoryList,
    //     outProductList,
    //     goodsByFeed
    // });

    return (
        <Page
            label="Каталог товаров"
            subtitle=""
        >
            <Box className={`flex flex-col gap-2`}>
                {/**/}
                <PrintCategories
                    data={outCategoryList}
                    out
                    previewProducts={outProductList}
                    feed={goodsByFeed}
                    viewmode
                />
                <Header
                    title='Карточка товара'
                    subtitle='сокращенный вид'
                />
                <ProductsList
                    goods={outProductList}
                    feed={goodsByFeed}
                    isTollsStat
                    viewmode
                />
            </Box>
        </Page>
    );
}