import json

def merge_warehouse_data(incomplete_file, complete_file, output_file):
    # Загрузка данных из файлов
    with open(incomplete_file, 'r', encoding='utf-8') as f:
        incomplete_data = json.load(f)

    with open(complete_file, 'r', encoding='utf-8') as f:
        complete_data = json.load(f)

    # Создание словаря для полных данных, где ключ - guid
    complete_dict = {item['guid']: item for item in complete_data}

    # Список полей, которые нужно добавить
    fields_to_add = [
        'prepayment',
        'card_payment',
        'cash_payment',
        'transfer_delivery',
        'pickup',
        'contacts',
        'working_mode'
    ]

    # Обновление неполных данных
    for warehouse in incomplete_data:
        guid = warehouse['guid']
        if guid in complete_dict:
            # Добавление всех требуемых полей из полного списка
            for field in fields_to_add:
                if field in complete_dict[guid]:
                    warehouse[field] = complete_dict[guid][field]
                else:
                    # Если поле не найдено в полных данных, добавляем значение по умолчанию
                    if field in ['contacts', 'working_mode']:
                        warehouse[field] = []
                    else:
                        warehouse[field] = False
        else:
            # Если запись не найдена в полном списке, добавляем поля со значениями по умолчанию
            for field in fields_to_add:
                if field in ['contacts', 'working_mode']:
                    warehouse[field] = []
                else:
                    warehouse[field] = False

    # Сохранение результата
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(incomplete_data, f, ensure_ascii=False, indent=2)

    return len(incomplete_data)

# Пример использования
if __name__ == "__main__":
    incomplete_file = "data_1C.json"
    complete_file = "data_1c_test.json"
    output_file = "warehouses.json"

    count = merge_warehouse_data(incomplete_file, complete_file, output_file)
    print(f"Обновлено {count} записей. Результат сохранен в {output_file}")