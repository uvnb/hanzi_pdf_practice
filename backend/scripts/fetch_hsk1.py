import asyncio
import json
import httpx
from pathlib import Path

# The official HSK1 word list (150 words) from a known source
HSK1_URL = "https://raw.githubusercontent.com/clem109/hsk-vocabulary/master/hsk-level-1.json"
HANZI_DATA_URL = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/{char}.json"
OUTPUT_FILE = Path(__file__).parent.parent / "seed" / "hsk1_starter.json"

async def fetch_hanzi_data(client: httpx.AsyncClient, char: str):
    """Fetch stroke data from hanzi-writer."""
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

async def main():
    print("Enriching existing HSK 1 vocabulary...")
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        words = json.load(f)

    async with httpx.AsyncClient(timeout=30.0) as client:
        output_data = []
        for word_entry in words:
            char = word_entry.get("character")
            hanzi_data = await fetch_hanzi_data(client, char)
            word_entry["stroke_count"] = hanzi_data["stroke_count"]
            word_entry["stroke_svg"] = hanzi_data["stroke_svg"]
            word_entry["topic"] = "Starter"
            word_entry["radicals"] = []
            word_entry["etymology_vi"] = None
            word_entry["audio_url"] = None
            output_data.append(word_entry)
            print(f"Processed: {char}")

        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"Successfully saved {len(output_data)} unique characters to {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
