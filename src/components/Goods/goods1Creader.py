import json
import os
from pathlib import Path
import math

def split_and_save_goods(goods, output_dir, items_per_file=3000):
    # Создаем директорию если её нет
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Вычисляем количество файлов
    total_items = len(goods)
    num_files = math.ceil(total_items / items_per_file)
    
    # Создаем индексный файл
    index_data = {
        "totalParts": num_files,
        "itemsPerPart": items_per_file,
        "totalItems": total_items
    }
    
    with open(output_dir / "index.json", 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    # Разбиваем и сохраняем товары по частям
    for i in range(num_files):
        start_idx = i * items_per_file
        end_idx = min((i + 1) * items_per_file, total_items)
        part_goods = goods[start_idx:end_idx]
        
        output_file = output_dir / f"goods_part_{i+1}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(part_goods, f, ensure_ascii=False, indent=2)
        
        print(f"Saved part {i+1} with {len(part_goods)} items to {output_file}")

def merge_goods_files():
    # Определяем пути
    script_dir = Path(__file__).parent
    input_dir = script_dir / "data1C"
    # Поднимаемся на три уровня вверх (src/components/Goods -> src/components -> src -> корень проекта)
    project_root = script_dir.parent.parent.parent
    output_dir = project_root / "public" / "data" / "1c_goods"

    # Инициализируем пустой список для всех товаров
    all_goods = []

    try:
        # Читаем все json файлы из входной директории
        for file_path in input_dir.glob("*.json"):
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    print(f"Processing file: {file_path.name}")
                    data = json.load(file)

                    # Если данные это список, добавляем их в общий список
                    if isinstance(data, list):
                        all_goods.extend(data)
                    # Если данные это словарь, добавляем его
                    elif isinstance(data, dict):
                        all_goods.append(data)

            except json.JSONDecodeError as e:
                print(f"Error reading {file_path.name}: {e}")
                continue
            except Exception as e:
                print(f"Unexpected error processing {file_path.name}: {e}")
                continue

        # Удаляем дубликаты по guid
        unique_goods = {item['guid']: item for item in all_goods}.values()

        # Разбиваем и сохраняем товары по частям
        split_and_save_goods(list(unique_goods), output_dir)
        print(f"Successfully processed {len(all_goods)} items")

    except Exception as e:
        print(f"Error during merge process: {e}")

if __name__ == "__main__":
    merge_goods_files()