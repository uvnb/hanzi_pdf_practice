import asyncio
from app.database import AsyncSessionLocal
from app.routers.practice import get_leaderboard

async def main():
    async with AsyncSessionLocal() as session:
        try:
            res = await get_leaderboard(session)
            print(res)
        except Exception as e:
            print(f"Error: {e}")

asyncio.run(main())
