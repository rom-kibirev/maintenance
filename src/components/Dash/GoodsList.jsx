import { Box, FormControlLabel, Switch, Button, Typography, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Price } from "../UI/global/Price";
import ImageCarousel from "../UI/ImageCarousel";
import BrowserUpdatedOutlinedIcon from "@mui/icons-material/BrowserUpdatedOutlined";

export default function GoodsList({ goods, feed, categories, selectedCategory, exportXLSX }) {
    const [isFeed, setIsFeed] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;

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

    const countValue = {
        0: { label: "Нет в наличии", color: "text-red-400", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/3f2e66d4649609000518808333c63f2a3db0aec5c4893ed7c0ae25fc7b96f690?" },
        1: { label: "Мало", color: "text-amber-600", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/9463bbc4123ce7b3e5dfa64bf63b30f476cb9f2e77903cea30886a06e1cc6905?" },
        2: { label: "В наличии", color: "text-lime-600", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/9463bbc4123ce7b3e5dfa64bf63b30f476cb9f2e77903cea30886a06e1cc6905?" }
    };

    return (
        <Box>
            <Box className={`flex flex-row gap-2 items-center mb-2`}>
                <FormControlLabel
                    control={<Switch checked={isFeed} color="success" onChange={() => setIsFeed(!isFeed)} />}
                    label={`Данные ${isFeed ? "из фида" : "с сайта"}`}
                />
                <TextField label="Количество товаров" variant="outlined" disabled value={goods.length} />
                <Button
                    color="success"
                    variant="outlined"
                    onClick={exportXLSX}
                    startIcon={<BrowserUpdatedOutlinedIcon />}
                >
                    Скачать XLSX
                </Button>
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

            <Box className="flex gap-2 flex-wrap w-full overflow-y-auto h-[70vh]">
                {displayedGoods.map((g) => {
                    const feedGoods = feed?.find((f) => f.VENDOR === g.VENDOR);
                    const pictures = (isFeed && feedGoods) ? feedGoods?.picture : g.PICTURES;
                    const price = isFeed && feedGoods ? feedGoods?.price : null;
                    const count = isFeed && feedGoods ? feedGoods?.count : null;
                    let countStatus = 0;
                    const groupCode = categories.find((c) => c.ID === g.CATEGORY_ID)?.CODE;

                    if (count > 0 && count <= 3) {
                        countStatus = 1;
                    } else if (count > 3) {
                        countStatus = 2;
                    }

                    return (
                        <Box className="w-[230px] p-3" key={g.ID}>
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
                                <Box className={`text-xl ${!price ? 'text-red-600' : ''}`}>{price ? Price(price) + ' р.' : "Нет цены"}</Box>
                                <Box className={`text-white text-sm leading-5 mt-3 max-h-[40px] overflow-hidden sale-item-name`}>{g.NAME}</Box>
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
                                    <div className={`${countValue[countStatus].color} text-sm leading-4 self-stretch grow whitespace-nowrap`}>{countValue[countStatus].label}</div>
                                </div>
                            </a>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
