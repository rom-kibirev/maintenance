import {useEffect, useState} from "react";
import Page from "../UI/Theme/Page";
import {fetchOrdersData, fetchUserData, fetchUsersData} from "../../requests/api_v2";
import PrintTable from "../UI/Table/PrintTable";
import {Box, Button, Typography} from "@mui/material";
import PageviewRoundedIcon from '@mui/icons-material/PageviewRounded';
import {useLocation, useNavigate} from "react-router-dom";
import PrintOrder from "./PrintOrder";

export default function ViewUsers ({token}) {

    const navigate = useNavigate();
    const params = new URLSearchParams(useLocation().search);
    const selectedUser = +params.get('user');

    const [users, setUsers] = useState(null);
    const [accessGranted, setAccessGranted] = useState(null);
    const [orders, setOrders] = useState(null);

    useEffect(() => {

        const getData = async () => {
            const userData = await fetchUserData(token);
            // console.log('\n ', userData.data);
            if (userData.success) setAccessGranted(userData.data.groups.includes(1));

            const usersData = await fetchUsersData(token);
            // console.log('\n usersData', usersData);
            if (usersData.success) setUsers(usersData?.data?.map(user => ({...user, id: user.user_id})));
        }

        getData();
    }, [token]);
    useEffect(() => {

        const getOrders = async () => {

            const order_id_list = users.find(user => user.id === selectedUser).order_id_list.map(order => order.replace('runtec_',''));

            const ordersData = await fetchOrdersData(token, order_id_list);

            if (ordersData?.success) setOrders(ordersData?.data?.data);

            // console.log('\n getOrders', {
            //     order_id_list,
            //     ordersData
            // });
        }

        if (users?.length && !!selectedUser) getOrders();
    },[token, selectedUser, users]);

    const columns = [
        {
            field: "user_id",
            headerName: "ID"
        },
        {
            field: "name",
            headerName: "Имя",
            renderCell: ({ row }) => (row.customer.name),
            flex: 1,
        },
        {
            field: "surname",
            headerName: "Фамилия",
            renderCell: ({ row }) => (row.customer.surname),
            flex: 1,
        },
        {
            field: "phone",
            headerName: "Телефон",
            renderCell: ({ row }) => (row.customer.phone),
            flex: 1,
        },
        {
            field: "email",
            headerName: "Email",
            renderCell: ({ row }) => (row.customer.email),
            flex: 1,
        },
        {
            field: "customer_company",
            headerName: "Компании",
            renderCell: ({ row }) => (row.customer_company?.length),
        },
        {
            field: "order_id_list",
            headerName: "Заказы",
            renderCell: ({ row }) => {


                return (
                    row.order_id_list?.length && <Box>
                        <Button
                            variant="contained"
                            color="info"
                            startIcon={<PageviewRoundedIcon />}
                            onClick={() => {
                                navigate(`/orders/?user=${row.id}&orders`);
                            }}
                        >
                        {row.order_id_list?.length}
                        </Button>
                    </Box>
                )
            },
        },
    ];

    // console.log('\n ViewUsers', {
    //     users,
    //     orders
    // });

    return (
        <Page
                label="Просмотр пользователей"
                subtitle="пользователей сайта Runtec"
            >
                {!!selectedUser && <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate(`/orders/`)}
                >
                    Назад
                </Button>}
            {accessGranted && <Box className={`h-full flex gap-2 flex-col`}>
                {users?.length && <PrintTable
                    rows={!!selectedUser ? [users.find(user => user.id === selectedUser)] : users}
                    columns={columns}
                    height={selectedUser && `160px`}
                />}
                {(!!selectedUser && users?.length) && <Box className={`grow`}>
                    <Typography variant="h6" component="h2">GUID пользователя и его контрагентов:</Typography>
                    <Box>{users?.find(user => user.id === selectedUser).customers_id_list?.join(', ')}</Box>
                    {orders?.length && <Box className={`flex flex-wrap gap-2 mt-2`}>
                        {orders.map(order => <PrintOrder data={order}/>)}
                    </Box>}
                </Box>}
            </Box>}
            </Page>
    )
}