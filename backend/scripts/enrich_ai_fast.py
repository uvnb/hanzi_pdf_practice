import asyncio
from sqlalchemy import select

from app.database import AsyncSessionLocal, create_tables
from app.models.hanzi import HanziCharacter
from app.services.gemini_service import enrich_characters_batch

def get_api_keys() -> list[str]:
    import os

    keys = [
        key.strip()
        for key in os.getenv("GEMINI_API_KEYS", "").split(",")
        if key.strip()
    ]
    if not keys:
        raise RuntimeError("Set GEMINI_API_KEYS to one or more comma-separated keys")
    return keys

async def worker(worker_id: int, api_key: str, queue: asyncio.Queue):
    async with AsyncSessionLocal() as session:
        while True:
            try:
                batch = queue.get_nowait()
            except asyncio.QueueEmpty:
                break

            char_strings = [c.character for c in batch]
            print(f"[Worker {worker_id}] Enriching batch: {char_strings}...")

            try:
                metadata_list = await enrich_characters_batch(char_strings, api_key=api_key)
                meta_dict = {m.hanzi: m for m in metadata_list}

                success_count = 0
                for char_obj in batch:
                    # fetch character locally to bind to session
                    db_char = await session.scalar(select(HanziCharacter).where(HanziCharacter.character == char_obj.character))

                    metadata = meta_dict.get(char_obj.character)
                    if metadata and db_char:
                        db_char.pinyin = metadata.pinyin
                        db_char.meaning_vi = metadata.meaning_vi
                        db_char.example_sentences = [
                            {"hanzi": ex.hanzi, "pinyin": ex.pinyin, "vi": ex.vi}
                            for ex in metadata.example_sentences
                        ]
                        db_char.radicals = metadata.radicals
                        db_char.etymology_vi = metadata.etymology_vi
                        db_char.ai_enriched = True
                        success_count += 1
                    else:
                        print(f"[Worker {worker_id}] Gemini missed {char_obj.character}")

                await session.commit()
                print(f"[Worker {worker_id}] Successfully enriched {success_count} characters in batch")

                queue.task_done()

            except Exception as e:
                print(f"[Worker {worker_id}] Error enriching batch: {e}")
                await session.rollback()
                # Put back to queue to retry
                await queue.put(batch)
                print(f"[Worker {worker_id}] Retrying batch in 5 seconds...")
                await asyncio.sleep(5)


async def main():
    await create_tables()

    async with AsyncSessionLocal() as session:
        result = await session.scalars(
            select(HanziCharacter).where(HanziCharacter.ai_enriched == False)
        )
        characters = list(result)

    if not characters:
        print("No characters to enrich.")
        return

    print(f"Found {len(characters)} characters to enrich.")

    queue = asyncio.Queue()
    batch_size = 10

    for i in range(0, len(characters), batch_size):
        batch = characters[i:i + batch_size]
        queue.put_nowait(batch)

    api_keys = get_api_keys()
    print(f"Created {queue.qsize()} batches. Spawning {len(api_keys)} workers...")

    workers = []
    for i, key in enumerate(api_keys):
        workers.append(asyncio.create_task(worker(i, key, queue)))

    await asyncio.gather(*workers)
    print("All batches processed!")

if __name__ == "__main__":
    asyncio.run(main())
