from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.hanzi import HanziCharacter
from app.schemas.hanzi import HanziRead, HanziSummary

router = APIRouter(prefix="/api/hanzi", tags=["hanzi"])


@router.get("/batch", response_model=list[HanziSummary])
async def get_characters_batch(
    characters: str = Query(min_length=1, max_length=400),
    session: AsyncSession = Depends(get_session),
) -> list[HanziCharacter]:
    requested = list(dict.fromkeys(characters.replace(",", "").replace(" ", "")))
    if len(requested) > 100:
        raise HTTPException(status_code=422, detail="A batch accepts at most 100 characters")

    result = await session.scalars(
        select(HanziCharacter).where(HanziCharacter.character.in_(requested))
    )
    records = {entry.character: entry for entry in result}
    return [records[character] for character in requested if character in records]


@router.get("/hsk/{level}", response_model=list[HanziSummary])
async def list_hsk_characters(
    level: int, session: AsyncSession = Depends(get_session)
) -> list[HanziCharacter]:
    if level not in range(1, 8):
        raise HTTPException(status_code=422, detail="HSK level must be between 1 and 7")

    result = await session.scalars(
        select(HanziCharacter)
        .where(HanziCharacter.hsk_level == level)
        .order_by(HanziCharacter.character)
    )
    return list(result)


@router.get("/{character}", response_model=HanziRead)
async def get_character(
    character: str, session: AsyncSession = Depends(get_session)
) -> HanziCharacter:
    if len(character) == 0 or len(character) > 4:
        raise HTTPException(status_code=422, detail="Invalid character")

    result = await session.scalar(
        select(HanziCharacter).where(HanziCharacter.character == character)
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return result
