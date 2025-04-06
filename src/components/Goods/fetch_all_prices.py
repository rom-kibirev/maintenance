import requests
import json
import os

def fetch_all_prices(token, output_dir=r"E:\develope\Runtec\maintenance\public\data\api_v2\prices_data"):
    url = "https://runtec-shop.ru/api/v2/goods/prices?type=short"
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {token}"
    }

    # Создаем директорию для сохранения данных, если ее нет
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Получаем первую страницу, чтобы узнать общее количество страниц
    response = requests.get(f"{url}&page=1&limit=1000", headers=headers)
    if response.status_code != 200:
        print(f"Ошибка при запросе: {response.status_code}")
        return

    initial_data = response.json()
    total_pages = initial_data.get("total_pages", 1)
    all_prices = []

    print(f"Всего страниц: {total_pages}")

    # Загружаем все страницы
    for page in range(1, total_pages + 1):
        print(f"Загрузка страницы {page} из {total_pages}")
        response = requests.get(f"{url}&page={page}&limit=1000", headers=headers)

        if response.status_code == 200:
            data = response.json()
            prices = data.get("data", [])
            all_prices.extend(prices)
        else:
            print(f"Ошибка на странице {page}: {response.status_code}")

    # Сохраняем все данные в один файл
    output_file = os.path.join(output_dir, "all_prices.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_prices, f, ensure_ascii=False, indent=2)

    print(f"Загружено {len(all_prices)} цен. Данные сохранены в {output_file}")

if __name__ == "__main__":
    # Замените на ваш токен
    TOKEN = "7f5d82a3ab623cfda1adb452a6cefb9c3ee0d1c700cbe23e5927f2254b04f4fafcbf9af62bbc09bc"
    fetch_all_prices(TOKEN)