import asyncio
from app.database import AsyncSessionLocal
from app.models.hanzi import HanziCharacter
from sqlalchemy import select

async def count():
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(HanziCharacter).where(HanziCharacter.ai_enriched == True))
        chars = list(res.scalars())
        print(f"Total AI Enriched: {len(chars)}")
        
        res_not = await session.execute(select(HanziCharacter).where(HanziCharacter.ai_enriched == False))
        chars_not = list(res_not.scalars())
        print(f"Total NOT AI Enriched: {len(chars_not)}")

if __name__ == "__main__":
    asyncio.run(count())
