from typing import Any

from google.auth.transport import requests
from google.oauth2 import id_token

from app.config import get_settings


def verify_google_credential(credential: str) -> dict[str, Any]:
    settings = get_settings()
    if not settings.google_client_id:
        raise ValueError("GOOGLE_CLIENT_ID is not configured")

    payload = id_token.verify_oauth2_token(
        credential,
        requests.Request(),
        settings.google_client_id,
    )
    if (
        not payload.get("email")
        or not payload.get("sub")
        or payload.get("email_verified") is not True
    ):
        raise ValueError("Google credential does not include required identity fields")
    return payload
