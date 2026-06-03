import json
import csv
import os

# 1. Load standard HSK 3.0 levels from hsk30-chars.csv
hsk_levels = {}
with open("/tmp/hsk30/hsk30-chars.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        level = row["Level"]
        if level in ["1", "2", "3", "4", "5"]:
            hsk_levels[row["Hanzi"]] = int(level)

# 2. Gather existing data from backend/seed/hsk*_chars.json
existing_data = {}
for i in range(1, 7):
    filepath = f"backend/seed/hsk{i}_chars.json"
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                for item in data:
                    char = item.get("character")
                    if char:
                        existing_data[char] = item
            except:
                pass

# 3. Gather fallback data from makemeahanzi/dictionary.txt
makeme_data = {}
with open("/tmp/makemeahanzi/dictionary.txt", "r", encoding="utf-8") as f:
    for line in f:
        try:
            entry = json.loads(line)
            char = entry.get("character")
            if char:
                makeme_data[char] = {
                    "pinyin": ", ".join(entry.get("pinyin", [])),
                    "meaning_vi": entry.get("definition", ""),
                    "radical": entry.get("radical", "")
                }
        except:
            pass

# 4. Build the final json
final_data = []
# Create it as a dictionary organized by level or just a flat list?
# "tạo cho tôi file json in ra toàn bộ hơn 1700 chữ có trong data, phân loại theo cấp độ HSK"
# Let's create an object: {"HSK1": [ { ... } ], "HSK2": [ ... ] }
final_dict = {f"HSK{i}": [] for i in range(1, 6)}

for char, level in hsk_levels.items():
    if char in existing_data:
        entry = existing_data[char]
        entry["hsk_level"] = level
        entry["topic"] = f"HSK {level}"
        final_dict[f"HSK{level}"].append(entry)
    else:
        # Create a new entry
        fallback = makeme_data.get(char, {})
        entry = {
            "character": char,
            "pinyin": fallback.get("pinyin", ""),
            "hsk_level": level,
            "meaning_vi": fallback.get("meaning_vi", ""),
            "example_sentences": [],
            "ai_enriched": False,
            "topic": f"HSK {level}",
            "radical": fallback.get("radical", "")
        }
        final_dict[f"HSK{level}"].append(entry)

with open("hsk_all_characters_perfect.json", "w", encoding="utf-8") as f:
    json.dump(final_dict, f, ensure_ascii=False, indent=2)

print("Done. Created hsk_all_characters_perfect.json")
for k, v in final_dict.items():
    print(f"{k}: {len(v)}")
