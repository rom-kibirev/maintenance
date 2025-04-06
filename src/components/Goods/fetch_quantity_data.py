import requests
import json
import os

# Настройки
BASE_URL = "https://runtec-shop.ru/api/v2/goods/quantity?type=full"
TOKEN = "e4be92ccfb300a8b98f6b695584eeb6cffe551b6eee4da6c9942fbc6b4d3529cd5492499d1a3d934"
OUTPUT_DIR = r"E:\develope\Runtec\maintenance\public\data\api_v2\quantity_data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "quantity_data_full.json")
LIMIT = 1000

headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

def fetch_quantity_data(page):
    """Загружает данные остатков для указанной страницы с сервера."""
    url = f"{BASE_URL}&page={page}&limit={LIMIT}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Ошибка при загрузке страницы {page}: {response.status_code}")
    data = response.json()
    return data.get("data", [])

def get_total_pages():
    """Получает общее количество страниц с сервера."""
    url = f"{BASE_URL}&page=1&limit={LIMIT}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Ошибка при получении первой страницы: {response.status_code}")
    data = response.json()
    return data.get("total_pages", 0)

def filter_zero_quantities(warehouses):
    """Фильтрует товары с нулевыми остатками."""
    filtered_warehouses = []
    for warehouse in warehouses:
        filtered_goods = [good for good in warehouse.get("GOODS", []) if good.get("QUANTITY", 0) > 0]
        if filtered_goods:
            filtered_warehouse = {
                "ID_WAREHOUSE": warehouse["ID_WAREHOUSE"],
                "GOODS": filtered_goods
            }
            filtered_warehouses.append(filtered_warehouse)
    return filtered_warehouses

def transform_to_products(warehouses):
    """Преобразует данные складов в массив товаров с количеством по порядковым номерам складов."""
    products = {}
    for warehouse_index, warehouse in enumerate(warehouses):
        warehouse_index_str = str(warehouse_index)
        for good in warehouse.get("GOODS", []):
            product_id = good["ID"]
            quantity = good["QUANTITY"]
            if product_id not in products:
                products[product_id] = {"ID": product_id, "QUANTITIES": {}}
            # Добавляем количество для текущего склада
            products[product_id]["QUANTITIES"][warehouse_index_str] = quantity
            # Диагностика: выводим, если товар встретился на новом складе
            if len(products[product_id]["QUANTITIES"]) > 1:
                print(f"Товар {product_id} найден на нескольких складах: {products[product_id]['QUANTITIES']}")
    return list(products.values())

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Загрузка с сервера
    total_pages = get_total_pages()
    print(f"Всего страниц: {total_pages}")

    all_warehouses = []
    for page in range(1, total_pages + 1):
        print(f"Загрузка страницы {page} из {total_pages}...")
        warehouses = fetch_quantity_data(page)
        all_warehouses.extend(warehouses)

    # Фильтруем нулевые остатки
    filtered_warehouses = filter_zero_quantities(all_warehouses)

    # Сохраняем промежуточный результат
    intermediate_result = {
        "WAREHOUSES": filtered_warehouses,
        "total_count": sum(len(w["GOODS"]) for w in filtered_warehouses),
        "date": "2025-04-05"
    }
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(intermediate_result, f, ensure_ascii=False, indent=2)
    print(f"Промежуточные данные сохранены в {OUTPUT_FILE}")

    # Преобразуем в массив товаров
    products = transform_to_products(filtered_warehouses)

    # Формируем итоговую структуру
    result = {
        "PRODUCTS": products,
        "total_count": len(products),
        "date": "2025-04-05"
    }

    # Сохраняем результат
    output_products_file = os.path.join(OUTPUT_DIR, "products_quantity.json")
    with open(output_products_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Обработано {len(filtered_warehouses)} складов. Сформировано {len(products)} товаров с остатками. Данные сохранены в {output_products_file}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Произошла ошибка: {e}")