import secrets

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_session
from app.models.hanzi import HanziCharacter
from app.schemas.ai import EnrichBatchRequest, EnrichedCharacter
from app.services.gemini_service import enrich_character

router = APIRouter(prefix="/api/ai", tags=["ai"])


def require_admin_key(x_admin_key: str | None = Header(default=None)) -> None:
    expected = get_settings().admin_api_key
    if not expected:
        raise HTTPException(status_code=503, detail="AI enrichment is not configured")
    if x_admin_key is None or not secrets.compare_digest(x_admin_key, expected):
        raise HTTPException(status_code=403, detail="Admin key required")


@router.post(
    "/enrich-batch",
    response_model=list[EnrichedCharacter],
    dependencies=[Depends(require_admin_key)],
)
async def enrich_batch(
    payload: EnrichBatchRequest,
    session: AsyncSession = Depends(get_session),
) -> list[HanziCharacter]:
    requested = list(dict.fromkeys(payload.characters))
    invalid = [character for character in requested if len(character) != 1]
    if invalid:
        raise HTTPException(status_code=422, detail="Each item must be one character")

    result = await session.scalars(
        select(HanziCharacter).where(HanziCharacter.character.in_(requested))
    )
    records = {record.character: record for record in result}
    missing = [character for character in requested if character not in records]
    if missing:
        raise HTTPException(
            status_code=404,
            detail=f"Character metadata not found: {', '.join(missing)}",
        )

    updated: list[HanziCharacter] = []
    for character in requested:
        record = records[character]
        if payload.force or not record.ai_enriched:
            try:
                enrichment = await enrich_character(character)
            except RuntimeError as error:
                raise HTTPException(status_code=503, detail=str(error)) from None
            record.pinyin = enrichment.pinyin
            record.meaning_vi = enrichment.meaning_vi
            record.example_sentences = [
                example.model_dump() for example in enrichment.example_sentences
            ]
            record.ai_enriched = True
        updated.append(record)

    await session.commit()
    return updated
