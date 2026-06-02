import json
import asyncio
from pathlib import Path
import pinyin
from deep_translator import GoogleTranslator
import time

SEED_DIR = Path(__file__).parent.parent / "seed"

async def process_file(filepath):
    print(f"Processing {filepath.name}...")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    en_vi_translator = GoogleTranslator(source='en', target='vi')
    zh_vi_translator = GoogleTranslator(source='zh-CN', target='vi')
    
    modified = False
    
    for i, entry in enumerate(data):
        char = entry.get("character", "")
        
        # Fix pinyin
        current_pinyin = entry.get("pinyin", "")
        if not current_pinyin:
            new_pinyin = pinyin.get(char)
            entry["pinyin"] = new_pinyin
            modified = True
            print(f"[{char}] Added pinyin: {new_pinyin}")
            
        # Fix meaning
        current_meaning = entry.get("meaning_vi", "")
        if not current_meaning:
            try:
                new_meaning = zh_vi_translator.translate(char)
                entry["meaning_vi"] = new_meaning.lower() if new_meaning else ""
                modified = True
                print(f"[{char}] Translated char -> VI: {new_meaning}")
            except Exception as e:
                print(f"Error translating {char}: {e}")
        else:
            # We assume it's English if it came from the fetch script
            # To avoid re-translating starter files that might already be VI
            # Let's check if it contains Vietnamese specific characters
            vi_chars = set("áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ")
            if not any(c in current_meaning.lower() for c in vi_chars) and filepath.name != "hsk1_starter.json":
                try:
                    new_meaning = en_vi_translator.translate(current_meaning)
                    entry["meaning_vi"] = new_meaning.lower() if new_meaning else current_meaning
                    modified = True
                    print(f"[{char}] Translated EN -> VI: '{current_meaning}' -> '{new_meaning}'")
                except Exception as e:
                    print(f"Error translating '{current_meaning}': {e}")
            elif filepath.name != "hsk1_starter.json" and "classifier" in current_meaning.lower():
                try:
                    new_meaning = en_vi_translator.translate(current_meaning)
                    entry["meaning_vi"] = new_meaning.lower() if new_meaning else current_meaning
                    modified = True
                    print(f"[{char}] Translated EN -> VI: '{current_meaning}' -> '{new_meaning}'")
                except Exception as e:
                    print(f"Error translating '{current_meaning}': {e}")
                    
        # Sleep slightly to avoid rate limit
        time.sleep(0.05)

    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved changes to {filepath.name}")
    else:
        print(f"No changes needed for {filepath.name}")

async def main():
    for filename in ["hsk1_chars.json", "hsk2_chars.json", "hsk3_chars.json", "hsk4_chars.json", "hsk5_chars.json", "hsk1_starter.json"]:
        filepath = SEED_DIR / filename
        if filepath.exists():
            await process_file(filepath)

if __name__ == "__main__":
    asyncio.run(main())
