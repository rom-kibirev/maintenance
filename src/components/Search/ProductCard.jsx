import React from "react";
import {Box, Typography, Button, IconButton, Alert} from "@mui/material";
import ImageCarousel from "../UI/ImageCarousel";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import {countValue} from "../UI/global/templates";
import {getDeclension} from "../UI/global/sortTools";

export default function ProductCard({ product, isFeed, width, autoplay, shortMode, goods1C }) {

    const isCategory = product.category;

    const { NAME, PRICE, PICTURES, VENDOR, BRAND, WAREHOUSE, COUNT, LINK, XML_ID, CATEGORY } = product;

    const images = PICTURES?.filter(p => p)?.length ? PICTURES?.filter(p => p)?.slice(0, shortMode ? 2 : 5) : ['local/templates/runtec/components/bitrix/catalog.section/runtec_v1/images/no_photo.png'];

    const countStatus = (COUNT > 0 && COUNT <= 3) ? 1 : (COUNT > 3) ? 2 : 0;

    // if (CATEGORY) console.log(`\n CATEGORY`, CATEGORY);

    return (
        shortMode ?
            <Box sx={{width: width || 'auto'}} className="flex flex-row gap-4">
                <a
                    href={`https://runtec-shop.ru/catalog/${LINK}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <ImageCarousel pictures={images} altText={NAME} isFeed={isFeed} autoplay={autoplay} shortMode imgSize={isCategory ? 50 : false} />
                </a>
                <Box className={`flex-1 my-auto`}>
                    {!isCategory && <Box className={`flex gap-3 text-sm text-zinc-400`}>
                        <Typography>{VENDOR}</Typography>
                        <Typography>{BRAND}</Typography>
                        <Box className="justify-between items-center flex gap-1">
                            <img
                                loading="lazy"
                                src={countValue[countStatus].image}
                                className="aspect-square object-contain object-center w-3.5 overflow-hidden shrink-0 max-w-full my-auto"
                                alt=''
                            />
                            <Box
                                className={`${countValue[countStatus].color} leading-4 self-stretch grow whitespace-nowrap`}
                                sx={{fontSize: 12}}
                            >
                                {countValue[countStatus].label}
                                {countStatus === 2 && ` на ${getDeclension(WAREHOUSE)}`}
                            </Box>
                        </Box>
                    </Box>}
                    <Box
                        sx={{
                            fontSize: isCategory ? 22 : 16,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        <a
                            href={`https://runtec-shop.ru/catalog/${LINK}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            {NAME}
                        </a>
                    </Box>
                </Box>
                {!isCategory && <Box className={`flex flex-col gap-1`}>
                    <Box className={`text-xl text-right`}>
                        {PRICE?.toLocaleString() || "99 990.99"} ₽
                    </Box>
                    <IconButton
                        onClick={()=>{}}
                        color="secondary"
                        sx={{width:5, height:5, m: "auto"}}
                    ><ShoppingCartRoundedIcon /></IconButton>
                </Box>}
            </Box> :
            (!isCategory || goods1C) && 
            <Box sx={{width: width || 'auto'}} className="flex flex-col gap-2">

                {CATEGORY?.NAME && <Alert
                    severity={CATEGORY?.ACTIVE ? "success" : "error"}
                    sx={{
                        position: 'absolute',
                        zIndex: 1999,
                        width: 250,
                        opacity: 0.8,
                    }}
                >Категория "{CATEGORY?.NAME}"</Alert>}

                {goods1C?.find(g => g.guid === XML_ID) && <Alert
                    severity="success"
                    sx={{
                        fontSize: 10,
                    }}
                >Товар в 1C "{goods1C?.find(g => g.guid === XML_ID)?.name}"</Alert>}
            
                <a
                    href={`https://runtec-shop.ru/catalog/${LINK}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <ImageCarousel pictures={images} altText={NAME} isFeed={isFeed} autoplay={autoplay} />

                    <Box className={`text-3xl`}>
                        {PRICE?.toLocaleString() || "0.00"} ₽
                    </Box>

                    <Box
                        title={NAME}
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {NAME}
                    </Box>
                </a>

                <Box>
                    <Box className="flex justify-between">
                        <Typography>{VENDOR}</Typography>
                        <Typography>{BRAND}</Typography>
                    </Box>

                    <Box className="justify-between items-center flex gap-1">
                        <img
                            loading="lazy"
                            src={countValue[countStatus].image}
                            className="aspect-square object-contain object-center w-3.5 overflow-hidden shrink-0 max-w-full my-auto"
                            alt=''
                        />
                        <Box
                            className={`${countValue[countStatus].color} text-sm leading-4 self-stretch grow whitespace-nowrap`}
                        >
                            {countValue[countStatus].label}
                            {countStatus === 2 && ` на ${getDeclension(WAREHOUSE)}`}
                        </Box>
                    </Box>
                </Box>


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