from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401
from app.config import get_settings
from app.database import create_tables
from app.routers.ai import router as ai_router
from app.routers.auth import router as auth_router
from app.routers.hanzi import router as hanzi_router
from app.routers.practice import router as practice_router
from app.routers.users import router as users_router

settings = get_settings()


from sqlalchemy import select
from app.database import create_tables, AsyncSessionLocal
from app.models.hanzi import HanziCharacter

@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.auto_create_tables:
        await create_tables()
        
        # Auto-seed if database is practically empty
        try:
            async with AsyncSessionLocal() as session:
                count = await session.scalar(select(HanziCharacter).limit(1))
                if not count:
                    from scripts.seed_hsk import seed
                    print("Auto-seeding database from JSON files...")
                    await seed()
        except Exception as e:
            print(f"Auto-seed failed: {e}")
            
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(hanzi_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(ai_router)
app.include_router(practice_router)


@app.get("/api/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", tags=["system"])
async def root_health() -> dict[str, str]:
    return {"status": "ok"}
