import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ImageCarousel from "../UI/ImageCarousel";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import {countValue} from "../UI/global/templates";
import {getDeclension} from "../UI/global/sortTools";

export default function ProductCard({ product, isFeed }) {
    const { NAME, CODE, PRICE, PICTURES, VENDOR, BRAND, WAREHOUSE, COUNT } = product;

    const images = PICTURES?.slice(0, 5) || ["/path/to/default-image.jpg"];

    const countStatus = (COUNT > 0 && COUNT <= 3) ? 1 : (COUNT > 3) ? 2 : 0;

    return (
        <Box className="flex flex-col gap-2">
            {/* Ссылка с каруселью */}
            <a
                href={`https://runtec-shop.ru/catalog/${CODE}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                <ImageCarousel pictures={images} altText={NAME} isFeed={isFeed}/>

                <Box className={`text-2xl`}>
                    {PRICE.toLocaleString()} ₽
                </Box>

                <Typography
                    variant="body2"
                    className="truncate"
                    title={NAME}
                >
                    {NAME}
                </Typography>

                <Box className="flex justify-between">
                    <Typography>{VENDOR}</Typography>
                    <Typography>{BRAND}</Typography>
                </Box>

                <div className="justify-between items-center flex gap-1">
                    <img
                        loading="lazy"
                        src={countValue[countStatus].image}
                        className="aspect-square object-contain object-center w-3.5 overflow-hidden shrink-0 max-w-full my-auto"
                        alt=''
                    />
                    <div
                        className={`${countValue[countStatus].color} text-sm leading-4 self-stretch grow whitespace-nowrap`}
                    >
                        {countValue[countStatus].label}
                        {countStatus === 2 &&
                            ` на ${getDeclension(WAREHOUSE)}`}
                    </div>
                </div>
            </a>

            {/* Информация */}
            <Box className="flex flex-col gap-1">
                <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<ShoppingCartRoundedIcon />}
                >
                    В корзину
                </Button>
            </Box>
        </Box>
    );
}