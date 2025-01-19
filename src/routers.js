import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PlumbingRoundedIcon from "@mui/icons-material/PlumbingRounded";
import RssFeedIcon from '@mui/icons-material/RssFeed';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import React from "react";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import WelcomeUser from "./components/Dash/WelcomeUser";
import SearchGoods from "./components/Search/SearchGoods";
import CategoriesTools from "./components/Dash/CategoriesTools";
import GoodsTools from "./components/Dash/GoodsTools";
import FeedGoodsDiff from "./components/Dash/FeedGoodsDiff";
import CatalogView from "./components/Out/CatalogView";
import ViewUsers from "./components/Orders/ViewUsers";
import ViewAllOrders from "./components/Orders/ViewAllOrders";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PeopleIcon from '@mui/icons-material/People';

export const routers = (token) => ([
    {
        title: "Главная",
        to: "/",
        icon: <HomeOutlinedIcon />,
        component: <WelcomeUser token={token} />,
        falsePrint: true,
    },
    {
        title: 'Работа с поиском товаров',
        to: '/search',
        worked: 'Атотранслит, Поиск по названию',
        description: 'Ведется работа над массовым получением товаров, массовое обновление товаров',
        icon: <SearchRoundedIcon />,
        component: <SearchGoods token={token} />,
    },
    {
        title: 'Работа с категориями',
        to: '/categories-tools',
        options: 'В плане изменение свойств: FILTER_PROPS, IS_MODIFIED_ON_SITE, KEYWORDS, META_DESCRIPTION, TITLE',
        description: "Не описаны методы управления данными эксель",
        worked: 'Работает API получение/отправка настроек категорий для выбранной категории',
        icon: <CategoryRoundedIcon />,
        component: <CategoriesTools token={token} />,
    },
    {
        title: 'Работа с товарами',
        to: '/goods-tools',
        description: 'Требует дополнение методов получения товаров, а также изменения лимитов',
        worked: 'Работает API получение/отправка настроек категорий. Ведется работа над массовым получением товаров, массовое обновление товаров',
        icon: <PlumbingRoundedIcon />,
        component: <GoodsTools token={token} />,
    },
    {
        title: 'Сравнение по фиду 1С',
        to: '/feed-goods-diff',
        worked: 'Работает обновление изображения из товара, сравнение данных по изображениям, цене, остаткам и складам по фиду "Розница"',
        icon: <RssFeedIcon />,
        component: <FeedGoodsDiff token={token} />,
    },
    {
        title: 'Каталог товаров ТЗ',
        to: '/catalog-view',
        worked: 'Описан в "Обновление UI сайта runtec-shop.ru"',
        icon: <AccountTreeIcon />,
        component: <CatalogView token={token} />,
    },
    {
        title: 'Пользователи',
        to: '/orders',
        worked: 'Просмотр всех пользователей, заказов пользователей',
        description: 'Необходимо тестирование с 1С',
        icon: <PeopleIcon />,
        component: <ViewUsers token={token} />,
    },
    {
        title: 'Просмотр всех заказов',
        to: '/orders-all',
        component: <ViewAllOrders token={token} />,
        icon: <AddShoppingCartIcon />,
        falsePrint: true,
    },
]);
