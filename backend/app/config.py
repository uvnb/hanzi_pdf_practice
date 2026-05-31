from functools import lru_cache
from typing import Literal
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Hanzi Practice API"
    database_url: str = "postgresql+asyncpg://hanzi:hanzi@localhost:5432/hanzi"
    frontend_origin: str = "http://localhost:3000"
    auto_create_tables: bool = True
    google_client_id: str = ""
    jwt_secret: str = "development-only-change-this-secret"
    jwt_algorithm: str = "HS256"
    session_days: int = 7
    auth_cookie_name: str = "auth_token"
    cookie_secure: bool = False
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    admin_api_key: str = ""
    smtp_user: str = ""
    smtp_password: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("database_url")
    @classmethod
    def prepare_async_database_url(cls, value: str) -> str:
        parts = urlsplit(value)
        if parts.scheme not in {"postgres", "postgresql", "postgresql+asyncpg"}:
            return value
        if parts.scheme in {"postgres", "postgresql"}:
            parts = parts._replace(scheme="postgresql+asyncpg")
        query = [
            ("ssl", setting) if key == "sslmode" else (key, setting)
            for key, setting in parse_qsl(parts.query, keep_blank_values=True)
        ]
        parts = parts._replace(query=urlencode(query))
        return urlunsplit(parts)


@lru_cache
def get_settings() -> Settings:
    return Settings()
