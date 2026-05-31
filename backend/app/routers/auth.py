from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import random
import string
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta, timezone
from typing import Dict, Tuple

from app.config import get_settings
from app.database import get_session
from app.models.user import User
from app.schemas.auth import GoogleLoginRequest, UserRead
from app.security import create_session_token, get_current_user
from app.services.google_auth import verify_google_credential

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()

deletion_codes: Dict[str, Tuple[str, datetime]] = {}

class DeleteAccountConfirm(BaseModel):
    code: str


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

@router.post("/request-delete")
async def request_delete_account(user: User = Depends(get_current_user)):
    code = ''.join(random.choices(string.digits, k=6))
    deletion_codes[user.email] = (code, datetime.now(timezone.utc) + timedelta(minutes=15))
    
    if settings.smtp_user and settings.smtp_password:
        try:
            msg = MIMEText(f"Mã xác nhận xóa tài khoản của bạn là: {code}. Mã có hiệu lực trong 15 phút.")
            msg['Subject'] = 'Xác nhận xóa tài khoản Hanzi'
            msg['From'] = settings.smtp_user
            msg['To'] = user.email
            
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
        except Exception as e:
            print(f"Lỗi gửi email: {e}")
            raise HTTPException(status_code=500, detail="Không thể gửi email xác nhận.")
    else:
        print(f"MOCK EMAIL (no SMTP config): Code for {user.email} is {code}")
        
    return {"status": "sent", "message": "Đã gửi mã xác nhận"}

@router.post("/confirm-delete")
async def confirm_delete_account(
    body: DeleteAccountConfirm,
    response: Response,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    record = deletion_codes.get(user.email)
    if not record:
        raise HTTPException(status_code=400, detail="Chưa yêu cầu mã hoặc mã đã hết hạn")
        
    code, expires_at = record
    if datetime.now(timezone.utc) > expires_at:
        del deletion_codes[user.email]
        raise HTTPException(status_code=400, detail="Mã đã hết hạn")
        
    if body.code != code:
        raise HTTPException(status_code=400, detail="Mã xác nhận không chính xác")
        
    # Delete user and cascade data
    await session.delete(user)
    await session.commit()
    del deletion_codes[user.email]
    
    # Logout
    response.delete_cookie(
        key=settings.auth_cookie_name,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )
    return {"status": "deleted"}
