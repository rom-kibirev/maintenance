import json
import requests
import base64

# Настройки API
API_URL = 'https://runtec-shop.ru/api/v1/Catalog:ImportStores'
LOGIN = 'api'
PASSWORD = 'c200ta4wqm5l4sHWVILzr995qRBMPMia'

def send_warehouses_data(json_file_path):
    # Чтение данных из JSON файла
    try:
        with open(json_file_path, 'r', encoding='utf-8') as file:
            warehouses_data = json.load(file)
    except Exception as e:
        print(f"Ошибка при чтении файла: {e}")
        return False

    # Формирование заголовка авторизации
    auth_str = f"{LOGIN}:{PASSWORD}"
    auth_bytes = auth_str.encode('ascii')
    base64_bytes = base64.b64encode(auth_bytes)
    base64_auth = base64_bytes.decode('ascii')

    # Отправка запроса
    try:
        response = requests.post(
            API_URL,
            json=warehouses_data,
            headers={
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': f'Basic {base64_auth}'
            }
        )

        # Проверка ответа
        if response.status_code == 200:
            print("Данные успешно отправлены!")
            print("Ответ сервера:", response.json())
            return True
        else:
            print(f"Ошибка при отправке данных. Код: {response.status_code}")
            print("Ответ сервера:", response.text)
            return False

    except Exception as e:
        print(f"Ошибка при выполнении запроса: {e}")
        return False

if __name__ == "__main__":
    # Путь к JSON файлу с данными складов
    json_file_path = "warehouses.json"

    # Отправка данных
    result = send_warehouses_data(json_file_path)

    if result:
        print("Операция завершена успешно!")
    else:
        print("Во время выполнения операции возникли ошибки.")