import asyncio
import argparse
import json
from pathlib import Path

from sqlalchemy import select

from app.database import AsyncSessionLocal, create_tables
from app.models.hanzi import HanziCharacter

SEED_PATH = Path(__file__).parent.parent / "seed" / "hsk1_starter.json"


async def seed(refresh: bool = False) -> None:
    await create_tables()
    records = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    inserted = 0
    updated = 0
    async with AsyncSessionLocal() as session:
        for record in records:
            existing = await session.scalar(
                select(HanziCharacter).where(
                    HanziCharacter.character == record["character"]
                )
            )
            if existing and refresh:
                for field, value in record.items():
                    setattr(existing, field, value)
                updated += 1
            elif existing is None:
                session.add(HanziCharacter(**record))
                inserted += 1
        await session.commit()
    print(f"Seed complete: {inserted} inserted, {updated} refreshed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Overwrite existing starter records. Do not use after AI enrichment in production.",
    )
    arguments = parser.parse_args()
    asyncio.run(seed(refresh=arguments.refresh))
