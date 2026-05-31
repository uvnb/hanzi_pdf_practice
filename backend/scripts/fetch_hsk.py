import asyncio
import argparse
import json
import httpx
from pathlib import Path

# Github repo containing HSK 1-6 vocabulary
HSK_URL = "https://raw.githubusercontent.com/clem109/hsk-vocabulary/master/hsk-vocab-json/hsk-level-{level}.json"
HANZI_DATA_URL = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/{char}.json"
SEED_DIR = Path(__file__).parent.parent / "seed"


async def fetch_hanzi_data(client: httpx.AsyncClient, char: str):
    try:
        resp = await client.get(HANZI_DATA_URL.format(char=char))
        if resp.status_code == 200:
            data = resp.json()
            return {
                "stroke_svg": resp.text,
                "stroke_count": len(data.get("strokes", []))
            }
        return {"stroke_svg": None, "stroke_count": None}
    except Exception as e:
        print(f"Failed to fetch hanzi data for {char}: {e}")
        return {"stroke_svg": None, "stroke_count": None}


async def fetch_hsk_level(level: int):
    print(f"Fetching HSK {level} vocabulary...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(HSK_URL.format(level=level))
        if resp.status_code != 200:
            print(f"Failed to fetch HSK {level} list")
            return
        
        words = resp.json()
        unique_chars = {}
        
        # Extract unique characters from the HSK words
        for word_entry in words:
            hanzi_word = word_entry.get("hanzi", "")
            pinyin = word_entry.get("pinyin", "")
            translations = word_entry.get("translations", [])
            vi_meaning = translations[0] if translations else "" # Rough fallback
            
            for char in hanzi_word:
                if char not in unique_chars and '\u4e00' <= char <= '\u9fff':
                    unique_chars[char] = {
                        "character": char,
                        "pinyin": pinyin if len(hanzi_word) == 1 else "", # Only exact if single char
                        "hsk_level": level,
                        "meaning_vi": vi_meaning if len(hanzi_word) == 1 else "",
                        "example_sentences": [],
                        "ai_enriched": False,
                        "topic": f"HSK {level}",
                        "radicals": [],
                        "etymology_vi": None,
                        "audio_url": None
                    }
        
        print(f"Found {len(unique_chars)} unique characters for HSK {level}. Fetching SVGs...")
        
        output_data = []
        for char, entry in unique_chars.items():
            hanzi_data = await fetch_hanzi_data(client, char)
            if hanzi_data["stroke_svg"]:
                entry["stroke_count"] = hanzi_data["stroke_count"]
                entry["stroke_svg"] = hanzi_data["stroke_svg"]
                output_data.append(entry)
                print(f"Processed: {char}")
            else:
                print(f"Skipped {char} - no SVG data found")
            
            # No delay

            
        output_file = SEED_DIR / f"hsk{level}_chars.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"Successfully saved {len(output_data)} characters to {output_file}")


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--levels", nargs="+", type=int, default=[2, 3], help="HSK levels to fetch (e.g. 2 3)")
    args = parser.parse_args()
    
    SEED_DIR.mkdir(exist_ok=True)
    
    for level in args.levels:
        await fetch_hsk_level(level)

if __name__ == "__main__":
    asyncio.run(main())
