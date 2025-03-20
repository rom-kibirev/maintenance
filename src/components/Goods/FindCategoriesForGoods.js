import Page from "../UI/Theme/Page";
import {useEffect, useState} from "react";
import {fetchAllGoods} from "../UI/global/sortTools";
import { uploadGoods, fetchUserData } from "../../requests/api_v2";
import { 
    CircularProgress, 
    Box, 
    Typography, 
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Button,
    Alert
} from '@mui/material';
import {checkAccess} from "../UI/global/userStatus";

const GoodsWithoutCategory = ({ token }) => {
    
    const [goods, setGoods] = useState([]); // товары без категорий
    const [categories, setCategories] = useState([]); // категории с сайта
    const [matchedGoods, setMatchedGoods] = useState([]); // сопоставленные товары из 1С
    const [matchedGoodsWithCategories, setMatchedGoodsWithCategories] = useState([]); // товары с категориями
    const [goodsToUpdate, setGoodsToUpdate] = useState([]); // товары для обновления
    const [loading, setLoading] = useState(true);
    const [inProgress, setInProgress] = useState(false);
    const [answer, setAnswer] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [loadingProgress, setLoadingProgress] = useState({
        stage: 'categories',
        currentPart: 0,
        totalItems: 0,
        siteGoods: 0,
        status: 'Загрузка категорий...'
    });

    // Получаем данные о пользователе
    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await fetchUserData(token);
                if (response.success) setCurrentUser(response.data);
            } catch (error) {
                console.error('Ошибка при получении данных пользователя:', error);
            }
        };

        if (token) {
            getUserData();
        }
    }, [token]);

    // Обработчики пагинации
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        const getData = async () => {
            try {
                setLoading(true);
                
                // Получаем товары с помощью новой функции
                const { siteGoods, goods1C: goods1CArray, categories: categoriesData } = await fetchAllGoods((progress) => {
                    setLoadingProgress(prev => ({
                        ...prev,
                        ...progress
                    }));
                }, token);

                // Фильтруем товары без категорий
                const goodsWithoutCategory = siteGoods.filter(good => !good.CATEGORY_ID);
                setGoods(goodsWithoutCategory);
                setCategories(categoriesData);

                // Создаем Map для быстрого поиска категорий по XML_ID
                const categoriesMap = new Map(categoriesData.map(category => [category.XML_ID, category]));

                // Сопоставление товаров
                setLoadingProgress(prev => ({
                    ...prev,
                    status: 'Сопоставление товаров...'
                }));

                // Создаем Map для быстрого поиска по guid
                const goods1CMap = new Map(goods1CArray.map(good => [good.guid, good]));
                
                // Находим соответствия и добавляем информацию о категориях
                const matched = goodsWithoutCategory.map(siteGood => {
                    const good1C = goods1CMap.get(siteGood.XML_ID);
                    if (!good1C) return null;

                    const categoryFromSite = good1C.category ? categoriesMap.get(good1C.category) : null;
                    return {
                        ...good1C,
                        siteGood, // добавляем информацию о товаре с сайта
                        category_by_site: categoryFromSite || null
                    };
                }).filter(item => item !== null);

                setMatchedGoods(matched);

                // Фильтруем только товары с категориями и добавляем информацию о родительской категории
                const matchedWithCategories = matched
                    .filter(item => item.category_by_site !== null)
                    .map(item => {
                        const parentCategory = item.category_by_site.IBLOCK_SECTION_ID 
                            ? categoriesData.find(cat => cat.ID === item.category_by_site.IBLOCK_SECTION_ID)
                            : null;
                        
                        return {
                            ...item,
                            parentCategoryName: parentCategory ? parentCategory.NAME : null
                        };
                    });

                setMatchedGoodsWithCategories(matchedWithCategories);

                // Формируем массив товаров для обновления
                const goodsForUpdate = goodsWithoutCategory
                    .map(siteGood => {
                        const good1C = goods1CMap.get(siteGood.XML_ID);
                        if (!good1C || !good1C.category) return null;

                        const categoryFromSite = categoriesMap.get(good1C.category);
                        if (!categoryFromSite) return null;

                        return {
                            ...siteGood,
                            CATEGORY_ID: categoryFromSite.ID
                        };
                    })
                    .filter(item => item !== null);

                setGoodsToUpdate(goodsForUpdate);
                setLoading(false);

            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setLoading(false);
                setLoadingProgress(prev => ({
                    ...prev,
                    status: 'Ошибка при загрузке данных'
                }));
            }
        };

        getData();
    }, [token]);

    // Логируем результаты
    useEffect(() => {
        if (!loading && goods.length && matchedGoods.length) {
            console.log('Категории:', categories);
            console.log('Товары без категорий:', goods);
            console.log('Сопоставленные товары из 1С:', matchedGoods);
            console.log('Товары с категориями из 1С:', matchedGoodsWithCategories);
            console.log('Товары для обновления:', goodsToUpdate);
            console.log('Статистика:');
            console.log('Всего категорий:', categories.length);
            console.log('Всего товаров без категорий:', goods.length);
            console.log('Найдено соответствий:', matchedGoods.length);
            console.log('Не найдено соответствий:', goods.length - matchedGoods.length);
            console.log('Товары 1С с категорией на сайте:', matchedGoods.filter(g => g.category_by_site !== null).length);
            console.log('Товары 1С без категории на сайте:', matchedGoods.filter(g => g.category_by_site === null).length);
            console.log('Подготовлено товаров для обновления:', goodsToUpdate.length);
        }
    }, [loading, goods, matchedGoods, categories, matchedGoodsWithCategories, goodsToUpdate]);

    const getProgressValue = () => {
        switch (loadingProgress.stage) {
            case 'categories':
                return 10;
            case 'site':
                return 10 + (loadingProgress.currentPart * 1.5); // 40% на загрузку с сайта
            case '1c':
                return 50 + (loadingProgress.currentPart * 1.5); // 50% на загрузку из 1С
            default:
                return 0;
        }
    };

    const handleShowUpdateArray = () => {
        console.log('Массив товаров для обновления:', goodsToUpdate);
    };

    const handleUpload = async () => {
        if (!currentUser) {
            setAnswer({
                severity: "error",
                message: "Не удалось получить данные пользователя"
            });
            return;
        }

        console.log('Отправка данных на сервер:', goodsToUpdate);
        setInProgress(true);

        if (checkAccess(currentUser)) {
            try {
                const result = await uploadGoods(token, goodsToUpdate);
                if (result?.severity === "success") {
                    setAnswer(result);
                } else {
                    setAnswer({
                        severity: "error",
                        message: result?.message || "Ошибка при загрузке данных"
                    });
                }
            } catch (error) {
                setAnswer({
                    severity: "error",
                    message: "Ошибка при загрузке данных"
                });
            }
        } else {
            setAnswer({
                severity: "error",
                message: "Нет доступа к загрузке данных"
            });
        }
        setInProgress(false);
    };

    return (
        <Page label="Исправление товаров без категории">
            {loading && (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    p: 3
                }}>
                    <CircularProgress size={60} color="warning" />
                    <Box sx={{ width: '100%', maxWidth: 400 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={getProgressValue()}
                            color="warning"
                        />
                    </Box>
                    <Typography variant="h6" component="div">
                        {loadingProgress.status}
                    </Typography>
                    {loadingProgress.stage !== 'categories' && (
                        <Typography variant="body1" color="text.secondary">
                            Товаров с сайта: {loadingProgress.siteGoods}
                        </Typography>
                    )}
                    {loadingProgress.stage === '1c' && (
                        <Typography variant="body1" color="text.secondary">
                            Товаров из 1С: {loadingProgress.totalItems}
                        </Typography>
                    )}
                </Box>
            )}
            {!loading && (
                <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Результаты сопоставления:
                    </Typography>
                    <Typography>
                        Всего категорий: {categories.length}
                    </Typography>
                    <Typography>
                        Всего товаров без категорий: {goods.length}
                    </Typography>
                    <Typography>
                        Найдено соответствий: {matchedGoods.length}
                    </Typography>
                    <Typography>
                        Не найдено соответствий: {goods.length - matchedGoods.length}
                    </Typography>
                    <Typography>
                        Товары 1С с категорией на сайте: {matchedGoods.filter(g => g.category_by_site !== null).length}
                    </Typography>
                    <Typography>
                        Товары 1С без категории на сайте: {matchedGoods.filter(g => g.category_by_site === null).length}
                    </Typography>
                    <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
                        Подготовлено товаров для обновления: {goodsToUpdate.length}
                    </Typography>

                    <Box sx={{ mt: 2, mb: 4, display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            color="warning"
                            onClick={handleShowUpdateArray}
                        >
                            Показать массив для обновления
                        </Button>

                        <Button 
                            variant="contained" 
                            color="warning"
                            onClick={handleUpload}
                            disabled={inProgress || goodsToUpdate.length === 0}
                        >
                            {inProgress ? 'Загрузка...' : 'Загрузить на сервер'}
                        </Button>
                    </Box>

                    {answer && (
                        <Alert 
                            severity={answer.severity} 
                            sx={{ mb: 2 }}
                            onClose={() => setAnswer(null)}
                        >
                            {answer.message}
                        </Alert>
                    )}

                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>XML_ID товара</TableCell>
                                    <TableCell>Название товара</TableCell>
                                    <TableCell>ID категории</TableCell>
                                    <TableCell>XML_ID категории</TableCell>
                                    <TableCell>Название категории</TableCell>
                                    <TableCell>Родительская категория</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {matchedGoodsWithCategories
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.siteGood.XML_ID}</TableCell>
                                        <TableCell>{item.siteGood.NAME}</TableCell>
                                        <TableCell>{item.category_by_site.ID}</TableCell>
                                        <TableCell>{item.category_by_site.XML_ID}</TableCell>
                                        <TableCell>{item.category_by_site.NAME}</TableCell>
                                        <TableCell>{item.parentCategoryName || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={matchedGoodsWithCategories.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Строк на странице:"
                            labelDisplayedRows={({ from, to, count }) => 
                                `${from}-${to} из ${count}`
                            }
                        />
                    </TableContainer>
                </Box>
            )}
        </Page>
    );
};

export default GoodsWithoutCategory;