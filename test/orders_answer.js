const newOrders = {
    "status": "success",
    "data": [
        {
            "order_status": "",
            "posting_number": "runtec_204",
            "order_test": false,
            "customer_id": "4ee86-0153b-4608-862f-5f9383334442",
            "customer": {
                "name": "1",
                "email": "example111@mail.ru",
                "phone": "+7 (999) 888-77-66"
            },
            "customer_company": {
                "name": "ООО НОВЫЙ ТЕСТ",
                "address": null,
                "kpp": null,
                "inn": "ИНН",
                "ogrn": null,
                "okpo": null,
                "bank": null,
                "bik": "БИК",
                "bank_account": "Расчётный счёт",
                "correspondent_account": null,
                "director": "Генеральный директор"
            },
            "order_consignee": {
                "fio": "1",
                "phone": "+7 (999) 888-77-66"
            },
            "warehouse_id": "8aca33e8-cba3-11e3-80cb-002590d99cf6",
            "order_delivery": "Самовывоз",
            "order_shipment_date": null,
            "order_address": null,
            "order_delivery_company": null,
            "order_payment_id": "c4dc2f4e-09ba-11e0-81b1-0015175303fd",
            "order_payment": "Наличными при получении",
            "order_comment": "",
            "order_delivery_cost": 0,
            "order_goods": [
                {
                    "guid": "3bb646ff-eed7-4a5d-a1c0-8439132fca7d",
                    "quantity": 1,
                    "price": 22820
                }
            ]
        },
        {
            "order_status": "",
            "posting_number": "runtec_203",
            "order_test": false,
            "customer_id": null,
            "customer": {
                "name": "Роман Кибирев",
                "email": "kibirev.r@garagetools.ru",
                "phone": "8 (911) 036-63-32"
            },
            "customer_company": null,
            "order_consignee": {
                "fio": "Роман Кибирев",
                "phone": "8 (911) 036-63-32"
            },
            "warehouse_id": "8aca33e8-cba3-11e3-80cb-002590d99cf6",
            "order_delivery": "Самовывоз",
            "order_shipment_date": null,
            "order_address": null,
            "order_delivery_company": null,
            "order_payment_id": "bx_65b8fab94250f",
            "order_payment": "Уточнить у менеджера",
            "order_comment": "test",
            "order_delivery_cost": 0,
            "order_goods": [
                {
                    "guid": "86158d71-e9d0-4021-8979-6a801bfeef2b",
                    "quantity": 1,
                    "price": 65
                }
            ]
        },
        {
            "order_status": "",
            "posting_number": "runtec_202",
            "order_test": false,
            "customer_id": "4ee86-0153b-4608-862f-5f9383334442",
            "customer": {
                "name": "Luckru113 Dev",
                "email": "dp@luckru.ru",
                "phone": "8 (800) 555-35-35"
            },
            "customer_company": null,
            "order_consignee": {
                "fio": "Кибирев Роман Сергеевич",
                "phone": "79110366332"
            },
            "warehouse_id": "b100e18e-baff-11e7-811c-002590d99cf6",
            "order_delivery": "Доставка до адреса",
            "order_shipment_date": "2024-07-20",
            "order_address": {
                "address": "Софийская улица, 6к8",
                "city": "Санкт-Петербург",
                "zip_code": "190000"
            },
            "order_delivery_company": "Деловые линии",
            "order_payment_id": "c4dc2f4e-09ba-11e0-81b1-0015175303fd",
            "order_payment": "Наличными при получении",
            "order_comment": "TEST",
            "order_delivery_cost": 0,
            "order_goods": [
                {
                    "guid": "352519be-17f7-4772-bd87-b34c93266a60",
                    "quantity": 1,
                    "price": 65
                },
                {
                    "guid": "86158d71-e9d0-4021-8979-6a801bfeef2b",
                    "quantity": 1,
                    "price": 500
                }
            ]
        },
        {
            "order_status": "",
            "posting_number": "runtec_201",
            "order_test": false,
            "customer_id": "4ee86-0153b-4608-862f-5f9383334442",
            "customer": {
                "name": "Luckru113 Dev",
                "email": "dp@luckru.ru",
                "phone": "8 (111) 111-11-11"
            },
            "customer_company": null,
            "order_consignee": {
                "fio": "Luckru113 Dev 2",
                "phone": "8 (222) 222-22-22"
            },
            "warehouse_id": "8aca33e8-cba3-11e3-80cb-002590d99cf6",
            "order_delivery": "Доставка до адреса",
            "order_shipment_date": null,
            "order_address": {
                "address": "11111",
                "city": "",
                "zip_code": "143960"
            },
            "order_delivery_company": null,
            "order_payment_id": "bx_65b8fab94250f",
            "order_payment": "Уточнить у менеджера",
            "order_comment": "TEST",
            "order_delivery_cost": 500,
            "order_goods": [
                {
                    "guid": "7b541a46-be28-4353-9ba7-e84e7d930f5e",
                    "quantity": 1,
                    "price": 19400
                },
                {
                    "guid": "3bb646ff-eed7-4a5d-a1c0-8439132fca7d",
                    "quantity": 1,
                    "price": 32820
                }
            ]
        }
    ]
}

const fakeUpdate = [
    {
        "posting_number": "runtec_01",
        "customer_id": "runtec-test-4608-862f-5f9383334442",
        "warehouse_id": "test-baff-11e7-811c-002590d99cf6",
        "order_delivery": "Доставка до адреса",
        "order_shipment_date": "2024-12-29",
        "order_delivery_date": "2024-12-31",
        "order_delivery_company": "Деловые линии",
        "order_address_city": "Санкт-Петербург",
        "order_address": "Софийская улица, 6к8",
        "order_payment_id": "test-09ba-11e0-81b1-0015175303fd",
        "order_payment": "Наличными при получении",
        "order_id": "Ц-test57071",
        "order_price_type_id": "test-09ba-11e0-81b1-0015175303fd",
        "order_price_type": "Оптовая цена",
        "order_status": "В пути",
        "order_reject_reason": null,
        "order_consignee_fio": "Кибирев Роман Сергеевич",
        "order_consignee_phone": "79110366332",
        "order_goods": [
            {
                "guid": "352519be-17f7-4772-bd87-b34c93266a60",
                "quantity": 1,
                "price": 165
            },
            {
                "guid": "86158d71-e9d0-4021-8979-6a801bfeef2b",
                "quantity": 1,
                "price": 500
            }
        ]
    }
]