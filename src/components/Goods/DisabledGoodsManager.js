import Page from "../UI/Theme/Page";
import { useEffect, useState } from "react";
import { fetchAllGoods } from "../UI/global/sortTools";
import { uploadGoods } from "../../requests/api_v2";
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Alert,
    CircularProgress,
    LinearProgress,
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function DisabledGoodsManager({ token }) {
    const [goods, setGoods] = useState([]);
    const [disabledGoods, setDisabledGoods] = useState([]);
    const [disabledGoodsWithoutCategory, setDisabledGoodsWithoutCategory] = useState([]);
    const [inProgress, setInProgress] = useState(false);
    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [loadingProgress, setLoadingProgress] = useState({
        stage: 'site',
        currentPart: 0,
        totalItems: 0,
        siteGoods: 0,
        status: 'Загрузка товаров...'
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getProgressValue = () => {
        switch (loadingProgress.stage) {
            case 'site':
                return 10 + (loadingProgress.currentPart * 2);
            default:
                return 0;
        }
    };

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                const { siteGoods } = await fetchAllGoods(
                    (progress) => {
                        setLoadingProgress(prev => ({
                            ...prev,
                            ...progress
                        }));
                    },
                    token
                );
                
                setGoods(siteGoods);
                
                // Фильтруем отключенные товары
                const disabled = siteGoods.filter(good => !good.ACTIVE);
                
                // Разделяем на товары с категориями и без
                const withoutCategory = disabled.filter(good => !good.CATEGORY_ID || good.CATEGORY_ID === '0');
                const withCategory = disabled.filter(good => good.CATEGORY_ID && good.CATEGORY_ID !== '0');
                
                setDisabledGoods(withCategory);
                setDisabledGoodsWithoutCategory(withoutCategory);

                // Логируем результаты
                console.log('Статистика по товарам:', {
                    'Всего товаров': siteGoods.length,
                    'Всего отключенных': disabled.length,
                    'Отключенных с категориями': withCategory.length,
                    'Отключенных без категорий': withoutCategory.length
                });
                
                console.log('Отключенные товары с категориями:', withCategory);
                console.log('Отключенные товары без категорий:', withoutCategory);
                
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setAnswer({
                    severity: "error",
                    message: `Ошибка при загрузке данных: ${error}`
                });
            }
            setLoading(false);
        };

        getData();
    }, [token]);

    const handleEnableAll = async () => {
        setInProgress(true);
        try {
            const updatedGoods = disabledGoods.map(good => ({
                ...good,
                ACTIVE: true,
                IS_MODIFIED_ON_SITE: true
            }));

            const result = await uploadGoods(token, updatedGoods);
            
            if (result?.severity === "success") {
                setAnswer({
                    severity: "success",
                    message: `Успешно включено ${updatedGoods.length} товаров`
                });
                setDisabledGoods([]);
            } else {
                setAnswer({
                    severity: "error",
                    message: "Ошибка при обновлении товаров"
                });
            }
        } catch (error) {
            setAnswer({
                severity: "error",
                message: `Ошибка при обновлении товаров: ${error}`
            });
        }
        setInProgress(false);
    };

    return (
        <Page label="Отключенные товары" subtitle="Управление отключенными товарами">
            {loading ? (
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
                    <Typography variant="body1" color="text.secondary">
                        Товаров с сайта: {loadingProgress.siteGoods}
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Статистика по товарам
                        </Typography>
                        <Typography variant="body1">
                            Всего товаров: {goods.length}
                        </Typography>
                        <Typography variant="body1" color="primary">
                            Отключено с категориями: {disabledGoods.length}
                        </Typography>
                        <Typography variant="body1" color="error">
                            Отключено без категорий: {disabledGoodsWithoutCategory.length}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                        {inProgress && <CircularProgress color="info" size={20} />}
                        {!!answer && (
                            <Alert severity={answer?.severity || "info"}>
                                {answer?.message || ""}
                            </Alert>
                        )}
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<VisibilityIcon />}
                            onClick={handleEnableAll}
                            disabled={disabledGoods.length === 0 || inProgress}
                        >
                            Включить товары с категориями ({disabledGoods.length})
                        </Button>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Название</TableCell>
                                    <TableCell>XML_ID</TableCell>
                                    <TableCell>Артикул</TableCell>
                                    <TableCell>Категория</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {disabledGoods
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((good, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{good.NAME || 'Нет данных'}</TableCell>
                                        <TableCell>{good.XML_ID || 'Нет данных'}</TableCell>
                                        <TableCell>{good.ARTICLE || 'Нет данных'}</TableCell>
                                        <TableCell>{good.CATEGORY?.NAME || 'Нет данных'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={disabledGoods.length}
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
                </>
            )}
        </Page>
    );
} 