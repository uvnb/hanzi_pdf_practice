import json
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.database import AsyncSessionLocal, create_tables
from app.main import app
from app.models.hanzi import HanziCharacter
import app.routers.auth as auth_router
import app.routers.ai as ai_router
from app.config import Settings, get_settings
from app.services.gemini_service import GeneratedExample, GeneratedMetadata

SEED_PATH = Path(__file__).parent.parent / "seed" / "hsk1_starter.json"


async def seed_characters() -> None:
    await create_tables()
    records = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    async with AsyncSessionLocal() as session:
        for record in records:
            existing = await session.scalar(
                select(HanziCharacter).where(
                    HanziCharacter.character == record["character"]
                )
            )
            if existing is None:
                session.add(HanziCharacter(**record))
        await session.commit()


def test_health() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_hosted_postgres_url_uses_async_driver_and_ssl_parameter() -> None:
    settings = Settings(
        database_url="postgresql://hanzi:secret@ep.example.neon.tech/hanzi?sslmode=require"
    )
    assert settings.database_url == (
        "postgresql+asyncpg://hanzi:secret@ep.example.neon.tech/hanzi?ssl=require"
    )
    assert Settings(database_url="sqlite+aiosqlite:///./test.db").database_url == (
        "sqlite+aiosqlite:///./test.db"
    )


def test_hanzi_endpoints() -> None:
    import asyncio

    asyncio.run(seed_characters())
    with TestClient(app) as client:
        item = client.get("/api/hanzi/学")
        listing = client.get("/api/hanzi/hsk/1")
        batch = client.get("/api/hanzi/batch", params={"characters": "学,你,未,学"})

    assert item.status_code == 200
    assert item.json()["pinyin"] == "xué"
    assert listing.status_code == 200
    assert len(listing.json()) == 7
    assert [record["character"] for record in batch.json()] == ["学", "你"]
    assert batch.json()[0]["meaning_vi"] == "học"


def test_hanzi_batch_rejects_too_many_characters() -> None:
    characters = "".join(chr(0x4E00 + offset) for offset in range(101))
    with TestClient(app) as client:
        response = client.get("/api/hanzi/batch", params={"characters": characters})
    assert response.status_code == 422


def test_notebook_requires_session() -> None:
    with TestClient(app) as client:
        response = client.get("/api/users/me/notebook")
    assert response.status_code == 401


def test_google_session_and_notebook(monkeypatch) -> None:
    import asyncio

    asyncio.run(seed_characters())
    monkeypatch.setattr(
        auth_router,
        "verify_google_credential",
        lambda _: {
            "sub": "google-user-1",
            "email": "student@example.com",
            "email_verified": True,
            "name": "Student",
            "picture": "https://example.com/avatar.png",
        },
    )

    with TestClient(app) as client:
        login = client.post("/api/auth/google", json={"credential": "test-token"})
        me = client.get("/api/auth/me")
        add = client.post("/api/users/me/notebook", json={"character": "学"})
        duplicate = client.post("/api/users/me/notebook", json={"character": "学"})
        notebook = client.get("/api/users/me/notebook")
        remove = client.delete("/api/users/me/notebook/学")
        empty_notebook = client.get("/api/users/me/notebook")
        logout = client.post("/api/auth/logout")
        signed_out = client.get("/api/auth/me")

    assert login.status_code == 200
    assert "auth_token=" in login.headers["set-cookie"]
    assert "HttpOnly" in login.headers["set-cookie"]
    assert me.json()["email"] == "student@example.com"
    assert add.status_code == 201
    assert duplicate.status_code == 201
    assert [entry["character"] for entry in notebook.json()] == ["学"]
    assert remove.status_code == 204
    assert empty_notebook.json() == []
    assert logout.status_code == 204
    assert signed_out.status_code == 401


def test_google_session_supports_cross_site_cookie_configuration(monkeypatch) -> None:
    monkeypatch.setattr(auth_router.settings, "cookie_secure", True)
    monkeypatch.setattr(auth_router.settings, "cookie_samesite", "none")
    monkeypatch.setattr(
        auth_router,
        "verify_google_credential",
        lambda _: {
            "sub": "google-user-cookie",
            "email": "cookie@example.com",
            "email_verified": True,
            "name": "Cookie Tester",
        },
    )

    with TestClient(app) as client:
        response = client.post("/api/auth/google", json={"credential": "test-token"})

    cookie = response.headers["set-cookie"]
    assert response.status_code == 200
    assert "SameSite=none" in cookie
    assert "Secure" in cookie


def test_ai_enrichment_requires_admin_key_and_persists(monkeypatch) -> None:
    import asyncio

    asyncio.run(seed_characters())
    monkeypatch.setattr(get_settings(), "admin_api_key", "test-admin-key")

    async def fake_enrich(character: str) -> GeneratedMetadata:
        return GeneratedMetadata(
            pinyin="xué",
            meaning_vi=f"học; Hán Việt: học ({character})",
            example_sentences=[
                GeneratedExample(hanzi="我学习汉语。", pinyin="Wǒ xuéxí Hànyǔ.", vi="Tôi học tiếng Hán."),
                GeneratedExample(hanzi="学生学习。", pinyin="Xuéshēng xuéxí.", vi="Học sinh học tập."),
            ],
        )

    monkeypatch.setattr(ai_router, "enrich_character", fake_enrich)

    with TestClient(app) as client:
        rejected = client.post("/api/ai/enrich-batch", json={"characters": ["学"]})
        enriched = client.post(
            "/api/ai/enrich-batch",
            headers={"X-Admin-Key": "test-admin-key"},
            json={"characters": ["学"], "force": True},
        )
        fetched = client.get("/api/hanzi/学")

    assert rejected.status_code == 403
    assert enriched.status_code == 200
    assert enriched.json()[0]["ai_enriched"] is True
    assert fetched.json()["meaning_vi"].startswith("học; Hán Việt")
    assert len(fetched.json()["example_sentences"]) == 2


def test_ai_enrichment_returns_service_unavailable_when_generation_fails(
    monkeypatch,
) -> None:
    import asyncio

    asyncio.run(seed_characters())
    monkeypatch.setattr(get_settings(), "admin_api_key", "test-admin-key")

    async def missing_configuration(_: str) -> GeneratedMetadata:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    monkeypatch.setattr(ai_router, "enrich_character", missing_configuration)

    with TestClient(app) as client:
        response = client.post(
            "/api/ai/enrich-batch",
            headers={"X-Admin-Key": "test-admin-key"},
            json={"characters": ["学"], "force": True},
        )

    assert response.status_code == 503
    assert response.json()["detail"] == "GEMINI_API_KEY is not configured"
