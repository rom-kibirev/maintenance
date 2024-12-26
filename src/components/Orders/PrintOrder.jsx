import {Box, Typography} from "@mui/material";
import {Price} from "../UI/global/Price";

export default function PrintOrder({data}) {

    console.log('\n PrintOrder', data);

    const {posting_number,order_id, order_status, order_payment, order_delivery, customer_company, order_goods, customer_id} = data;

    return (
        <Box className={`bg-amber-200 text-black/90 p-3 rounded-md`}>
            <Typography variant="h5" component="h3">Номер заказа: {posting_number}</Typography>
            {order_id && <Typography variant="h5" component="h3">Номер в 1С: {order_id}</Typography>}
            {customer_id && <Typography variant="h5" component="h3">Контрагент в 1С: {customer_id}</Typography>}
            <Typography>Статус: {order_status}</Typography>
            <Typography>Оплата: {order_payment}</Typography>
            <Typography>Доставка: {order_delivery}</Typography>
            {customer_company && <Typography>от Компании: {order_delivery}</Typography>}
            {order_goods?.length && <Typography variant="h3" component="h3">На сумму: {Price(order_goods.map(g => g.price).reduce((sum, price) => sum + price, 0))}</Typography>}
        </Box>
    )
}