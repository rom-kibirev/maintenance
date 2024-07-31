import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PlumbingRoundedIcon from "@mui/icons-material/PlumbingRounded";
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import React from "react";

export const routers = [
    {
        id: 1,
        src: 'https://media1.tenor.com/m/8HzxIxtScSsAAAAd/pulp-fiction-movies.gif',
        title: 'Работа с поиском товаров',
        to: '/search',
        options: 'Атотранслит, Поиск по названию',
        trouble: 'Не описан, нет api, интеграция с сайтом',
        icon: <SearchRoundedIcon />
    },
    {
        id: 2,
        src: 'https://www.zeluslugi.ru/upload/news/terms20190510-2.gif',
        title: 'Работа с категориями',
        to: '/categories-tools',
        options: 'Управление настроками категорий, поиск ошибок, сравнение с текущим каталогом, формирование отчета',
        trouble: 'Не описан, нет api, интеграция с сайтом',
        icon: <CategoryRoundedIcon />
    },
    {
        id: 3,
        src: 'https://i.pinimg.com/originals/c6/b8/b8/c6b8b850c7851485c8d30455a1ab814f.gif',
        title: 'Работа с товарами',
        to: '/goods-tools',
        options: '',
        trouble: 'Не описан, нет api, интеграция с сайтом',
        icon: <PlumbingRoundedIcon />
    },
    {
        id: 3,
        src: 'https://otvet.imgsmail.ru/download/15345044_ab1eaa969f15365a3b106a30b9f059bd_800.gif',
        title: 'Матрицы товаров',
        to: '/',
        options: '',
        trouble: 'Не описан, нет api, интеграция с сайтом',
        icon: <SwitchAccessShortcutIcon />
    },
]