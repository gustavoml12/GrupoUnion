from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.member import BusinessCategory, MemberStatus


class MemberBase(BaseModel):
    """Base member schema"""
    company_name: str
    business_category: BusinessCategory
    company_description: Optional[str] = None
    website: Optional[str] = None
    business_phone: Optional[str] = None
    business_email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None


class MemberCreate(MemberBase):
    """Schema for member creation"""
    pass


class MemberUpdate(BaseModel):
    """Schema for member profile update"""
    company_name: Optional[str] = None
    business_category: Optional[BusinessCategory] = None
    company_description: Optional[str] = None
    website: Optional[str] = None
    business_phone: Optional[str] = None
    business_email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    profile_photo_url: Optional[str] = None


class MemberResponse(MemberBase):
    """Schema for member response"""
    id: str
    user_id: str
    status: MemberStatus
    reputation_score: float
    total_referrals_given: int
    total_referrals_received: int
    total_deals_closed: int
    created_at: datetime
    
    class Config:
        from_attributes = True
