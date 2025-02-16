import os
import json
from collections import defaultdict

def merge_json_files(source_dir, output_dir):
    # Создаем выходную директорию, если она не существует
    os.makedirs(output_dir, exist_ok=True)

    merged_data = []
    guid_set = set()

    # Проходим по всем файлам в исходной директории
    for filename in os.listdir(source_dir):
        if filename.endswith('.json'):
            file_path = os.path.join(source_dir, filename)

            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

                # Проверяем каждый элемент на уникальность GUID
                for item in data:
                    guid = item.get('guid')
                    if guid and guid not in guid_set:
                        guid_set.add(guid)
                        merged_data.append(item)
                    elif guid:
                        print(f"Дубликат GUID найден и пропущен: {guid}")

    # Записываем объединенные данные в выходной файл
    output_file = os.path.join(output_dir, 'merged_output.json')
    with open(output_file, 'w', encoding='utf-8') as outfile:
        json.dump(merged_data, outfile, ensure_ascii=False, indent=2)

    print(f"Объединение завершено. Результат сохранен в {output_file}")

# Укажите пути к исходной и выходной директориям
source_directory = 'source'
output_directory = 'output'

# Запускаем функцию
merge_json_files(source_directory, output_directory)
