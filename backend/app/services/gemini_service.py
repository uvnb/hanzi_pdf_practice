from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from app.config import get_settings


class GeneratedExample(BaseModel):
    hanzi: str
    pinyin: str
    vi: str


class GeneratedMetadata(BaseModel):
    pinyin: str = Field(description="Pinyin with tone marks")
    meaning_vi: str = Field(description="Concise Vietnamese meaning and Sino-Vietnamese note")
    example_sentences: list[GeneratedExample] = Field(min_length=2, max_length=3)
    radicals: list[str] = Field(description="The radicals (bộ thủ) that make up this character, e.g. ['氵', '工']")
    etymology_vi: str = Field(description="Mnemonic or etymology explanation in Vietnamese (Chiết tự)")


async def enrich_character(character: str) -> GeneratedMetadata:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    prompt = (
        f"Tạo dữ liệu học chữ Hán cho ký tự: {character}. "
        "Viết pinyin có dấu thanh, nghĩa tiếng Việt ngắn gọn kèm âm Hán Việt "
        "nếu phù hợp. Viết một đoạn giải thích chiết tự (nguồn gốc cấu tạo chữ "
        "hoặc mẹo nhớ) bằng tiếng Việt thật dễ hiểu. Kể tên các bộ thủ. "
        "Và tạo 2-3 câu ví dụ đơn giản gồm tiếng Trung, pinyin, bản dịch Việt. "
        "Chỉ trả dữ liệu đúng schema."
    )
    async with genai.Client(api_key=settings.gemini_api_key).aio as client:
        response = await client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeneratedMetadata,
                temperature=0.2,
            ),
        )

    if response.parsed is not None:
        return GeneratedMetadata.model_validate(response.parsed)
    if not response.text:
        raise RuntimeError("Gemini returned an empty response")
    return GeneratedMetadata.model_validate_json(response.text)
