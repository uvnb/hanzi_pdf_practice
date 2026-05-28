from typing import Any

from pydantic import BaseModel, Field


class EnrichBatchRequest(BaseModel):
    characters: list[str] = Field(min_length=1, max_length=20)
    force: bool = False


class EnrichedCharacter(BaseModel):
    character: str
    pinyin: str
    meaning_vi: str
    example_sentences: list[dict[str, Any]]
    ai_enriched: bool
