from typing import Any

from pydantic import BaseModel, ConfigDict


class HanziRead(BaseModel):
    character: str
    pinyin: str
    hsk_level: int | None
    meaning_vi: str
    example_sentences: list[dict[str, Any]]
    ai_enriched: bool

    model_config = ConfigDict(from_attributes=True)


class HanziSummary(BaseModel):
    character: str
    pinyin: str
    meaning_vi: str

    model_config = ConfigDict(from_attributes=True)
