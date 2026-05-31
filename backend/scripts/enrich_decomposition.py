import json
import re
import urllib.request
from pathlib import Path

SEED_DIR = Path(__file__).parent.parent / "seed"
DICT_URL = "https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt"
DICT_PATH = SEED_DIR / "makemeahanzi_dict.txt"

# Ideographic Description Characters to strip from decomposition
IDCS = list("⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻？")

def download_dictionary():
    if not DICT_PATH.exists():
        print(f"Downloading {DICT_URL}...")
        urllib.request.urlretrieve(DICT_URL, DICT_PATH)
        print("Download complete.")

def load_dictionary():
    dict_data = {}
    with open(DICT_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            entry = json.loads(line)
            dict_data[entry["character"]] = entry
    return dict_data

def enrich_seed_files():
    dict_data = load_dictionary()
    
    seed_files = list(SEED_DIR.glob("hsk*_chars.json"))
    for file_path in seed_files:
        print(f"Processing {file_path.name}...")
        with open(file_path, "r", encoding="utf-8") as f:
            chars = json.load(f)
            
        updated = 0
        for char_entry in chars:
            char = char_entry["character"]
            if char in dict_data:
                entry = dict_data[char]
                
                # Extract radicals from decomposition
                decomp = entry.get("decomposition", "")
                if decomp and decomp != "？":
                    # Remove IDCs
                    radicals_str = decomp
                    for idc in IDCS:
                        radicals_str = radicals_str.replace(idc, "")
                    
                    if radicals_str:
                        # Make unique but preserve order
                        rads = []
                        for r in radicals_str:
                            if r not in rads:
                                rads.append(r)
                        char_entry["radicals"] = rads
                
                # Extract etymology
                etymology = entry.get("etymology")
                if etymology and isinstance(etymology, dict):
                    hint = etymology.get("hint")
                    if hint:
                        # For now, store English hint, AI will translate later
                        char_entry["etymology_vi"] = hint
                
                updated += 1
                
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(chars, f, ensure_ascii=False, indent=2)
        print(f"Updated {updated} characters in {file_path.name}")

if __name__ == "__main__":
    download_dictionary()
    enrich_seed_files()
