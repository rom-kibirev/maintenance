import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PlumbingRoundedIcon from "@mui/icons-material/PlumbingRounded";
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import React from "react";

export const routers = [
    {
        id: 1,
        src: 'https://media1.tenor.com/m/8HzxIxtScSsAAAAd/pulp-fiction-movies.gif',
        title: 'Работа с поиском товаров',
        to: '/search',
        options: 'Атотранслит, Поиск по названию',
        trouble: 'Не описан, проблема на стороне работы с товарами',
        worked: null,
        icon: <SearchRoundedIcon />
    },
    {
        id: 2,
        src: 'https://perevozka24.ru/img/ck_upload/289.img4942.gif',
        title: 'Работа с категориями',
        to: '/categories-tools',
        options: 'В плане изменение свойств: FILTER_PROPS, IS_MODIFIED_ON_SITE, KEYWORDS, META_DESCRIPTION, TITLE',
        trouble: "Не описаны методы управления данными",
        worked: 'Работает API получение/отправка настроек категорий',
        icon: <CategoryRoundedIcon />
    },
    {
        id: 3,
        src: 'https://www.freistellen.de/wp-content/uploads/2022/05/b-2.gif',
        title: 'Работа с товарами',
        to: '/',
        options: '',
        trouble: 'Требует дополнение методов получения товаров, а также изменения лимитов',
        worked: 'Работает API получение/отправка настроек категорий',
        icon: <PlumbingRoundedIcon />
    },
    {
        id: 4,
        src: null,
        title: 'Сравнение по фиду 1С',
        to: '/feed-goods-diff',
        options: '',
        trouble: '',
        worked: '',
        icon: <RssFeedIcon />
    },
    {
        id: 3,
        src: 'https://otvet.imgsmail.ru/download/15345044_ab1eaa969f15365a3b106a30b9f059bd_800.gif',
        title: 'Матрицы товаров',
        to: '/',
        options: '',
        trouble: 'Не описан',
        icon: <SwitchAccessShortcutIcon />
    },
]