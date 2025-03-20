import Page from "../UI/Theme/Page";
import { useEffect, useState, useMemo } from "react";
import { fetchAllGoods } from "../UI/global/sortTools";
import * as XLSX from 'xlsx';
import {
    Box,
    Button,
    Select,
    MenuItem,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TablePagination,
} from "@mui/material";
import { FixedSizeList } from 'react-window';

export default function GoodsAnalysisSite1C({ token }) {
    const [goods, setGoods] = useState([]);
    const [goods1C, setGoods1C] = useState([]);
    const [, setCategories] = useState([]); //categories
    const [, setGoodsMatchSite1C] = useState([]); //goodsMatchSite1C
    const [, setGoodsInSiteWithout1C] = useState([]); //goodsInSiteWithout1C
    const [goodsIn1CWithoutSite, setGoodsIn1CWithoutSite] = useState([]);
    const [, setGoodsWithoutCategory] = useState([]); //goodsWithoutCategory
    const [, setGoodsDisabled] = useState([]); //goodsDisabled
    const [duplicateXmlIdsDetails, setDuplicateXmlIdsDetails] = useState({});
    const [duplicateGuidsDetails, setDuplicateGuidsDetails] = useState({});
    const [statusFilter, setStatusFilter] = useState('all');
    const [statusCounts, setStatusCounts] = useState({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    useEffect(() => {
        const getData = async () => {
            console.log('Starting data fetch...');
            const { siteGoods, goods1C: goods1CArray, categories: categoriesData } = await fetchAllGoods(
                (progress) => {},
                token
            );
            console.log('Data fetched:', {
                siteGoodsLength: siteGoods?.length,
                goods1CLength: goods1CArray?.length,
                categoriesLength: categoriesData?.length,
            });

            const worker = new Worker(new URL('./analysisWorker.js', import.meta.url));
            worker.postMessage({ siteGoods, goods1C: goods1CArray, categories: categoriesData });

            worker.onmessage = (e) => {
                console.log('Received data from worker:', e.data);
                const {
                    enrichedGoods,
                    goods1C,
                    categories,
                    goodsDisabled,
                    goodsMatchSite1C,
                    goodsInSiteWithout1C,
                    goodsIn1CWithoutSite,
                    goodsWithoutCategory,
                    duplicateXmlIdsDetails,
                    duplicateGuidsDetails,
                    statusCounts,
                } = e.data;

                setGoods(enrichedGoods);
                setGoods1C(goods1C);
                setCategories(categories);
                setGoodsDisabled(goodsDisabled);
                setGoodsMatchSite1C(goodsMatchSite1C);
                setGoodsInSiteWithout1C(goodsInSiteWithout1C);
                setGoodsIn1CWithoutSite(goodsIn1CWithoutSite);
                setGoodsWithoutCategory(goodsWithoutCategory);
                setDuplicateXmlIdsDetails(duplicateXmlIdsDetails);
                setDuplicateGuidsDetails(duplicateGuidsDetails);
                setStatusCounts(statusCounts);
            };

            worker.onerror = (error) => {
                console.error('Worker error:', error);
            };

            return () => worker.terminate();
        };

        getData();
    }, [token]);

    const exportDuplicatesToExcel = () => {
        const siteData = Object.entries(duplicateXmlIdsDetails).flatMap(([xmlId, goodsList]) =>
            goodsList.map(good => ({
                source: 'Сайт',
                xml_id: xmlId,
                id: good.id,
                name: good.name,
                active: good.ACTIVE ? 'Да' : 'Нет',
                duplicates_count: goodsList.length,
            }))
        );

        const data1C = Object.entries(duplicateGuidsDetails).flatMap(([guid, goodsList]) =>
            goodsList.map(good => ({
                source: '1C',
                guid: guid,
                name: good.name,
                duplicates_count: goodsList.length,
            }))
        );

        if (siteData.length === 0 && data1C.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }

        const wb = XLSX.utils.book_new();
        if (siteData.length > 0) {
            const wsSite = XLSX.utils.json_to_sheet(siteData);
            XLSX.utils.book_append_sheet(wb, wsSite, 'Дубли на сайте');
        }
        if (data1C.length > 0) {
            const ws1C = XLSX.utils.json_to_sheet(data1C);
            XLSX.utils.book_append_sheet(wb, ws1C, 'Дубли в 1С');
        }
        XLSX.writeFile(wb, 'duplicates_analysis.xlsx');
    };

    const exportMissingSiteGoodsToExcel = () => {
        const missingGoodsData = goodsIn1CWithoutSite.map(good => ({
            guid: good.guid,
            name: good.name,
            article: good.article || '',
            price: good.price || '',
            category: good.category || '',
            manufacturer: good.manufacturer || '',
        }));

        if (missingGoodsData.length === 0) {
            alert('Нет товаров для экспорта');
            return;
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(missingGoodsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Товары без сайта');
        XLSX.writeFile(wb, 'missing_site_goods.xlsx');
    };

    const filteredGoods = useMemo(() => {
        if (statusFilter === 'all') return goods;
        return goods.filter(good => good.statuses.some(s => s.label === statusFilter));
    }, [goods, statusFilter]);

    const currentPageData = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredGoods.slice(start, start + rowsPerPage);
    }, [filteredGoods, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setPage(0);
    };

    console.log('Rendering GoodsAnalysisSite1C:', {
        goodsLength: goods.length,
        goods1CLength: goods1C.length,
    });

    const Row = ({ index, style }) => {
        const good = currentPageData[index];
        return (
            <TableRow style={style}>
                <TableCell>{good?.NAME || 'No data'}</TableCell>
                <TableCell>{good?.XML_ID || 'No data'}</TableCell>
                <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {good?.statuses?.map((status, idx) => (
                            <Chip key={idx} label={status.label} color={status.color} size="small" />
                        )) || 'No statuses'}
                    </Box>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <Page label="Анализ товаров" subtitle="товары с сайта и 1С">
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Статистика по товарам</Typography>
                <Typography variant="body1">
                    Всего на сайте: {goods.length} / Всего в 1С: {goods1C.length}
                </Typography>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Select value={statusFilter} onChange={handleStatusFilterChange} displayEmpty sx={{ minWidth: 200 }}>
                    <MenuItem value="all">Все статусы</MenuItem>
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <MenuItem key={status} value={status}>
                            {status} ({count})
                        </MenuItem>
                    ))}
                </Select>
                <Button color="success" onClick={exportDuplicatesToExcel} variant="contained">
                    Выгрузить дубли в Excel
                </Button>
                <Button color="info" onClick={exportMissingSiteGoodsToExcel} variant="contained">
                    Выгрузить товары без сайта
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>XML_ID</TableCell>
                            <TableCell align="right">Статусы</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <FixedSizeList
                            height={400}
                            width="100%"
                            itemCount={currentPageData.length}
                            itemSize={50}
                        >
                            {Row}
                        </FixedSizeList>
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={filteredGoods.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[25, 50, 100]}
            />
        </Page>
    );
}