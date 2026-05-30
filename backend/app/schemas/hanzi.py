from typing import Any

from pydantic import BaseModel, ConfigDict


class HanziRead(BaseModel):
    character: str
    pinyin: str
    hsk_level: int | None
    meaning_vi: str
    example_sentences: list[dict[str, Any]]
    ai_enriched: bool
    stroke_count: int | None = None
    topic: str | None = None
    radicals: list[str] = []
    etymology_vi: str | None = None
    audio_url: str | None = None
    stroke_svg: str | None = None

    model_config = ConfigDict(from_attributes=True)


class HanziSummary(BaseModel):
    character: str
    pinyin: str
    meaning_vi: str
    hsk_level: int | None = None
    topic: str | None = None
    stroke_count: int | None = None

    model_config = ConfigDict(from_attributes=True)
