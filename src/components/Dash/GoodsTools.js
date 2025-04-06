import Page from "../UI/Theme/Page";
import { Alert, Box, Button, CircularProgress, FormControlLabel, IconButton, Switch, TextField, Dialog, DialogTitle, DialogContent, Typography, List, ListItem, ListItemText } from "@mui/material";
import React, {useEffect, useState} from "react";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {fetchGoodsData, getCategoryDescendants, mergeFeed, sortProductsByBrand} from "../UI/global/sortTools";
import {fetchUserData, uploadGoods, fetchGoodsPrices, fetchGoodsQuantity} from "../../requests/api_v2";
import {checkAccess} from "../UI/global/userStatus";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import BasicModal from "../UI/ModalTemplate";
import CategorySearch from "./CategorySearch";
import useLocalStorage from "../UI/global/useLocalStorage";
import ListAltIcon from '@mui/icons-material/ListAlt';
import GoodToolsPrintCatalog from "./GoodToolsPrintCatalog";
import HideSourceIcon from '@mui/icons-material/HideSource';
import {brandList} from "../UI/global/templates";

export default function GoodsTools({token}) {

    const [answer, setAnswer] = useState(null);
    const [inProgress, setInProgress] = useState(false);
    const [categories, setCategories] = useState(null);
    const [goods, setGoods] = useState(null);
    const [feed, setFeed] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useLocalStorage('category', null);
    const [isFeed, setIsFeed] = useLocalStorage("isFeed",true);
    const [isSorted, setIsSorted] = useLocalStorage("isSorted",true);
    const [currentMethod, setCurrentMethod] = useLocalStorage('method_goods', 0);
    const [isEdit, setIsEdit] = useState(null);
    const [filteredGoods, setFilteredGoods] = useState(null);
    const [brands, setBrands] = useState(null);
    const [characters, setCharacters] = useState(null);
    const [charactersSelected, setCharactersSelected] = useLocalStorage('character', null);
    const [searchQuery, setSearchQuery] = useState('');
    const [foundGood, setFoundGood] = useState(null);
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    // const [goodsPrices, setGoodsPrices] = useState(null);
    // const [goodsQuantity, setGoodsQuantity] = useState(null);
    const [isLoadingPrices, setIsLoadingPrices] = useState(false);
    const [isLoadingQuantity, setIsLoadingQuantity] = useState(false);
    const [loadPricesAndQuantity, setLoadPricesAndQuantity] = useLocalStorage("loadPricesAndQuantity", false);

    // Основной эффект для загрузки всех данных
    useEffect(() => {
        let isMounted = true;

        const getData = async () => {
            setInProgress(true);
            setAnswer(null);

            try {
                // Загружаем базовые данные
                const [goodsData, userData] = await Promise.all([
                    fetchGoodsData(token),
                    fetchUserData(token)
                ]);

                if (!isMounted) return;

                const { categories, goods, feed } = goodsData;

                if (goods?.length && feed?.length) {
                    // Фильтруем товары без категории
                    const validGoods = goods.filter(good => good.CATEGORY_ID && good.CATEGORY_ID !== 0);

                    // Добавляем информацию о категории
                    const goodsWithCategory = validGoods.map(good => {
                        const CATEGORY = categories?.find(category => category.ID === good.CATEGORY_ID);
                        return { ...good, CATEGORY };
                    });

                    // Если включена загрузка цен и остатков
                    if (loadPricesAndQuantity && !isFeed) {
                        setIsLoadingPrices(true);
                        setIsLoadingQuantity(true);

                        try {
                            const [pricesResponse, quantityResponse] = await Promise.all([
                                fetchGoodsPrices(token),
                                fetchGoodsQuantity(token)
                            ]);

                            if (!isMounted) return;

                            if (pricesResponse.success && quantityResponse.success) {
                                const pricesMap = new Map(pricesResponse.data.map(p => [p.ID, p]));
                                const quantityMap = new Map(quantityResponse.data.map(q => [q.ID, q]));

                                // Обновляем товары с ценами и остатками
                                const updatedGoods = goodsWithCategory.map(good => {
                                    const priceData = pricesMap.get(good.ID);
                                    const quantityData = quantityMap.get(good.ID);

                                    return {
                                        ...good,
                                        PRICE: priceData?.PRICE || 0,
                                        CURRENCY: priceData?.CURRENCY || good.CURRENCY,
                                        COUNT: quantityData?.QUANTITY || 0,
                                        WAREHOUSE: 1
                                    };
                                });

                                const feedGoods = isFeed ? mergeFeed(updatedGoods, feed) : updatedGoods;
                                const sortedGoods = (feedGoods?.length && isSorted) ? sortProductsByBrand(feedGoods) : feedGoods;

                                setGoods(sortedGoods);
                            }
                        } catch (error) {
                            console.error('Ошибка при загрузке цен и остатков:', error);
                            if (isMounted) {
                                setAnswer({
                                    severity: "warning",
                                    message: `Ошибка при загрузке цен и остатков: ${error.message}`
                                });
                            }
                        } finally {
                            if (isMounted) {
                                setIsLoadingPrices(false);
                                setIsLoadingQuantity(false);
                            }
                        }
                    } else {
                        // Если загрузка цен и остатков отключена или режим фида
                        const feedGoods = mergeFeed(goodsWithCategory, feed);
                        const sortedGoods = isSorted ? sortProductsByBrand(feedGoods) : feedGoods;
                        setGoods(sortedGoods);
                    }

                    setFeed(feed);
                    setCategories(categories);
                }

                if (userData.success) setCurrentUser(userData.data);

            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                if (isMounted) {
                    setAnswer({
                        severity: "error",
                        message: `Ошибка при загрузке данных: ${error.message}`
                    });
                }
            } finally {
                if (isMounted) {
                    setInProgress(false);
                }
            }
        };

        getData();

        return () => {
            isMounted = false;
        };
    }, [token, isFeed, isSorted, loadPricesAndQuantity]);

    // Эффект для фильтрации по категории
    const [filteredCategoryGoods, setFilteredCategoryGoods] = useState(null);

    useEffect(() => {
        if (!goods) return;

        const filterGoods = () => {
            if (!selectedCategory) return goods;

            const categoriesId = currentMethod === 1
                ? [selectedCategory]
                : [selectedCategory, ...getCategoryDescendants(selectedCategory, categories)];

            return goods.filter(good => categoriesId?.includes(good.CATEGORY_ID));
        };

        setFilteredCategoryGoods(filterGoods());
    }, [selectedCategory, currentMethod, goods, categories]);

    const currentGoods = (filteredGoods && currentMethod === 2)
        ? filteredGoods
        : filteredCategoryGoods || 0
    ;
    const currentCategory = categories?.find(c => c.ID === selectedCategory);

    // Удаляем второй useEffect для загрузки цен и остатков

    // Удаляем лишний useEffect для отслеживания состояний
    // Используем useMemo для тяжелых вычислений
    const filteredBrands = React.useMemo(() => {
        if (!goods?.length || currentMethod !== 2) return [];
        return [...new Set(goods.filter(b => (!!b.BRAND && b.ACTIVE)))];
    }, [goods, currentMethod]);

    useEffect(() => {
        setFilteredGoods(filteredBrands);
    }, [filteredBrands]);

    useEffect(() => {
        if (filteredGoods?.length) {
            const allBrands = [...new Set(filteredGoods.map(g => g.BRAND))]
                .sort()
                .map((b,id) => ({
                    id,
                    name: b,
                    character: b[0].toUpperCase(),
                }))
            ;

            const allCharacters = [...new Set(allBrands.map(b => b.character))].sort();

            setBrands(allBrands);
            setCharacters(allCharacters);
        }
    }, [filteredGoods]);

    const handleUpload = async (data) => {

        console.log(`\n handleUpload`, data);

        setInProgress(true);

        if (checkAccess(currentUser)) {
            const result = await uploadGoods(token, data);
            if (result?.severity === "success") {

                // console.log(`\n result`, result);

                setInProgress(false);
                setAnswer(result);
                setIsEdit(null);
            }
        }
    };
    const handleSearchManagement = () => {

        const updateGoods = [...goods].map(good => {
            const { NAME, VENDOR } = good;
            return {
                ...good,
                SEARCHABLE_CONTENT: `${NAME} ${VENDOR}`.toUpperCase()
            }
        });

        console.log(`\n updateGoods`, updateGoods);
    };

    console.log(`%c@Алексей: Параметры категорий и товаров`, 'color: rgb(100,255,0); font-size: 24px;', {"Категории": categories, "Товары": goods, "Отфильтрованные товары": currentGoods});
    // console.log(`\n selectedCategory`, categories?.find( c => c.ID === selectedCategory));

    const methods = [
        {
            id: 0,
            title: "Сортировка товаров",
            icon: <SwapVertIcon />,
            color: "success",
        },
        {
            id: 1,
            title: "Перенос товаров по разделам",
            icon: <AccountTreeIcon />,
            color: "warning",
        },
        {
            id: 2,
            title: "Работа с брендами",
            icon: <ListAltIcon />,
            color: "info",
        },
    ];
    const current = methods[currentMethod];
    const transferGoodsHandler = () => {
        const transferGoods = (category) => {
            const updatedGoods = currentGoods?.map(good => {
                return {
                    ...good,
                    IS_MODIFIED_ON_SITE: true,
                }
            });

            setIsEdit({
                title: "Подтвердите действие",
                content: (
                    <Box>
                        <Alert severity="warning">
                            Вы собираетесь перенести товары ({updatedGoods.length} шт) в категорию "{category.NAME}". Подтвердите действие?
                        </Alert>
                        <Box display="flex" justifyContent="space-between" mt={2}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleUpload(updatedGoods)}
                            >
                                Подтвердить
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => setIsEdit(null)}
                            >
                                Отменить
                            </Button>
                        </Box>
                    </Box>
                ),
            });
        };

        setIsEdit({
            title: `Перенести товары (${currentGoods?.length}) из категории ${currentCategory?.NAME} в другую`,
            content: (
                <Box>
                    <input type="hidden" id="transfer-category-input" />
                    <CategorySearch
                        categories={categories}
                        setSelectedCategory={transferGoods}
                    />
                </Box>
            ),
        });
    }

    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        // Проверяем, является ли поисковый запрос числом (для ID)
        const isNumeric = /^\d+$/.test(searchQuery);

        const found = goods?.filter(good => {
            // Точный поиск по ID
            if (isNumeric && good.ID.toString() === searchQuery) {
                return true;
            }
            // Точный поиск по XML_ID
            if (good.XML_ID === searchQuery) {
                return true;
            }
            // Частичный поиск по NAME
            return good.NAME.toLowerCase().includes(searchQuery.toLowerCase());
        });

        if (found?.length > 0) {
            setSearchResults(found);
            setShowSearchResults(true);
        } else {
            setAnswer({
                severity: "warning",
                message: "Товары не найдены"
            });
        }
    };

    const handleSelectGood = (good) => {
        setFoundGood(good);
        setShowSearchResults(false);
        setSearchDialogOpen(true);
    };

    const handleCloseSearchDialog = () => {
        setSearchDialogOpen(false);
        setFoundGood(null);
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    return (
        <Page
            label="Управление товарами"
            subtitle={current?.title}
        >
            {isEdit && <BasicModal open={!!isEdit} handleClose={() => setIsEdit(null)} title={isEdit?.title}>{isEdit?.content}</BasicModal>}
            <Box className={`flex gap-2 p-3 border bg-zinc-900/50 border-amber-500/20 rounded`}>
                {(inProgress || isLoadingPrices || isLoadingQuantity) && (
                    <Box className="flex items-center gap-2">
                        <CircularProgress color="info" size={20} sx={{marginY: "auto"}} />
                        {isLoadingPrices && <Typography variant="caption">Загрузка цен...</Typography>}
                        {isLoadingQuantity && <Typography variant="caption">Загрузка остатков...</Typography>}
                    </Box>
                )}
                {!!answer && (<Alert severity={answer?.severity || "info"}>{answer?.message || ""}</Alert>)}
                {methods?.map(m => (<IconButton key={m.id} color={currentMethod === m.id ? "primory" : m.color} onClick={() => setCurrentMethod(m.id)} title={m.title}>{m.icon}</IconButton>))}
                <TextField
                    label='Поиск товара (ID/NAME/XML_ID)'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    size="small"
                    sx={{width: 300}}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    size="small"
                >
                    Найти
                </Button>
                <TextField
                    label='Количество товаров'
                    disabled
                    value={currentGoods?.length || 0}
                    size="small"
                    sx={{width: 120}}
                />
                {!!selectedCategory && <TextField label='Выбранная категория' disabled value={currentCategory?.NAME || ""} size="small" />}
                {current?.id === 0 && <>
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
                    <FormControlLabel
                        control={
                            <Switch
                                checked={loadPricesAndQuantity}
                                color="primary"
                                onChange={() => setLoadPricesAndQuantity(!loadPricesAndQuantity)}
                            />
                        }
                        label={`Загрузка цен и остатков ${loadPricesAndQuantity ? "включена" : "отключена"}`}
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
                        onClick={() => handleUpload(goods)}
                        size="small"
                    ><CloudUploadOutlinedIcon/></Button>}
                    {checkAccess(currentUser) && <Button
                        variant="contained"
                        color="warning"
                        onClick={handleSearchManagement}
                        size="small"
                    ><ManageSearchIcon/></Button>}
                </>}
                {(current?.id === 1 && selectedCategory) && <Button color="warning" variant="contained" onClick={() => transferGoodsHandler()} >Перенести товары в категорию</Button>}
            </Box>
            {(currentMethod === 0 || currentMethod === 1) &&
                <GoodToolsPrintCatalog
                    categories={categories}
                    goods={filteredCategoryGoods}
                    currentMethod={currentMethod}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    feed={feed}
                />
            }
            {(filteredGoods?.length && currentMethod === 2) && <Box className="flex flex-col gap-2 pt-3">
                <Box size="small" className="flex flex-wrap items-center gap-2">
                    {characters?.map((c, id) => (<Button
                        variant={charactersSelected === c ? "contained" : "outlined"}
                        color={charactersSelected === c ? "success" : "warning"}
                        onClick={() => setCharactersSelected(c)}
                        key={id}
                    >{c}</Button>))}
                </Box>
                <Box size="small" className="flex flex-wrap gap-2 h-[55vh] overflow-auto">
                    {brands?.filter(b => b.character === charactersSelected).map(b => (<Box
                        key={b.id}
                        className={`p-2 rounded-md h-fit flex-col flex gap-3 ${brandList.map(brand => brand.toLowerCase()).includes(b.name.toLowerCase()) ? "bg-red-500/20" : "border border-amber-500/30 "}`}
                    >
                        {brandList.map(brand => brand.toLowerCase()).includes(b.name.toLowerCase()) && <Alert severity="warning">Бренд участвет в сортировке товаров</Alert>}
                        <Typography variant="h4">{b.name}</Typography>
                        <TextField label='Количество товаров' disabled value={filteredGoods.filter(g=> g.BRAND === b.name)?.length || 0} size="small" />
                        {!brandList.map(brand => brand.toLowerCase()).includes(b.name.toLowerCase()) && (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<HideSourceIcon/>}
                                onClick={() => {
                                    const sendGoods = filteredGoods.filter(g => g.BRAND === b.name);

                                    // Обновляем локальное состояние filteredGoods
                                    setFilteredGoods(prevGoods =>
                                        prevGoods.map(good =>
                                            good.BRAND === b.name
                                                ? {...good, ACTIVE: false}
                                                : good
                                        )
                                    );

                                    // Отправляем данные на сервер
                                    handleUpload(sendGoods.map(g => ({...g, ACTIVE: false})));
                                }}
                            >
                                Скрыть товары
                            </Button>
                        )}
                    </Box>))}
                </Box>
            </Box>}

            <Dialog
                open={showSearchResults}
                onClose={() => setShowSearchResults(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Результаты поиска
                    <Button
                        onClick={() => setShowSearchResults(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        ✕
                    </Button>
                </DialogTitle>
                <DialogContent>
                    <List>
                        {searchResults.map((good, index) => (
                            <ListItem
                                key={index}
                                button
                                onClick={() => handleSelectGood(good)}
                            >
                                <ListItemText
                                    primary={good.NAME}
                                    secondary={`ID: ${good.ID} | Артикул: ${good.VENDOR} | Бренд: ${good.BRAND}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            <Dialog
                open={searchDialogOpen}
                onClose={handleCloseSearchDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Информация о товаре
                    <Button
                        onClick={handleCloseSearchDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        ✕
                    </Button>
                </DialogTitle>
                <DialogContent>
                    {foundGood && (
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="ID"
                                    secondary={foundGood.ID}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Название"
                                    secondary={foundGood.NAME}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="XML_ID"
                                    secondary={foundGood.XML_ID}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Артикул"
                                    secondary={foundGood.VENDOR}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Бренд"
                                    secondary={foundGood.BRAND}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Категория"
                                    secondary={foundGood.CATEGORY?.NAME}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Цена"
                                    secondary={foundGood.PRICE}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Количество"
                                    secondary={foundGood.COUNT}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Активность"
                                    secondary={foundGood.ACTIVE ? "Да" : "Нет"}
                                />
                            </ListItem>
                        </List>
                    )}
                </DialogContent>
            </Dialog>
        </Page>
    )
}