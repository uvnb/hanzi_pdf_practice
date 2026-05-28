from uuid import UUID

from pydantic import BaseModel, ConfigDict


class GoogleLoginRequest(BaseModel):
    credential: str


class UserRead(BaseModel):
    id: UUID
    email: str
    name: str
    avatar_url: str | None

    model_config = ConfigDict(from_attributes=True)
