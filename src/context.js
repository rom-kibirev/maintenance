import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PlumbingRoundedIcon from "@mui/icons-material/PlumbingRounded";
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import React from "react";

export const routers = [
    {
        id: 1,
        src: '',
        title: 'Работа с поиском товаров',
        to: '/search',
        options: 'Атотранслит, Поиск по названию',
        trouble: 'Не описан, проблема на стороне работы с товарами',
        worked: null,
        icon: <SearchRoundedIcon />
    },
    {
        id: 2,
        src: '',
        title: 'Работа с категориями',
        to: '/categories-tools',
        options: 'В плане изменение свойств: FILTER_PROPS, IS_MODIFIED_ON_SITE, KEYWORDS, META_DESCRIPTION, TITLE',
        trouble: "Не описаны методы управления данными",
        worked: 'Работает API получение/отправка настроек категорий',
        icon: <CategoryRoundedIcon />
    },
    {
        id: 3,
        src: '',
        title: 'Работа с товарами',
        to: '/goods-tools',
        options: '',
        trouble: 'Требует дополнение методов получения товаров, а также изменения лимитов',
        worked: 'Работает API получение/отправка настроек категорий',
        icon: <PlumbingRoundedIcon />
    },
    {
        id: 4,
        src: '',
        title: 'Сравнение по фиду 1С',
        to: '/feed-goods-diff',
        options: '',
        trouble: '',
        worked: '',
        icon: <RssFeedIcon />
    },
    {
        id: 5,
        src: '',
        title: 'Матрицы товаров',
        to: '/',
        options: '',
        trouble: 'Не описан',
        icon: <SwitchAccessShortcutIcon />
    },
    {
        id: 6,
        src: '',
        title: 'Каталог товаров ТЗ',
        to: '/catalog-view',
        options: '',
        trouble: 'Описан в "Обновление UI сайта runtec-shop.ru"',
        icon: <AccountTreeIcon />
    },
    {
        id: 7,
        src: '',
        title: 'Просмотр заказов',
        to: '/orders',
        options: '',
        trouble: '',
        icon: <ShoppingCartIcon />
    },
]