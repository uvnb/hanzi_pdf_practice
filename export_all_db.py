import asyncio
import json
import os
from sqlalchemy import select
from backend.app.database import AsyncSessionLocal
from backend.app.models.hanzi import HanziCharacter

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(HanziCharacter).order_by(HanziCharacter.hsk_level, HanziCharacter.character)
        )
        all_chars = list(result.scalars())
    
    # Group by HSK level
    grouped = {}
    for char in all_chars:
        level_key = f"HSK{char.hsk_level}"
        if level_key not in grouped:
            grouped[level_key] = []
            
        char_dict = {
            "character": char.character,
            "pinyin": char.pinyin,
            "hsk_level": char.hsk_level,
            "meaning_vi": char.meaning_vi,
            "example_sentences": char.example_sentences,
            "ai_enriched": char.ai_enriched,
            "topic": char.topic,
            "radicals": char.radicals
        }
        grouped[level_key].append(char_dict)
        
    with open("database_export_all_levels.json", "w", encoding="utf-8") as f:
        json.dump(grouped, f, ensure_ascii=False, indent=2)
        
    print(f"Exported {len(all_chars)} characters to database_export_all_levels.json")

if __name__ == "__main__":
    asyncio.run(main())
