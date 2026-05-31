import asyncio
import os
from sqlalchemy import select

from app.database import AsyncSessionLocal, create_tables
from app.models.hanzi import HanziCharacter
from app.services.gemini_service import enrich_characters_batch


def get_api_keys() -> list[str]:
    keys = [
        key.strip()
        for key in os.getenv("GEMINI_API_KEYS", "").split(",")
        if key.strip()
    ]
    if not keys:
        raise RuntimeError("Set GEMINI_API_KEYS to one or more comma-separated keys")
    return keys

async def main():
    await create_tables()

    api_keys = get_api_keys()
    key_idx = 0

    async with AsyncSessionLocal() as session:
        result = await session.scalars(
            select(HanziCharacter).where(HanziCharacter.ai_enriched == False)
        )
        characters = list(result)

        if not characters:
            print("No characters to enrich.")
            return

        print(f"Found {len(characters)} characters to enrich.")

        batch_size = 10
        i = 0
        while i < len(characters):
            batch = characters[i:i + batch_size]
            char_strings = [c.character for c in batch]
            print(f"Enriching batch {i//batch_size + 1}/{len(characters)//batch_size + 1}: {char_strings}...")

            try:
                metadata_list = await enrich_characters_batch(
                    char_strings,
                    api_key=api_keys[key_idx],
                )
                meta_dict = {m.hanzi: m for m in metadata_list}

                success_count = 0
                for char_obj in batch:
                    metadata = meta_dict.get(char_obj.character)
                    if metadata:
                        char_obj.pinyin = metadata.pinyin
                        char_obj.meaning_vi = metadata.meaning_vi
                        char_obj.example_sentences = [
                            {"hanzi": ex.hanzi, "pinyin": ex.pinyin, "vi": ex.vi}
                            for ex in metadata.example_sentences
                        ]
                        char_obj.radicals = metadata.radicals
                        char_obj.etymology_vi = metadata.etymology_vi
                        char_obj.ai_enriched = True
                        success_count += 1
                    else:
                        print(f"  -> Gemini missed {char_obj.character}")

                await session.commit()
                print(f"  -> Successfully enriched {success_count} characters in batch")

                i += batch_size # Move to next batch ONLY if success
                await asyncio.sleep(2) # Small sleep since we have many keys

            except Exception as e:
                print(f"  -> Error enriching batch: {e}")
                await session.rollback()

                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    print("Rate limit hit, switching API key...")
                    key_idx = (key_idx + 1) % len(api_keys)

                print("Retrying batch in 5 seconds...")
                await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())
