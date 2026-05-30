import asyncio
import os
from sqlalchemy import select

from app.database import AsyncSessionLocal, create_tables
from app.models.hanzi import HanziCharacter
from app.services.gemini_service import enrich_character

async def main():
    await create_tables()
    
    async with AsyncSessionLocal() as session:
        # Find characters that don't have etymology yet
        result = await session.scalars(
            select(HanziCharacter).where(HanziCharacter.etymology_vi.is_(None))
        )
        characters = list(result)
        
        if not characters:
            print("No characters to enrich.")
            return

        print(f"Found {len(characters)} characters to enrich.")
        
        for char_obj in characters:
            print(f"Enriching '{char_obj.character}'...")
            try:
                metadata = await enrich_character(char_obj.character)
                
                # Update the character
                char_obj.pinyin = metadata.pinyin
                char_obj.meaning_vi = metadata.meaning_vi
                char_obj.example_sentences = [
                    {"hanzi": ex.hanzi, "pinyin": ex.pinyin, "vi": ex.vi}
                    for ex in metadata.example_sentences
                ]
                char_obj.radicals = metadata.radicals
                char_obj.etymology_vi = metadata.etymology_vi
                char_obj.ai_enriched = True
                
                await session.commit()
                print(f"  -> Successfully enriched {char_obj.character}")
                
                # Sleep a bit to avoid rate limits
                await asyncio.sleep(2)
            except Exception as e:
                print(f"  -> Error enriching {char_obj.character}: {e}")
                await session.rollback()

if __name__ == "__main__":
    asyncio.run(main())
