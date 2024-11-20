import {Box, Button} from "@mui/material";
import {useState} from "react";
import {brandList} from "../UI/global/templates";
import CancelIcon from '@mui/icons-material/Cancel';
import {updateGoodsInBatches} from "../../requests/api_v2";

export default function SortGoodsTools ({ goods, token, setGoods }) {

    const [selectedBrand, setSelectedBrand] = useState(JSON.parse(localStorage.getItem("brand")));
    const [printGoods, setPrintGoods] = useState([]);
    const [sortLimiter] = useState(100); //, setSortLimiter

    console.log('\n SortGoodsTools', {
        // goods,
        // feed,
        // sortedFeed,
        // selectedBrand,
        printGoods,
    });

    const otherGoodsCount = goods?.filter(g => !brandList?.some(b => g?.BRAND?.toLowerCase().includes(b.toLowerCase())));
    const setSelectedBrandHandler = (selected) => {

        localStorage.setItem("brand", JSON.stringify(selected));
        setSelectedBrand(selected);
    }
    const updateGoodsHandler = () => {
        if (selectedBrand && goods.length > 0) {

            const filteredGoods = goods?.filter(g => selectedBrand === "other" ?
                !brandList?.some(b => g?.BRAND?.toLowerCase().includes(b.toLowerCase())) :
                g?.BRAND?.toLowerCase().includes(selectedBrand)
                ).map((g, i) => {

                        return ({
                            ...g,
                            // ID: g.ID,
                            SORT: (sortLimiter + (i * 10)),
                            IS_HIT: (i === 0 || i === 1)
                        });
                    })
            ;
            setPrintGoods(filteredGoods);
        }
    }
    const saveGoodsHandler = async () => {
        if (!printGoods || printGoods.length === 0) {
            console.warn("Нет товаров для сохранения.");
            return;
        }

        console.log("Начинаем сохранение товаров на сервер...");

        await updateGoodsInBatches(token, printGoods);
    };

    return (
        <Box>
            <Box className={`flex flex-row gap-2`}>
                {brandList?.map(b => {

                    const goodsCount = goods?.filter(g => g?.BRAND?.toLowerCase().includes(b))?.length;
                    // console.log('\n goodsCount', goodsCount);

                    return (
                        <Button
                            key={b}
                            color={selectedBrand === b ? 'primary' : 'warning'}
                            variant={'contained'}
                            onClick={() => setSelectedBrandHandler(b)}
                        >
                            Товары бренда {b} ({goodsCount})
                        </Button>
                    )
                })}
                <Button
                    color={selectedBrand === 'other' ? 'primary' : 'warning'}
                    variant={'contained'}
                    onClick={() => setSelectedBrandHandler('other')}
                >
                    Остальные товары ({otherGoodsCount?.length})
                </Button>
                <Button
                    color={'success'}
                    variant={'contained'}
                    onClick={() => setSelectedBrandHandler(null)}
                    startIcon={<CancelIcon />}
                >
                    Сбросить
                </Button>
            </Box>
            <Box className={`columns-4 my-3`}>
                <Button
                    color={'info'}
                    variant={'contained'}
                    onClick={updateGoodsHandler}
                >
                    Сортировка товаров
                </Button>
                <Button
                    color={'error'}
                    variant={'contained'}
                    onClick={saveGoodsHandler}
                >
                    Записать данные
                </Button>
                <Button
                    color={'info'}
                    variant={'contained'}
                    onClick={setGoods}
                >
                    Обновить данные
                </Button>
            </Box>
        </Box>
    )
}