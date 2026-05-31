from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.practice import PracticeAttempt
from app.models.user import User
from app.schemas.practice import AttemptCreate, AttemptRead, PracticeStats, LeaderboardUser
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


@router.get("/leaderboard", response_model=list[LeaderboardUser])
async def get_leaderboard(session: AsyncSession = Depends(get_session)):
    top_users_query = (
        select(
            User.id,
            User.name,
            User.avatar_url,
            func.count(PracticeAttempt.id).label("total_attempts"),
            func.sum(case((PracticeAttempt.is_perfect == True, 1), else_=0)).label("perfect_count")
        )
        .join(PracticeAttempt, User.id == PracticeAttempt.user_id)
        .group_by(User.id)
        .order_by(func.count(PracticeAttempt.id).desc())
        .limit(10)
    )

    result = await session.execute(top_users_query)
    top_users = result.all()

    leaderboard = []
    today = datetime.now(timezone.utc).date()

    for rank, row in enumerate(top_users, start=1):
        user_id, name, avatar, attempts, perfect = row

        dates_result = await session.scalars(
            select(func.distinct(func.date(PracticeAttempt.practiced_at)))
            .where(PracticeAttempt.user_id == user_id)
            .order_by(func.date(PracticeAttempt.practiced_at).desc())
        )
        dates = list(dates_result)
        streak_days = 0
        for i, d in enumerate(dates):
            expected = today - timedelta(days=i)
            if d == expected:
                streak_days += 1
            else:
                break

        leaderboard.append(
            LeaderboardUser(
                id=str(user_id),
                rank=rank,
                name=name,
                avatar=avatar or "https://i.pravatar.cc/150",
                attempts=attempts or 0,
                perfect=perfect or 0,
                streak=streak_days,
                isPremium=False
            )
        )

    return leaderboard
