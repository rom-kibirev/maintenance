/* complete*/
const login = {
    "method": "POST /api/auth/login/",
    "request": {
        "login": "admin2",
        "password": "string"
    },
    "response": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
    }
}
const user = {
    "method": "GET /api/user/",
    "response": {
        "user_id": 5,
        "item": 1,
        "is_active": true,
        "is_blocked": false,
        "email": "kibirev.r@garagetools.ru",
        "name": "Роман",
        "surname": "Кибирев",
        "groups": [1,3,4,5,7,8,9],
    }
}
const user_groups = {
    1: "Администраторы",
    3: "Пользователи, имеющие право голосовать за рейтинг",
    4: "Пользователи имеющие право голосовать за авторитет",
    5: "Почтовые пользователи",
    6: "Зарегистрированные пользователи",
    7: "Администраторы интернет-магазина",
    8: "Контент-редакторы",
    9: "api"
}
const get_categories = {
    "method": "GET /api/categories/",
    "response": [
        {
            "ID": 8782,
            "NAME": "Runtec",
            "ACTIVE": "Y",
            "PREVIEW_PICTURE": "/media/...",
            "CODE": "runtec",
            "DESCRIPTION": "String description",
            "IBLOCK_SECTION_ID": null,
            "XML_PARENT_ID": null,
            "SORT": 500,
            "XML_ID": "3685902a-a323-4cc9-a5dd-5048944e9bfb",
            "TITLE": "String",
            "KEYWORDS": "String",
            "META_DESCRIPTION": "String",
            "GOODS_PREVIEW": 16856,
            "FILTER_PROPS": [
                "IP_PROP11",
                "IP_PROP12",
                "IP_PROP13",
                // ...
            ],
            "SEARCHABLE_CONTENT": "RUNTEC ГАЕЧНЫЙ КЛЮЧ ИНСТРУМЕНТ ДЛЯ ЗАТЯЖКИ И ОСЛАБЛЕНИЯ ГАЕК КЛЮЧ ГАЕЧНЫЙ ГАЙКОВЕРТ",
        }
    ]
}
const post_categories = {
    "method": "PATCH /api/categories/",
    "request": [
        {
            "ID": 8782,
            "NAME": "Runtec",
            "ACTIVE": "Y",
            "PREVIEW_PICTURE": "/media/...",
            "CODE": "runtec",
            "DESCRIPTION": "String description",
            "IBLOCK_SECTION_ID": null,
            "XML_PARENT_ID": null,
            "SORT": 500,
            "XML_ID": "3685902a-a323-4cc9-a5dd-5048944e9bfb",
            "TITLE": "String",
            "KEYWORDS": "String",
            "META_DESCRIPTION": "String",
            "GOODS_PREVIEW": 16856,
            "FILTER_PROPS": [
                "IP_PROP11",
                "IP_PROP12",
                "IP_PROP13",
                // ...
            ],
            "SEARCHABLE_CONTENT": "RUNTEC ГАЕЧНЫЙ КЛЮЧ ИНСТРУМЕНТ ДЛЯ ЗАТЯЖКИ И ОСЛАБЛЕНИЯ ГАЕК КЛЮЧ ГАЕЧНЫЙ ГАЙКОВЕРТ",
        }
    ],
    "response": 200,
    "limit": 1000
}
const get_goods = {
    "method": "GET /api/categories/",
    "response": [
        {
            // Рис. 5
            "ID": 23466,
            "ACTIVE": "Y",
            "NAME": "Гайковерт ударный аккумуляторный RUNTEC PRO 3/4\", 20В, 2*6Ач, 1600Нм",
            "CODE": "gaykovert-udarnyy-akkumulyatornyy-runtec-pro-3-4-20v-2-6ach-1600nm",
            "XML_ID": "0387effe-12f6-4d09-b4cd-3550197f2698",
            "SORT": 500,
            "TITLE": "String",
            "KEYWORDS": "String",
            "META_DESCRIPTION": "String",
            // Рис. 6
            "IS_NEW": false,
            "IS_LEADER": false,
            "IS_SPECIAL": false,
            "VENDOR": "RT-IW750", // Соответствует параметру goods=>vendor_code (IP_PROP9)
            "MATERIAL": "",
            "COLOR": "",
            "PICTURES": [
                "/media...",
                //...
            ],
            "PREVIEW_PICTURE": "/media/...",
            // Рис. 7
            "IS_TREND": false,
            "IS_HIT": "Y",
            "EQUIPMENT": "a:4:{i:0;...", // Соответствует параметру goods=> equipment (IP_PROP31) Необходимо перевести в читаемый вид аналогичный данным из 1С
            "_replace_EQUIPMENT": [
                {
                    "good": "Головки торцевые 1/2\" Е-профиль",
                    "value": "E10; E12; E14; E16; E18",
                    "quantity": 5
                },
                {
                    "good": "Головки свечные 1/2\" 6 граней пружинные",
                    "value": "16; 21 мм",
                    "quantity": 2
                },
                {
                    "good": "Трещотка 1/2\"",
                    "value": "36 зубов",
                    "quantity": 1
                },
                //...
            ],
            "BRAND": "RUNTEC", // Соответствует параметру goods=>brand (IP_PROP45)
            "COUNTRY": "КИТАЙ", // Соответствует параметру goods=>country (IP_PROP46)
            // Рис. 8
            "ANALOGUE_IDS": [
                23465,
                23467,
                //...
            ], // Соответствует параметру goods=>analogues
            "RELATED_IDS": [
                23465,
                23467,
                // ...
            ], // Соответствует параметру goods=>related
            "DELIVERY_PROPERTIES": {
                "CARGO_CHARACTERISTICS": {
                    "WEIGHT": "ВЕС",
                    "VOLUME": "ОБЪЕМ",
                    //...
                }, // Соответствует параметру goods=>parameters
                //...
            },
            // Рис. 9
            "SEO_DESCRIPTION": "String description",
            // Рис. 10
            "CATEGORY_XML_ID": "0387effe-12f6-4d09-b4cd-3550197f2698", // Соответствует параметру goods=>category
            "CATEGORIES": [
                3465,
                3467,
                // ...
            ],

            "SEARCHABLE_CONTENT": "RUNTEC ГАЕЧНЫЙ КЛЮЧ ИНСТРУМЕНТ ДЛЯ ЗАТЯЖКИ И ОСЛАБЛЕНИЯ ГАЕК КЛЮЧ ГАЕЧНЫЙ ГАЙКОВЕРТ",
        }
    ]
}
const post_goods = {
    "method": "PATCH /api/categories/",
    "request": [
        {
            "ID": 23466,
            "ACTIVE": "Y",
            "NAME": "Гайковерт ударный аккумуляторный RUNTEC PRO 3/4\", 20В, 2*6Ач, 1600Нм",
            "SORT": 500,
            "TITLE": "String",
            "KEYWORDS": "String",
            "META_DESCRIPTION": "String",
            "IS_NEW": false,
            "IS_LEADER": false,
            "IS_SPECIAL": false,
            "IS_TREND": false,
            "IS_HIT": "Y",
            "SEARCHABLE_CONTENT": "RUNTEC ГАЕЧНЫЙ КЛЮЧ ИНСТРУМЕНТ ДЛЯ ЗАТЯЖКИ И ОСЛАБЛЕНИЯ ГАЕК КЛЮЧ ГАЕЧНЫЙ ГАЙКОВЕРТ",
            "IS_MODIFIED_ON_SITE": false
        }
    ],
    "response": 200,
    "limit": 1000
}

/* review */
const getPriceByGoodId = {
    "method": "POST/GET /api/price/",
    "ids": [8782, 8783],
    "response": [
        {
            "ID": 8782,
            "PRICE": "123.45",
            "CURRENCY": "RUB",
        },
        {
            "ID": 8783,
            "PRICE": [
                {
                  "ID_PRICE": 1,
                  "PRICE": "123.45",
                  "CURRENCY": "RUB",
                  "DATE_ACTIVE_FROM": "2022-01-01 00:00:00",
                  "DATE_ACTIVE_TO": "2022-12-31 23:59:59",
                },
            ],
        },
    ]
}