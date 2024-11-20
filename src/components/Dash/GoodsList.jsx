import {Box, FormControlLabel, Switch, Button, Typography, TextField, ImageListItem, ImageList} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Price } from "../UI/global/Price";
import ImageCarousel from "../UI/ImageCarousel";
import BrowserUpdatedOutlinedIcon from "@mui/icons-material/BrowserUpdatedOutlined";
import {countValue} from "../UI/global/templates";

export default function GoodsList({ goods, feed, categories, selectedCategory, exportXLSX }) {
    const [isFeed, setIsFeed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 28;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory]);

    const totalPages = Math.max(1, Math.ceil(goods.length / itemsPerPage));
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const displayedGoods = goods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const pageNumbers = [];
    const pageRange = 2;

    for (let i = Math.max(1, currentPage - pageRange); i <= Math.min(totalPages, currentPage + pageRange); i++) {
        pageNumbers.push(i);
    }

    function getDeclension(count) {
        const lastTwoDigits = count % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${count} точках`;
        }

        const lastDigit = count % 10;
        switch (lastDigit) {
            case 1:
                return `${count} точке`;
            case 2:
            case 3:
            case 4:
                return `${count} точках`;
            default:
                return `${count} точках`;
        }
    }

    const [isAddImgCategory, ] = useState(false); //setIsAddImgCategory

    return (
        <Box>
            <Box className={`flex flex-row gap-2 items-center mb-2`}>
                {!isAddImgCategory && <FormControlLabel
                    control={<Switch checked={isFeed} color="success" onChange={() => setIsFeed(!isFeed)}/>}
                    label={`Данные ${isFeed ? "из фида" : "с сайта"}`}
                />}
                <TextField label="Количество товаров" variant="outlined" disabled value={goods.length} />
                <Button
                    color="success"
                    variant="outlined"
                    onClick={exportXLSX}
                    startIcon={<BrowserUpdatedOutlinedIcon />}
                >
                    Скачать XLSX
                </Button>
                {/*<FormControlLabel*/}
                {/*    control={<Switch checked={!!isAddImgCategory} color="error" onChange={() => {*/}
                {/*        setIsAddImgCategory(!isAddImgCategory);*/}
                {/*        setIsFeed(false);*/}
                {/*    }} />}*/}
                {/*    label={`${isAddImgCategory ? "Отмена" : "Назначить категории изображение"}`}*/}
                {/*/>*/}
            </Box>

            {totalPages > 1 && (
                <Box className="flex flex-row flex-wrap gap-2 justify-center my-2">
                    <Button variant="outlined" disabled={currentPage === 1} onClick={() => handlePageChange(1)} color="secondary">Первая</Button>
                    <Button variant="outlined" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} color="secondary">Предыдущая</Button>
                    {pageNumbers.map((page) => (
                        <Button key={page} variant={currentPage === page ? "contained" : "outlined"} onClick={() => handlePageChange(page)} color="secondary">{page}</Button>
                    ))}
                    <Button variant="outlined" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} color="secondary">Следующая</Button>
                    <Button variant="outlined" disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)} color="secondary">Последняя</Button>
                </Box>
            )}

            <Box className="flex gap-3 flex-wrap overflow-y-auto h-[70vh]">
                {displayedGoods.map((g) => {
                    const feedGoods = feed?.find((f) => f.VENDOR === g.VENDOR);
                    const pictures = (isFeed && feedGoods)
                        ? feedGoods?.picture
                        : g.PICTURES
                            ? [g.PREVIEW_PICTURE, ...g.PICTURES]
                            : [g.PREVIEW_PICTURE]
                    ;
                    const price = isFeed && feedGoods ? feedGoods?.price : null;
                    const count = isFeed && feedGoods ? feedGoods?.count : null;
                    let countStatus = 0;
                    const groupCode = categories.find((c) => c.ID === g.CATEGORY_ID)?.CODE;

                    if (count > 0 && count <= 3) {
                        countStatus = 1;
                    } else if (count > 3) {
                        countStatus = 2;
                    }

                    const warehouse = feedGoods?.warehouse;
                    // console.log('\n pictures', pictures);

                    return (
                        !isAddImgCategory ? <Box className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5" key={g.ID}>
                                <a
                                    target={"_blank"}
                                    href={`https://runtec-shop.ru/catalog/${groupCode}/${g.CODE}/`}
                                    rel="noreferrer"
                                    title={g.NAME}
                                >
                                    <ImageCarousel
                                        pictures={pictures || []}
                                        altText={g.NAME}
                                        isFeed={isFeed}
                                    />
                                    <Box
                                        className={`text-xl ${!price ? 'text-red-600' : ''}`}>{price ? Price(price) + ' р.' : "Нет цены"}</Box>
                                    <Box
                                        className={`text-white text-sm leading-5 mt-3 max-h-[40px] overflow-hidden sale-item-name`}>{g.NAME}</Box>
                                    <Box className="flex flex-row gap-2 w-full justify-between mt-2">
                                        <Typography>{g.VENDOR}</Typography>
                                        <Typography>{g.BRAND}</Typography>
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
                                                ` на ${getDeclension(warehouse?.length)}`}
                                        </div>
                                    </div>
                                </a>
                            </Box> :
                            <ImageList variant="woven" cols={4} gap={8}>
                                {pictures.filter(p=>p).map((item) => (
                                    <ImageListItem key={item.img}>
                                        <img
                                            srcSet={`https://runtec-shop.ru/${item}?w=161&fit=crop&auto=format&dpr=2 2x`}
                                            src={`https://runtec-shop.ru/${item}?w=161&fit=crop&auto=format`}
                                            alt={""}
                                            loading="lazy"
                                        />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                    );
                })}
            </Box>
        </Box>
    );
}
