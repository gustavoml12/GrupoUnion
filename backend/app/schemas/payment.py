from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.payment import PaymentStatus, PaymentType


class PaymentBase(BaseModel):
    """Base payment schema"""
    payment_type: PaymentType
    amount: float


class PaymentCreate(PaymentBase):
    """Schema for payment creation"""
    pass


class PaymentProofUpload(BaseModel):
    """Schema for uploading payment proof"""
    payment_proof_url: str
    payment_date: Optional[datetime] = None


class PaymentVerify(BaseModel):
    """Schema for Hub to verify payment"""
    approved: bool
    rejection_reason: Optional[str] = None


class PaymentResponse(PaymentBase):
    """Schema for payment response"""
    id: str
    user_id: str
    status: PaymentStatus
    pix_key: Optional[str]
    payment_proof_url: Optional[str]
    payment_date: Optional[datetime]
    verified_by: Optional[str]
    verified_at: Optional[datetime]
    rejection_reason: Optional[str]
    reference_month: Optional[str]
    due_date: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ApplicationSubmit(BaseModel):
    """Schema for member application submission"""
    company_name: str
    business_category: str
    company_description: Optional[str] = None
    website: Optional[str] = None
    business_phone: Optional[str] = None
    business_email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    application_reason: str  # Por que quer participar
