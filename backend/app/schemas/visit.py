"""
Visit Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.visit import VisitPurpose, VisitStatus


# Base Schema
class VisitBase(BaseModel):
    visited_id: str
    purpose: VisitPurpose
    visit_date: datetime
    duration_minutes: int = 60
    location: Optional[str] = None
    visitor_notes: Optional[str] = None


# Create Schema
class VisitCreate(VisitBase):
    """Schema for creating a visit"""
    pass


# Update Schema
class VisitUpdate(BaseModel):
    """Schema for updating a visit"""
    visit_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    visitor_notes: Optional[str] = None
    status: Optional[VisitStatus] = None


# Complete Visit Schema
class VisitComplete(BaseModel):
    """Schema for completing a visit with summary"""
    visit_summary: str = Field(..., min_length=10, max_length=2000)
    services_learned: Optional[str] = Field(None, max_length=1000)
    potential_referrals: Optional[str] = Field(None, max_length=1000)
    networking_quality: Optional[int] = Field(None, ge=1, le=5)
    follow_up_needed: Optional[str] = Field(None, max_length=500)
    follow_up_date: Optional[datetime] = None


# Response Schema
class VisitResponse(VisitBase):
    """Schema for visit response"""
    id: str
    visitor_id: str
    status: VisitStatus
    visit_summary: Optional[str]
    services_learned: Optional[str]
    potential_referrals: Optional[str]
    networking_quality: Optional[int]
    follow_up_needed: Optional[str]
    follow_up_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Visit with Member Details
class VisitWithMembers(VisitResponse):
    """Visit with visitor and visited member details"""
    visitor_name: str
    visitor_company: str
    visited_name: str
    visited_company: str


# Visit Statistics
class VisitStats(BaseModel):
    """Visit statistics"""
    total_visits: int
    visits_made: int
    visits_received: int
    completed_visits: int
    pending_visits: int
    average_networking_quality: Optional[float]
    total_potential_referrals: int
