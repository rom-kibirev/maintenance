import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {fetchAllOrdersData, fetchUserData} from "../../requests/api_v2";
import Page from "../UI/Theme/Page";
import {Box, Button} from "@mui/material";
import CopyButton from "../UI/global/copyTools";
import Typography from "@mui/material/Typography";
import {fetchGoodsData, mergeFeed} from "../UI/global/sortTools";
import {Price} from "../UI/global/Price";
import {ReactComponent as ExcelIcon} from '../UI/Icons/excelIcon.svg';
import {downloadXLSX} from "../UI/global/xlsxTools";

export default function ViewAllOrders ({token}) {

    const navigate = useNavigate();

    const [orders, setOrders] = useState(null);
    const [printOrders, setPrintOrders] = useState(null);
    const [goods, setGoods] = useState(null);

    useEffect(() => {

        const getData = async () => {

            const userData = await fetchUserData(token);
            // console.log('\n getData', userData.data);
            if (userData.success && userData.data.groups.includes(1)) {

                const updateOrders = await fetchAllOrdersData(token);

                if (updateOrders.success) {
                    // console.log(`\n updateOrders`, updateOrders.data);
                    setOrders(updateOrders.data);
                }

                const { goods, feed } = await fetchGoodsData(token);
                if (goods?.length && feed?.length) {
                    const updateGoods = mergeFeed(goods, feed);
                    setGoods(updateGoods);
                }
            }
            else navigate('/');
        }

        getData();
    }, [token, navigate]);
    useEffect(() => {
        if (orders?.length) {

            const updatePrintOrders = [...orders];

            setPrintOrders(updatePrintOrders);
        }
    } , [orders]);

    const exportExcel = (order_id) => {
        const currentOrder = orders.find(o => o.posting_number === order_id);
        const exportData = [[
            '№',
            'Артикул',
            'Количество',
        ]];

        currentOrder?.order_goods.forEach((og, i) => {
            const good = goods.find(g => g.XML_ID === og.guid);

            exportData.push([
                i + 1,
                good?.VENDOR,
                og.quantity,
            ]);
        });

        const fileName = `${currentOrder?.order_id ? currentOrder.order_id : order_id}`;

        // Используем новую функцию для скачивания
        downloadXLSX(exportData, fileName);
    };

    return (<Page
        label="Просмотр заказов"
        subtitle=""
    >
        <Box className={`flex flex-wrap gap-2 items-top`}>
            {printOrders?.length && printOrders.map(o => {

                const order_summ = Price(o.order_goods?.reduce((sum, g) => sum + g.price, 0));
                const delivery_summ = Price(o.order_delivery_cost);

                return (
                    <Box key={o.posting_number} className={`rounded-md border border-amber-500/40 overflow-auto flex flex-col items-center`}>
                        <Box className={`flex gap-2 items-center bg-amber-500/5 w-full px-3`}>
                            Заказ № {o.posting_number}
                            <CopyButton str={(o.posting_number)} />
                        </Box>
                        <Box className={`p-2 flex flex-col gap-3 grow`}>
                            <Box>Статус: {o.order_id ? o.order_status : <span className={'text-amber-600'}>на очереди в 1С</span>}</Box>
                            {o.order_id && <Box className={`flex gap-2 items-center`}>
                                Номер заказа в 1С: {o.order_id}
                                <CopyButton str={(o.order_id)} />
                            </Box>}
                            {o.customer_id && <Box>{
                                (o.order_user.customer_id === o.customer_id) ?
                                    <Typography component={'p'}>
                                        Пользователь:
                                        <Box>
                                            <Box>{o.order_user.customer.surname} {o.order_user.customer.name}</Box>
                                            <Box className={`flex gap-2 items-center`}>
                                                {o.order_user.customer.email}
                                                <CopyButton str={(o.order_user.customer.email)} />
                                            </Box>
                                        </Box>
                                    </Typography> :
                                    (!!o.order_user.customer_company?.find(c => c.customer_id === o.customer_id)) ?
                                        <Typography component={'p'}>Компания: <span className={`text-red-700`}>нужен метод данные по компании</span></Typography> :
                                        <Typography>TODO нет userID</Typography>
                            }</Box>}
                            <Box>Получение: {o.order_delivery}</Box>
                            <Box>Оплата: {o.order_payment}</Box>
                            <Box>На сумму: {order_summ}р.</Box>
                            {delivery_summ > 0 && <Box>Доставка: {delivery_summ}р.</Box>}
                        </Box>
                        <Button
                            color="success"
                            onClick={() => exportExcel(o.posting_number)}
                            startIcon={<ExcelIcon className={`w-5 h-5 `} />}
                        >Скачать</Button>
                    </Box>
                )
            })}
        </Box>
    </Page>);
}