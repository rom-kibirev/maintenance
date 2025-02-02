import Page from "../UI/Theme/Page";
import { Alert, Box, Button, CircularProgress, FormControlLabel, IconButton, Switch, TextField } from "@mui/material";
import React, {useEffect, useState} from "react";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {fetchGoodsData, getCategoryDescendants, mergeFeed, sortProductsByBrand} from "../UI/global/sortTools";
import {fetchUserData, uploadGoods} from "../../requests/api_v2";
import {checkAccess} from "../UI/global/userStatus";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import BasicModal from "../UI/ModalTemplate";
import FindCategories from "../UI/FindCategory";
import useLocalStorage from "../UI/global/useLocalStorage";
import ListAltIcon from '@mui/icons-material/ListAlt';
import GoodToolsPrintCatalog from "./GoodToolsPrintCatalog";
import HideSourceIcon from '@mui/icons-material/HideSource';
import Typography from "@mui/material/Typography";
import {brandList} from "../UI/global/templates";

export default function GoodsTools({token}) {

    const [answer, setAnswer] = useState(null);
    const [categories, setCategories] = useState(null);
    const [goods, setGoods] = useState(null);
    const [feed, setFeed] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useLocalStorage('category', null);
    const [isFeed, setIsFeed] = useState(false);
    const [isSorted, setIsSorted] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [currentMethod, setCurrentMethod] = useLocalStorage('method', null);
    const [isEdit, setIsEdit] = useState(null);
    const [filteredGoods, setFilteredGoods] = useState(null);
    const [brands, setBrands] = useState(null);
    const [characters, setCharacters] = useState(null);
    const [charactersSelected, setCharactersSelected] = useLocalStorage('character', null);

    useEffect(() => {

        const getData = async () => {

            setInProgress(true);
            setAnswer(null);

            try {

                const { categories, goods, feed } = await fetchGoodsData(token);
                setCategories(categories);
                if (goods?.length && feed?.length) {

                    const filterGoods = () => {

                        const categoriesId = currentMethod === 1 ? [selectedCategory] : [selectedCategory, ...getCategoryDescendants(selectedCategory, categories)];

                        return goods?.filter(good => categoriesId?.includes(good?.CATEGORY_ID));
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
    }, [token, isFeed, isSorted, selectedCategory, currentMethod]);
    useEffect(() => {
        if (goods?.length && currentMethod === 2) {
            const updateGoods = [...new Set(goods.filter(b => (!!b.BRAND && b.ACTIVE)))];
            setFilteredGoods(updateGoods);
        }
    }, [currentMethod, goods]);
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

    console.log(`%c@Алексей: Параметры категорий и товаров`, 'color: rgb(100,255,0); font-size: 24px;', {"Категории": categories, "Товары": goods});
    // console.log(`\n selectedCategory`, selectedCategory);

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

            const updatedGoods = goods?.map(good => {
                return {
                    ...good,
                    CATEGORY_ID: category.ID,
                    CATEGORY_XML_ID: category.XML_ID,
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

            // setIsEdit({
            //     title: "Подтвердите действие",
            //     content: (
            //         <Box>
            //             <Alert severity="warning">
            //                 Вы собираетесь изменить родительскую категорию на "{category.NAME}". Подтвердите действие.
            //             </Alert>
            //             <Box display="flex" justifyContent="space-between" mt={2}>
            //                 <Button
            //                     variant="contained"
            //                     color="success"
            //                     onClick={() => patchData(category.ID)}
            //                 >
            //                     Подтвердить
            //                 </Button>
            //                 <Button
            //                     variant="contained"
            //                     color="error"
            //                     onClick={() => setIsEdit(null)}
            //                 >
            //                     Отменить
            //                 </Button>
            //             </Box>
            //         </Box>
            //     ),
            // });
        };

        setIsEdit({
            title: "Перенести товары в другую категорию",
            content: (<FindCategories
                data={categories}
                handleCategoryClick={transferGoods}
            />),
        });
    }

    return (
        <Page
            label="Управление товарами"
            subtitle={current?.title}
        >
            {isEdit && <BasicModal open={!!isEdit} handleClose={() => setIsEdit(null)} title={isEdit?.title}>{isEdit?.content}</BasicModal>}
            <Box className={`flex gap-2 p-3 border bg-zinc-900/50 border-amber-500/20 rounded`}>
                {inProgress && <CircularProgress color="info" size={20} sx={{marginY: "auto"}} />}
                {!!answer && (<Alert severity={answer?.severity || "info"}>{answer?.message || ""}</Alert>)}
                {methods?.map(m => (<IconButton key={m.id} color={m.color} onClick={() => setCurrentMethod(m.id)} title={m.title}>{m.icon}</IconButton>))}
                <TextField label='Количество товаров' disabled value={(filteredGoods?.length && currentMethod === 2) ? filteredGoods.length : goods?.length || 0} size="small" sx={{width: 120}} />
                {!!selectedCategory && <TextField label='Выбранная категория' disabled value={categories?.find(c => c.ID === selectedCategory)?.NAME || ""} size="small" />}
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
            {(currentMethod === 0 || currentMethod === 1) && <GoodToolsPrintCatalog categories={categories} goods={goods} currentMethod={currentMethod} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} feed={feed} />}
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
        </Page>
    )
}