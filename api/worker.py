# worker.py

import os
import json
import time
import requests
import logging
from config import API_URL, CATEGORY_ENDPOINT, GOODS_ENDPOINT, MAX_ITEMS_PER_REQUEST, TEMP_DIR

logging.basicConfig(level=logging.DEBUG)

def split_data(data, prefix):
    """Разделяет данные на пакеты и сохраняет во временные файлы."""
    os.makedirs(TEMP_DIR, exist_ok=True)
    chunks = [data[i:i + MAX_ITEMS_PER_REQUEST] for i in range(0, len(data), MAX_ITEMS_PER_REQUEST)]

    for i, chunk in enumerate(chunks):
        file_name = f"{TEMP_DIR}/{i + 1}_{prefix}.json"
        with open(file_name, "w") as f:
            json.dump(chunk, f)
        logging.debug(f"Сохранён файл: {file_name}, данных: {len(chunk)}")

def get_temp_files():
    """Возвращает список временных файлов."""
    return [os.path.join(TEMP_DIR, f) for f in os.listdir(TEMP_DIR) if f.endswith(".json")]

def send_request(file_path, token, data_type):
    """Отправляет данные из файла на сервер API."""
    import logging

    # Определяем конечный URL
    endpoint = CATEGORY_ENDPOINT if data_type == "category" else GOODS_ENDPOINT
    url = f"https://runtec-shop.ru/api/v2/{endpoint}"

    # Читаем данные из файла
    with open(file_path, "r") as f:
        data = json.load(f)

    headers = {
        "Authorization": token,  # Токен Bearer
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    # Делаем PATCH-запрос
    logging.info(f"Отправляем данные из файла: {file_path} на {url}")
    response = requests.patch(url, headers=headers, json={"data": data})

    # Логируем результат
    if response.status_code == 200:
        logging.info(f"Успешно отправлено: {file_path}")
    else:
        logging.error(f"Ошибка {response.status_code}: {response.text}")

    return response

def process_files(token, data_type):
    """Обрабатывает файлы последовательно и отправляет их на API."""
    temp_files = get_temp_files()
    logging.info(f"Начинаем обработку {len(temp_files)} файлов")

    for file_path in temp_files:
        response = send_request(file_path, token, data_type)

        if response.status_code == 200:
            logging.info(f"Успешно отправлено: {file_path}")
            os.remove(file_path)  # Удаляем файл после успешной отправки
        elif response.status_code == 401:
            logging.error(f"Ошибка авторизации. Ждём новый токен.")
            return "pause"
        elif response.status_code == 500:
            logging.error(f"Серверная ошибка. Ожидание 1 мин...")
            time.sleep(60)
        else:
            logging.error(f"Ошибка {response.status_code}: {response.text}")
            return f"error: {response.status_code}"
    logging.info("Обработка завершена")
    return "done"