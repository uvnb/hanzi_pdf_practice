from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AttemptCreate(BaseModel):
    character: str
    mistakes: int


class AttemptRead(BaseModel):
    character: str
    mistakes: int
    is_perfect: bool
    practiced_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PracticeStats(BaseModel):
    total_attempts: int
    total_characters_practiced: int
    perfect_count: int
    total_mistakes: int
    accuracy_rate: float  # 0.0 – 1.0
    streak_days: int
    recent_attempts: list[AttemptRead]


class LeaderboardUser(BaseModel):
    id: str
    rank: int
    name: str
    avatar: str | None
    attempts: int
    perfect: int
    streak: int
    isPremium: bool = False
