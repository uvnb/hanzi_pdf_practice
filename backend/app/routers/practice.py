from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.practice import PracticeAttempt
from app.models.user import User
from app.schemas.practice import AttemptCreate, AttemptRead, PracticeStats
from app.security import get_current_user

router = APIRouter(prefix="/api/practice", tags=["practice"])


@router.post("", response_model=AttemptRead, status_code=201)
async def log_attempt(
    payload: AttemptCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PracticeAttempt:
    attempt = PracticeAttempt(
        user_id=user.id,
        character=payload.character,
        mistakes=payload.mistakes,
        is_perfect=payload.mistakes == 0,
    )
    session.add(attempt)
    await session.commit()
    await session.refresh(attempt)
    return attempt


@router.get("/stats", response_model=PracticeStats)
async def get_stats(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PracticeStats:
    base = select(PracticeAttempt).where(PracticeAttempt.user_id == user.id)

    # Total attempts
    total_attempts = await session.scalar(
        select(func.count()).select_from(base.subquery())
    ) or 0

    # Unique characters practiced
    total_characters = await session.scalar(
        select(func.count(func.distinct(PracticeAttempt.character))).where(
            PracticeAttempt.user_id == user.id
        )
    ) or 0

    # Perfect count
    perfect_count = await session.scalar(
        select(func.count()).where(
            PracticeAttempt.user_id == user.id,
            PracticeAttempt.is_perfect.is_(True),
        )
    ) or 0

    # Total mistakes
    total_mistakes = await session.scalar(
        select(func.sum(PracticeAttempt.mistakes)).where(
            PracticeAttempt.user_id == user.id
        )
    ) or 0

    # Accuracy rate
    accuracy_rate = perfect_count / total_attempts if total_attempts > 0 else 0.0

    # Streak: count consecutive distinct dates (backwards from today)
    streak_days = 0
    today = datetime.now(timezone.utc).date()
    dates_result = await session.scalars(
        select(func.distinct(func.date(PracticeAttempt.practiced_at)))
        .where(PracticeAttempt.user_id == user.id)
        .order_by(func.date(PracticeAttempt.practiced_at).desc())
    )
    dates = list(dates_result)
    for i, d in enumerate(dates):
        expected = today - timedelta(days=i)
        if d == expected:
            streak_days += 1
        else:
            break

    # Recent 20 attempts
    recent = await session.scalars(
        select(PracticeAttempt)
        .where(PracticeAttempt.user_id == user.id)
        .order_by(PracticeAttempt.practiced_at.desc())
        .limit(20)
    )

    return PracticeStats(
        total_attempts=total_attempts,
        total_characters_practiced=total_characters,
        perfect_count=perfect_count,
        total_mistakes=total_mistakes,
        accuracy_rate=round(accuracy_rate, 4),
        streak_days=streak_days,
        recent_attempts=[AttemptRead.model_validate(a) for a in recent],
    )
