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
const patch_categories = {
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
const patch_goods = {
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

const getPriceType = {
    "method": "GET /api/price/",
    "response": [
        {
            "ID_PRICE": 1,
            "PRICE_NAME": "Розничные",
            "CURRENCY": "RUB",
            "DATE_ACTIVE_FROM": "2023-01-01 00:00:00",
            "DATE_ACTIVE_TO": "2023-12-31 23:59:59"
        },
        {
            "ID_PRICE": 2,
            "PRICE_NAME": "Опт",
            "CURRENCY": "RUB",
            "DATE_ACTIVE_FROM": "2023-01-01 00:00:00",
            "DATE_ACTIVE_TO": "2023-12-31 23:59:59"
        },
    ]
}

// v1 POST /Order:GetNew
const OGN_response = [
    {
        "order_status": "",
        "posting_number": "runtec_01",
        "order_test": true,
        "customer_id": "4ee86-0153b-4608-862f-5f9383334442",
        "customer": {
            "name": "Роман",
            "email": "kibirev.r@garagetools.ru",
            "phone": "8 (911) 036-63-32"
        },
        "customer_company": {
            "name": "Наименование компании",
            "address": "Юридический адрес",
            "kpp": "КПП",
            "inn": "ИНН",
            "ogrn": "ОГРН",
            "okpo": "ОКПО",
            "bank": "Наименование банка",
            "bik": "БИК",
            "bank_account": "Р/С",
            "correspondent_account": "К/С",
            "director": "Ген директор (Ф.И.О.)",
        },
        "order_consignee": {
            "fio": "Роман",
            "phone": "8 (911) 036-63-32"
        },
        "warehouse_id": "b100e18e-baff-11e7-811c-002590d99cf6",
        "order_delivery": "Доставка до адреса",
        "order_shipment_date": "2024-07-20",
        "order_address": {
            "address": "улица Ленина, д.3",
            "city": "Республика Саха (Якутия), пос. Мирный",
            "zip_code": "678174"
        },
        "order_delivery_company": "СДЕК",
        "order_payment_id": "c4dc2f4e-09ba-11e0-81b1-0015175303fd",
        "order_payment": "Оплата в магазине наличными или картой",
        "order_comment": "Комментарий пользователя",
        "order_delivery_cost": "500.00",
        "order_goods": [
            {
                "guid": "4ee86-11e0-4608-0153b-5f9383334342",
                "quantity": "1.000",
                "price": "65.00",
            },
            {
                "guid": "ddff34-11e0-4608-0153b-5f9383334342",
                "quantity": "1.000",
                "price": "500.00",
            },
        ]
    },
];
const updateOrtders =  [
    {
        "posting_number": "runtec_01",
        "customer_id": "4ee86-0153b-4608-862f-5f9383334442",
        "warehouse_id": "b100e18e-baff-11e7-811c-002590d99cf6",
        "order_delivery": "Доставка до адреса",
        "order_shipment_date": "2024-07-20",
        "order_delivery_date": "2024-07-21",
        "order_delivery_company": "Деловые линии",
        "order_address_city": "Санкт-Петербург",
        "order_address": "Софийская улица, 6к8",
        "order_payment_id": "c4dc2f4e-09ba-11e0-81b1-0015175303fd",
        "order_payment": "Наличными при получении",
        "order_id": "Ц-000457071",
        "order_price_type_id": "b100e-09ba-11e0-81b1-0015175303fd",
        "order_price_type": "Розничные",
        "order_status": "Собран",
        "order_reject_reason": null,
        "order_consignee_fio": "Кибирев Роман Сергеевич",
        "order_consignee_phone": "79110366332",
        "order_goods": [
            {
                "guid": "4ee86-11e0-4608-0153b-5f9383334342",
                "quantity": "1.000",
                "price": "65.00",
            },
            {
                "guid": "ddff34-11e0-4608-0153b-5f9383334342",
                "quantity": "1.000",
                "price": "500.00",
            },
        ]
    }
]
const users = [
    {
        "user_id ": 1,
        "customer_id": "GUID_customer",
        "order_price_type_id": "GUID_price_type",
        "customers_id_list": ["GUID_customer","GUID_customer-1","..."],
        "order_id_list": ["runtec-0001","...","..."],
        "customer": {
            "name": "имя",
            "surname": "фамилия",
            "order_consignee_fio": "ФИО в 1С",
            "email": "email",
            "phone": "79110366332"
        },
        "customer_company": [
            {
                "customer_id": "GUID_customer-1",
                "order_price_type_id": "GUID_price_type-1",
                "order_id_list": ["runtec-0002","...","..."],
            }
        ]
    }
]
const orders = [
    {
        "posting_number": "runtec-#####",
        "order_id": "Н-123456",
        "order_status": "В работе",
        "order_test": true,
        "customer_id": "GUID_customer",
        "order_consignee": {
            "name": "имя",
            "surname": "фамилия",
            "order_consignee_fio": "ФИО в 1С",
            "email": "email",
            "phone": "79110366332"
        },
        "warehouse_id": "GUID_warehouse",
        "order_delivery": "Самовывоз",
        "order_delivery_company": "Петрович",
        "order_delivery_cost": "123.45",
        "order_payment_id": "GUID_payment",
        "order_payment": "Оплата наличными курьеру Гарвин",
        "order_comment": "Комментарий пользователя",
        "order_goods": [
            {
                "guid": "{goods.XML_ID}",
                "quantity": "1.000",
                "price": "65.00",
            },
        ],
    }
]