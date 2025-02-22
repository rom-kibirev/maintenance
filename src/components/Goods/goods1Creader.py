import json
import os
from pathlib import Path

def merge_goods_files():
    # Define paths based on actual structure
    script_dir = Path(__file__).parent
    input_dir = script_dir / "data1C"
    output_dir = script_dir / "goods"
    output_file = output_dir / "goods.json"

    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)

    # Initialize empty list to store all goods
    all_goods = []

    try:
        # Read all json files in the input directory
        for file_path in input_dir.glob("*.json"):
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    print(f"Processing file: {file_path.name}")
                    data = json.load(file)

                    # If data is a list, extend all_goods
                    if isinstance(data, list):
                        all_goods.extend(data)
                    # If data is a dictionary, append it
                    elif isinstance(data, dict):
                        all_goods.append(data)

            except json.JSONDecodeError as e:
                print(f"Error reading {file_path.name}: {e}")
                continue
            except Exception as e:
                print(f"Unexpected error processing {file_path.name}: {e}")
                continue

        # Write merged data to output file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_goods, f, ensure_ascii=False, indent=2)

        print(f"Successfully merged {len(all_goods)} items into {output_file}")

    except Exception as e:
        print(f"Error during merge process: {e}")

if __name__ == "__main__":
    merge_goods_files()