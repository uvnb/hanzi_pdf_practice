from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_session
from app.models.user import User
from app.schemas.auth import GoogleLoginRequest, UserRead
from app.security import create_session_token, get_current_user
from app.services.google_auth import verify_google_credential

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


@router.post("/google", response_model=UserRead)
async def google_login(
    login: GoogleLoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> User:
    try:
        identity = await run_in_threadpool(verify_google_credential, login.credential)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from None

    email = str(identity["email"])
    user = await session.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(
            email=email,
            name=str(identity.get("name", email)),
            avatar_url=identity.get("picture"),
        )
        session.add(user)
    else:
        user.name = str(identity.get("name", user.name))
        user.avatar_url = identity.get("picture", user.avatar_url)
    await session.commit()
    await session.refresh(user)

    response.set_cookie(
        key=settings.auth_cookie_name,
        value=create_session_token(user.id),
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.session_days * 24 * 60 * 60,
        path="/",
    )
    return user


@router.get("/me", response_model=UserRead)
async def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.post("/logout", status_code=204)
async def logout(response: Response) -> None:
    response.delete_cookie(
        key=settings.auth_cookie_name,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )
