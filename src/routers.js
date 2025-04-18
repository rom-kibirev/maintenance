import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PlumbingRoundedIcon from "@mui/icons-material/PlumbingRounded";
import RssFeedIcon from '@mui/icons-material/RssFeed';
// import AccountTreeIcon from '@mui/icons-material/AccountTree';
import React from "react";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import WelcomeUser from "./components/Dash/WelcomeUser";
import SearchGoods from "./components/Search/SearchGoods";
import CategoriesTools from "./components/Dash/CategoriesTools";
import GoodsTools from "./components/Dash/GoodsTools";
import FeedGoodsDiff from "./components/Dash/FeedGoodsDiff";
// import CatalogView from "./components/Out/CatalogView";
import ViewUsers from "./components/Orders/ViewUsers";
import ViewAllOrders from "./components/Orders/ViewAllOrders";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import Points from "./components/Points/Points";
import WarehouseIcon from '@mui/icons-material/Warehouse';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CategoriesComparison from "./components/Categories/CategoriesAnalizeSite1C";
import GoodsWithoutCategory from "./components/Goods/FindCategoriesForGoods";
import GoodsAnalysisSite1C from "./components/Goods/GoodsAnalysisSite1C";
import DisabledGoodsManager from "./components/Goods/DisabledGoodsManager";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Goods1CDuplicates from "./components/Goods/Goods1CDuplicates";
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import ResearchWantedGoods from "./components/Goods/ResearchWantedGoods";
import InventoryIcon from '@mui/icons-material/Inventory';
import GoodsCheckData from "./components/Goods/GoodsCheckData";
import AirlineSeatReclineExtraIcon from '@mui/icons-material/AirlineSeatReclineExtra';

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
    // {
    //     title: 'Каталог товаров ТЗ',
    //     to: '/catalog-view',
    //     worked: 'Описан в "Обновление UI сайта runtec-shop.ru"',
    //     icon: <AccountTreeIcon />,
    //     component: <CatalogView token={token} />,
    // },
    {
        title: 'Точки выдачи товаров',
        to: '/points',
        description: 'Ведется работа над работой с точками (Склады/Магазины/Дилеры/Постаматы)',
        component: <Points token={token} />,
        icon: <WarehouseIcon />,
        // falsePrint: true,
    },
    {
        title: 'Пользователи',
        to: '/orders',
        worked: 'Просмотр всех пользователей, заказов пользователей',
        description: 'Необходимо тестирование с 1С',
        icon: <PeopleIcon />,
        component: <ViewUsers token={token} />,
        doubtfully_necessary: true,
    },
    {
        title: 'Просмотр всех заказов',
        to: '/orders-all',
        component: <ViewAllOrders token={token} />,
        icon: <AddShoppingCartIcon />,
        falsePrint: true,
        doubtfully_necessary: true,
    },
    {
        title: 'Анализ товаров',
        to: '/goods-analysis',
        description: 'Комплексный анализ товаров из разных источников (API, сайт, 1С, фид)',
        worked: 'Сравнение товаров, анализ расхождений, статистика по категориям и брендам',
        icon: <AnalyticsIcon />,
        component: <GoodsAnalysisSite1C token={token} />,
    },
    {
        title: 'Анализ категорий',
        to: '/category-analysis',
        description: 'Анализ категорий с подсветкой и экспортом в XLSX',
        icon: <CategoryRoundedIcon />,
        component: <CategoriesComparison token={token} />,
    },
    {
        title: 'Исправление товаров',
        to: '/find-category-goods',
        // description: 'Анализ категорий с подсветкой и экспортом в XLSX',
        icon: <PlumbingRoundedIcon />,
        component: <GoodsWithoutCategory token={token} />,
    },
    {
        title: 'Отключенные товары',
        to: '/disabled-goods',
        description: 'Управление отключенными товарами на сайте',
        worked: 'Просмотр и массовое включение отключенных товаров',
        icon: <VisibilityOffIcon />,
        component: <DisabledGoodsManager token={token} />,
    },
    {
        title: 'Дубли товаров в 1С',
        to: '/goods-1c-duplicates',
        icon: <LooksTwoIcon />,
        component: <Goods1CDuplicates token={token} />,
    },
    {
        title: 'Наши товары',
        to: '/ResearchWantedGoods',
        icon: <InventoryIcon />,
        component: <ResearchWantedGoods token={token} />,
    },
    {
        title: 'Товары',
        to: '/goods-check-data',
        component: <GoodsCheckData token={token} />,
        icon: <AirlineSeatReclineExtraIcon />,
    },
]);
