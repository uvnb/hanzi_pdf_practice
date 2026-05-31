from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SubscriptionResponse(BaseModel):
    plan: str # 'free', 'weekly', 'monthly', 'yearly'
    status: str
    started_at: datetime | None = None
    expires_at: datetime | None = None
    pdf_count_today: int
    pdf_limit: int

    model_config = ConfigDict(from_attributes=True)

class OrderCreateRequest(BaseModel):
    plan: str # 'weekly', 'monthly', 'yearly'

class OrderResponse(BaseModel):
    payment_ref: str
    amount: int
    qr_url: str
    status: str

class PaymentWebhookRequest(BaseModel):
    # Depending on SePay or manual admin, we just need payment_ref for now.
    payment_ref: str
    amount: int | None = None
