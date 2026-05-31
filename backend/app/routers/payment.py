import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.payment import PdfQuota, Subscription
from app.models.user import User
from app.schemas.payment import OrderCreateRequest, OrderResponse, PaymentWebhookRequest, SubscriptionResponse
from app.security import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])

PLAN_DETAILS = {
    "weekly": {"amount": 6000, "days": 7, "pdf_limit": 3},
    "monthly": {"amount": 26000, "days": 30, "pdf_limit": 5},
    "yearly": {"amount": 266000, "days": 365, "pdf_limit": 10},
}
FREE_PDF_LIMIT = 1

def generate_vietqr_url(amount: int, add_info: str) -> str:
    # VietQR for Techcombank - VU NGOC QUAN - 19076437519010
    params = {
        "amount": amount,
        "addInfo": add_info,
        "accountName": "VU NGOC QUAN"
    }
    return f"https://img.vietqr.io/image/TCB-19076437519010-compact2.png?{urlencode(params)}"

@router.get("/me", response_model=SubscriptionResponse)
async def get_my_subscription(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> SubscriptionResponse:
    # Get active subscription
    result = await session.scalars(
        select(Subscription)
        .where(
            Subscription.user_id == user.id,
            Subscription.status == "active",
            Subscription.expires_at > datetime.now(timezone.utc)
        )
        .order_by(Subscription.expires_at.desc())
        .limit(1)
    )
    sub = result.first()
    
    # Get today's PDF quota
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    quota = await session.scalar(
        select(PdfQuota).where(PdfQuota.user_id == user.id, PdfQuota.date == today)
    )
    count = quota.count if quota else 0

    if sub:
        limit = PLAN_DETAILS.get(sub.plan, {}).get("pdf_limit", FREE_PDF_LIMIT)
        return SubscriptionResponse(
            plan=sub.plan,
            status=sub.status,
            started_at=sub.started_at,
            expires_at=sub.expires_at,
            pdf_count_today=count,
            pdf_limit=limit,
        )
    else:
        return SubscriptionResponse(
            plan="free",
            status="active",
            pdf_count_today=count,
            pdf_limit=FREE_PDF_LIMIT,
        )

@router.post("/order", response_model=OrderResponse)
async def create_order(
    payload: OrderCreateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> OrderResponse:
    if payload.plan not in PLAN_DETAILS:
        raise HTTPException(status_code=400, detail="Invalid plan")
        
    amount = PLAN_DETAILS[payload.plan]["amount"]
    
    # Generate unique ref: {email_prefix}_{plan[0].upper()}_{timestamp}
    email_prefix = user.email.split("@")[0].lower()
    # Remove any non-alphanumeric chars to be safe for bank transfer
    email_prefix = ''.join(e for e in email_prefix if e.isalnum())[:10]
    ts = datetime.now(timezone.utc).strftime("%d%m%H%M")
    
    plan_char = payload.plan[0].upper()
    payment_ref = f"{email_prefix}{plan_char}{ts}"
    
    # Create pending subscription order
    sub = Subscription(
        user_id=user.id,
        plan=payload.plan,
        status="pending",
        amount_paid=amount,
        payment_ref=payment_ref,
        expires_at=datetime.now(timezone.utc) # temporary for pending
    )
    session.add(sub)
    await session.commit()
    
    qr_url = generate_vietqr_url(amount, payment_ref)
    
    return OrderResponse(
        payment_ref=payment_ref,
        amount=amount,
        qr_url=qr_url,
        status="pending"
    )

@router.get("/check/{ref}")
async def check_order(
    ref: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    sub = await session.scalar(
        select(Subscription).where(Subscription.payment_ref == ref, Subscription.user_id == user.id)
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return {"status": sub.status}

@router.post("/webhook")
async def payment_webhook(
    payload: PaymentWebhookRequest,
    session: AsyncSession = Depends(get_session),
):
    # This is a manual webhook for now. In production, SePay will call this.
    sub = await session.scalar(
        select(Subscription).where(Subscription.payment_ref == payload.payment_ref)
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if sub.status == "active":
        return {"status": "already_active"}
        
    plan_info = PLAN_DETAILS.get(sub.plan)
    if not plan_info:
        raise HTTPException(status_code=400, detail="Invalid plan configuration")
        
    now = datetime.now(timezone.utc)
    sub.status = "active"
    sub.started_at = now
    sub.expires_at = now + timedelta(days=plan_info["days"])
    
    await session.commit()
    return {"status": "activated"}

@router.post("/use-pdf")
async def use_pdf_quota(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Get active subscription to know the limit
    result = await session.scalars(
        select(Subscription)
        .where(
            Subscription.user_id == user.id,
            Subscription.status == "active",
            Subscription.expires_at > datetime.now(timezone.utc)
        )
        .order_by(Subscription.expires_at.desc())
        .limit(1)
    )
    sub = result.first()
    limit = PLAN_DETAILS.get(sub.plan, {}).get("pdf_limit", FREE_PDF_LIMIT) if sub else FREE_PDF_LIMIT

    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    quota = await session.scalar(
        select(PdfQuota).where(PdfQuota.user_id == user.id, PdfQuota.date == today)
    )
    
    if not quota:
        quota = PdfQuota(user_id=user.id, date=today, count=0)
        session.add(quota)
    
    if quota.count >= limit:
        raise HTTPException(status_code=403, detail="PDF quota exceeded for today")
        
    quota.count += 1
    await session.commit()
    return {"status": "success", "count": quota.count, "limit": limit}
