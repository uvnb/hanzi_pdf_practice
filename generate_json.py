import json

output = {}
total_count = 0

for level in range(1, 6):
    filename = f"/home/quan/web/汉语-pdf-luyenviet/backend/seed/hsk{level}_chars.json"
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
            chars = []
            for item in data:
                chars.append(item.get("character"))
            output[f"HSK{level}"] = chars
            total_count += len(chars)
    except Exception as e:
        print(f"Error reading {filename}: {e}")

with open("/home/quan/web/汉语-pdf-luyenviet/hsk_all_characters.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Created hsk_all_characters.json with {total_count} characters.")
