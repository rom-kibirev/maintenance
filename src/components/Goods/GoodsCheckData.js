import Page from "../UI/Theme/Page";
import { Box, FormControlLabel, Switch, TextField } from "@mui/material";
import GoodsDataLoader from "./GoodsDataLoader";
import React, { useEffect, useState, useCallback } from "react";
import useLocalStorage from "../UI/global/useLocalStorage";
import PricesDataLoader from "./PricesDataLoader";
import FeedDataLoader from "./FeedDataLoader";
import QuantityDataLoader from "./QuantityDataLoader";
import ProductGrid from "./ProductGrid";

export default function GoodsCheckData({ token }) {
    const [products, setProducts] = useState([]);
    const [isServer, setIsServer] = useLocalStorage("isServer", false);
    const [isActive, setIsActive] = useLocalStorage("isActive", true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [priceProducts, setPriceProducts] = useState([]);
    const [feedPrice, setFeedPrice] = useState([]); // Состояние для цен из фида
    const [feedQuantity, setFeedQuantity] = useState([]); // Состояние для остатков из фида
    const [quantityProducts, setQuantityProducts] = useState([]);

    // Мемоизация функции для передачи продуктов
    const handleSetProducts = useCallback((newProducts) => {
        setProducts(newProducts);
    }, []);

    // Мемоизация функции для передачи цен
    const handleSetPriceProducts = useCallback((newPrices) => {
        setPriceProducts(newPrices);
    }, []);

    // Мемоизация функции для передачи остатков
    const handleSetQuantityProducts = useCallback((newQuantities) => {
        setQuantityProducts(newQuantities);
    }, []);

    // Функция для обработки данных фида и разделения на цены и остатки
    const handleSetFeedProducts = useCallback((feedData) => {
        const prices = feedData
            .filter(item => item.price > 0)
            .map(item => ({
                VENDOR: item.VENDOR,
                price: item.price
            }));

        const quantities = feedData
            .filter(item => item.warehouse && item.warehouse.length > 0)
            .map(item => ({
                VENDOR: item.VENDOR,
                warehouse: item.warehouse
            }));

        setFeedPrice(prices);
        setFeedQuantity(quantities);
    }, []);

    useEffect(() => {
        if (products?.length) {
            const filtered = products.filter((product) => product.ACTIVE === isActive);
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts([]);
        }
    }, [products, isActive]);

    if (filteredProducts?.length) {
        console.log("\n GoodsCheckData", {
            filteredProducts,
            priceProducts,
            feedPrice,
            feedQuantity,
            quantityProducts,
        });
    }

    return (
        <Page label="Товары цены/фид/остатки">
            <Box className="flex flex-col gap-2 p-3 border bg-zinc-900/50 border-amber-500/20 rounded">
               <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                   <GoodsDataLoader
                       token={token}
                       server={false}
                       putProducts={handleSetProducts}
                   />
                   {filteredProducts?.length && <>
                       <PricesDataLoader
                           token={token}
                           server={isServer}
                           putPrices={handleSetPriceProducts}
                       />
                       <QuantityDataLoader
                           token={token}
                           server={isServer}
                           putQuantities={handleSetQuantityProducts}
                       />
                       <FeedDataLoader putFeedProducts={handleSetFeedProducts} />
                   </>}
                   <FormControlLabel
                       control={
                           <Switch
                               checked={isServer}
                               color="success"
                               onChange={() => {
                                   setIsServer(!isServer);
                                   setFilteredProducts([]);
                               }}
                           />
                       }
                       label={`Данные с ${!isServer ? "локального сервера" : "сайта"}`}
                   />
                   <FormControlLabel
                       control={
                           <Switch
                               checked={isActive}
                               color="success"
                               onChange={() => setIsActive(!isActive)}
                           />
                       }
                       label={`${!isActive ? "Выключенные" : "Включенные"} товары`}
                   />
               </Box>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                    <TextField
                        label="Товары"
                        disabled
                        value={filteredProducts?.length || 0}
                        size="small"
                        sx={{ width: 120, my: "auto" }}
                    />
                    <TextField
                        label="Цены"
                        disabled
                        value={priceProducts?.length || 0}
                        size="small"
                        sx={{ width: 120, my: "auto" }}
                    />
                    <TextField
                        label="Остатки"
                        disabled
                        value={quantityProducts?.length || 0}
                        size="small"
                        sx={{ width: 120, my: "auto" }}
                    />
                    <TextField
                        label="Фид (цены)"
                        disabled
                        value={feedPrice?.length || 0}
                        size="small"
                        sx={{ width: 120, my: "auto" }}
                    />
                    <TextField
                        label="Фид (остатки)"
                        disabled
                        value={feedQuantity?.length || 0}
                        size="small"
                        sx={{ width: 120, my: "auto" }}
                    />
                </Box>
            </Box>
            {(filteredProducts?.length && priceProducts?.length && feedPrice?.length && feedQuantity?.length && quantityProducts?.length) && (
                <ProductGrid
                    filteredProducts={filteredProducts || []}
                    priceProducts={priceProducts || []}
                    feedPrice={feedPrice || []}
                    feedQuantity={feedQuantity || []}
                    quantityProducts={quantityProducts || []}
                />
            )}
        </Page>
    );
}