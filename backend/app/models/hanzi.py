import uuid
from typing import Any

from sqlalchemy import Boolean, JSON, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class HanziCharacter(Base):
    __tablename__ = "hanzi_characters"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    character: Mapped[str] = mapped_column(String(4), unique=True, index=True)
    pinyin: Mapped[str] = mapped_column(String(50))
    hsk_level: Mapped[int | None] = mapped_column(SmallInteger, nullable=True, index=True)
    meaning_vi: Mapped[str] = mapped_column(Text)
    example_sentences: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    ai_enriched: Mapped[bool] = mapped_column(Boolean, default=False)
