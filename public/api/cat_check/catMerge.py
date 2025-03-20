import os
import json
from collections import defaultdict

def merge_json_files(source_dir, output_dir):
    # Создаем выходную директорию, если она не существует
    os.makedirs(output_dir, exist_ok=True)

    merged_data = []
    guid_set = set()

    print(f"Создание выходной директории: {output_dir}")
    
    # Проходим по всем файлам в исходной директории
    for filename in os.listdir(source_dir):
        print(f"Обработка файла: {filename}")
        if filename.endswith('.json'):
            file_path = os.path.join(source_dir, filename)
            print(f"Чтение файла: {file_path}")

            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                print(f"Загружены данные из {filename}: {data}")

                # Проверяем каждый элемент на уникальность GUID
                for item in data:
                    guid = item.get('guid')
                    if guid and guid not in guid_set:
                        guid_set.add(guid)
                        merged_data.append(item)
                    elif guid:
                        print(f"Дубликат GUID найден и пропущен: {guid}")
                    else:
                        print(f"Элемент без GUID пропущен: {item}")

    # Записываем объединенные данные в выходной файл
    output_file = os.path.join(output_dir, 'merged_output.json')
    with open(output_file, 'w', encoding='utf-8') as outfile:
        json.dump(merged_data, outfile, ensure_ascii=False, indent=2)

    print(f"Запись объединенных данных в файл: {output_file}")

# Укажите пути к исходной и выходной директориям
source_directory = 'E:\develope\Runtec\maintenance\public\data\categories 1C'
output_directory = 'E:\develope\Runtec\maintenance\public\data\categories 1C'

# Запускаем функцию
merge_json_files(source_directory, output_directory)
