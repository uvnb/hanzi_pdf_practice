import asyncio
import argparse
import json
from pathlib import Path

from sqlalchemy import select

from app.database import AsyncSessionLocal, create_tables
from app.models.hanzi import HanziCharacter

SEED_DIR = Path(__file__).parent.parent / "seed"


async def seed(refresh: bool = False, level: int = None) -> None:
    await create_tables()
    
    files_to_process = []
    if level:
        files_to_process = list(SEED_DIR.glob(f"hsk{level}_*.json"))
    else:
        files_to_process = list(SEED_DIR.glob("hsk*.json"))
        
    if not files_to_process:
        print(f"No seed files found in {SEED_DIR}")
        return

    async with AsyncSessionLocal() as session:
        for seed_file in files_to_process:
            print(f"Processing {seed_file.name}...")
            records = json.loads(seed_file.read_text(encoding="utf-8"))
            inserted = 0
            updated = 0
            for record in records:
                existing = await session.scalar(
                    select(HanziCharacter).where(
                        HanziCharacter.character == record["character"]
                    )
                )
                if existing and refresh:
                    for field, value in record.items():
                        if field in ["ai_enriched", "example_sentences"] and existing.ai_enriched:
                            continue
                        setattr(existing, field, value)
                    updated += 1
                elif existing is None:
                    session.add(HanziCharacter(**record))
                    inserted += 1
            await session.commit()
            print(f"  -> {inserted} inserted, {updated} refreshed.")
    
    # Dispose the engine to close connection pools and prevent hanging
    from app.database import engine
    await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Overwrite existing records with seed data.",
    )
    parser.add_argument(
        "--level",
        type=int,
        help="Specific HSK level to seed (e.g. 2). If omitted, seeds all HSK files.",
    )
    arguments = parser.parse_args()
    asyncio.run(seed(refresh=arguments.refresh, level=arguments.level))
