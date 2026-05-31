import asyncio
import json
import os
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.hanzi import HanziCharacter

async def main():
    seed_dir = "seed"
    if not os.path.exists(seed_dir):
        print(f"Seed directory {seed_dir} not found.")
        return

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(HanziCharacter).order_by(HanziCharacter.hsk_level, HanziCharacter.character))
        all_chars = list(result.scalars())
    
    print(f"Found {len(all_chars)} characters in database.")
    
    # Group by HSK level
    grouped = {}
    for char in all_chars:
        level = char.hsk_level
        if level not in grouped:
            grouped[level] = []
            
        char_dict = {
            "character": char.character,
            "pinyin": char.pinyin,
            "hsk_level": char.hsk_level,
            "meaning_vi": char.meaning_vi,
            "example_sentences": char.example_sentences,
            "ai_enriched": char.ai_enriched,
            "topic": f"HSK {char.hsk_level}",
            "radicals": char.radicals,
            "etymology_vi": char.etymology_vi,
            "audio_url": char.audio_url,
            "stroke_count": char.stroke_count,
            "stroke_svg": char.stroke_svg
        }
        grouped[level].append(char_dict)
        
    for level, chars in grouped.items():
        file_path = os.path.join(seed_dir, f"hsk{level}_chars.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(chars, f, ensure_ascii=False, indent=2)
        print(f"Wrote {len(chars)} characters to {file_path}")

if __name__ == "__main__":
    asyncio.run(main())
