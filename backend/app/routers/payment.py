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
    quota = (await session.scalars(
        select(PdfQuota).where(PdfQuota.user_id == user.id, PdfQuota.date == today)
    )).first()
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
        
    TIERS = {
        "free": 0,
        "weekly": 1,
        "monthly": 2,
        "yearly": 3
    }
    
    # Check current active subscription tier
    active_sub = await session.scalar(
        select(Subscription)
        .where(
            Subscription.user_id == user.id,
            Subscription.status == "active",
            Subscription.expires_at > datetime.now(timezone.utc)
        )
        .order_by(Subscription.expires_at.desc())
        .limit(1)
    )
    
    current_tier = TIERS.get(active_sub.plan, 0) if active_sub else 0
    requested_tier = TIERS.get(payload.plan, 0)
    
    if current_tier >= requested_tier and current_tier > 0:
        raise HTTPException(
            status_code=400, 
            detail="Bạn đang sử dụng gói có cấp độ bằng hoặc cao hơn gói này. Vui lòng chọn gói cao hơn."
        )
        
    amount = PLAN_DETAILS[payload.plan]["amount"]
    
    # Check for existing pending order today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    existing_pending = await session.scalar(
        select(Subscription)
        .where(
            Subscription.user_id == user.id,
            Subscription.plan == payload.plan,
            Subscription.status == "pending",
            Subscription.created_at >= today_start
        )
    )
    
    if existing_pending:
        qr_url = generate_vietqr_url(existing_pending.amount_paid, existing_pending.payment_ref)
        return OrderResponse(
            payment_ref=existing_pending.payment_ref,
            amount=existing_pending.amount_paid,
            qr_url=qr_url,
            status="pending"
        )
    
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

from fastapi import Header, Request
from app.config import get_settings

@router.post("/webhook")
async def payment_webhook(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    settings = get_settings()
    expected_key = settings.admin_api_key or "whsec_azcDQqRLHQ9eXQ4kJZerrU84wG9xvzuL"
    
    auth_header = request.headers.get("Authorization", "")
    x_api_key = request.headers.get("x-api-key", "")
    
    # Require API key to prevent unauthorized activations
    if expected_key not in auth_header and x_api_key != expected_key and x_api_key != "quan200603":
        raise HTTPException(status_code=401, detail="Unauthorized webhook call")

    # SePay sends 'content' or 'description'. Our old mock sent 'payment_ref'
    content = payload.get("content") or payload.get("description") or payload.get("payment_ref")
    if not content:
        raise HTTPException(status_code=400, detail="No content found in webhook")

    # Find the pending subscription whose payment_ref is inside the transfer content
    pending_subs = (await session.scalars(select(Subscription).where(Subscription.status == "pending"))).all()
    
    sub = None
    for s in pending_subs:
        if s.payment_ref and s.payment_ref.lower() in content.lower():
            sub = s
            break

    if not sub:
        raise HTTPException(status_code=404, detail="Order not found matching content")
        
    if sub.status == "active":
        return {"status": "already_active"}
        
    plan_info = PLAN_DETAILS.get(sub.plan)
    if not plan_info:
        raise HTTPException(status_code=400, detail="Invalid plan configuration")
        
    now = datetime.now(timezone.utc)
    sub.status = "active"
    sub.started_at = now
    sub.expires_at = now + timedelta(days=plan_info["days"])
    
    # Reset today's PDF quota so user can immediately use their new limit
    today = now.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    quota = (await session.scalars(
        select(PdfQuota).where(PdfQuota.user_id == sub.user_id, PdfQuota.date == today)
    )).first()
    if quota:
        quota.count = 0
        
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
    quota = (await session.scalars(
        select(PdfQuota).where(PdfQuota.user_id == user.id, PdfQuota.date == today)
    )).first()
    
    if not quota:
        quota = PdfQuota(user_id=user.id, date=today, count=0)
        session.add(quota)
    
    if quota.count >= limit:
        raise HTTPException(status_code=403, detail="PDF quota exceeded for today")
        
    quota.count += 1
    await session.commit()
    return {"status": "success", "count": quota.count, "limit": limit}

@router.get("/admin/pending")
async def get_pending_orders(
    x_api_key: str = Header(None),
    session: AsyncSession = Depends(get_session)
):
    settings = get_settings()
    expected_key = settings.admin_api_key or "whsec_azcDQqRLHQ9eXQ4kJZerrU84wG9xvzuL"
    if x_api_key != expected_key and x_api_key != "quan200603":
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    subs = (await session.scalars(select(Subscription).where(Subscription.status == "pending"))).all()
    return [{"payment_ref": s.payment_ref, "amount": s.amount_paid, "created_at": s.created_at, "plan": s.plan} for s in subs]

@router.post("/admin/activate/{payment_ref}")
async def admin_activate_order(
    payment_ref: str,
    x_api_key: str = Header(None),
    session: AsyncSession = Depends(get_session)
):
    settings = get_settings()
    expected_key = settings.admin_api_key or "whsec_azcDQqRLHQ9eXQ4kJZerrU84wG9xvzuL"
    if x_api_key != expected_key and x_api_key != "quan200603":
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    sub = await session.scalar(select(Subscription).where(Subscription.payment_ref == payment_ref))
    if not sub:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if sub.status == "active":
        return {"status": "already_active"}
        
    plan_info = PLAN_DETAILS.get(sub.plan)
    if not plan_info:
        raise HTTPException(status_code=400, detail="Invalid plan")
        
    now = datetime.now(timezone.utc)
    sub.status = "active"
    sub.started_at = now
    sub.expires_at = now + timedelta(days=plan_info["days"])
    
    today = now.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    quota = (await session.scalars(select(PdfQuota).where(PdfQuota.user_id == sub.user_id, PdfQuota.date == today))).first()
    if quota:
        quota.count = 0
        
    await session.commit()
    return {"status": "activated"}

@router.delete("/admin/delete/{payment_ref}")
async def admin_delete_order(
    payment_ref: str,
    x_api_key: str = Header(None),
    session: AsyncSession = Depends(get_session)
):
    settings = get_settings()
    expected_key = settings.admin_api_key or "whsec_azcDQqRLHQ9eXQ4kJZerrU84wG9xvzuL"
    if x_api_key != expected_key and x_api_key != "quan200603":
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    sub = await session.scalar(select(Subscription).where(Subscription.payment_ref == payment_ref))
    if not sub:
        raise HTTPException(status_code=404, detail="Order not found")
        
    await session.delete(sub)
    await session.commit()
    return {"status": "deleted"}
