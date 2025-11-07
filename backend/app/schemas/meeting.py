"""
Meeting Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

from app.models.meeting import MeetingType, MeetingStatus


# Base Schema
class MeetingBase(BaseModel):
    meeting_type: MeetingType
    scheduled_date: datetime
    duration_minutes: str = "60"
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    member_notes: Optional[str] = None


# Create Schema
class MeetingCreate(MeetingBase):
    """Schema for creating a meeting"""
    pass
    
    @field_validator('scheduled_date')
    @classmethod
    def validate_future_date(cls, v):
        if v < datetime.utcnow():
            raise ValueError('A data da reunião deve ser no futuro')
        return v


# Update Schema
class MeetingUpdate(BaseModel):
    """Schema for updating a meeting"""
    meeting_type: Optional[MeetingType] = None
    scheduled_date: Optional[datetime] = None
    duration_minutes: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    member_notes: Optional[str] = None
    hub_notes: Optional[str] = None
    status: Optional[MeetingStatus] = None


# Hub Actions
class MeetingConfirm(BaseModel):
    """Schema for confirming a meeting"""
    meeting_link: Optional[str] = None
    location: Optional[str] = None
    hub_notes: Optional[str] = None


class MeetingCancel(BaseModel):
    """Schema for cancelling a meeting"""
    cancellation_reason: str = Field(..., min_length=10, max_length=500)


class MeetingComplete(BaseModel):
    """Schema for marking meeting as completed"""
    hub_notes: Optional[str] = None


# Response Schemas
class MeetingMemberInfo(BaseModel):
    """Member info for meeting response"""
    id: str
    company_name: str
    business_category: str
    user_name: str
    user_email: str
    
    class Config:
        from_attributes = True


class MeetingResponse(MeetingBase):
    """Schema for meeting response"""
    id: str
    member_id: str
    scheduled_by_id: Optional[str]
    confirmed_by_id: Optional[str]
    status: MeetingStatus
    hub_notes: Optional[str]
    cancellation_reason: Optional[str]
    google_calendar_event_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    confirmed_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class MeetingWithMember(MeetingResponse):
    """Schema for meeting with member details"""
    member: MeetingMemberInfo
    
    class Config:
        from_attributes = True


# Statistics
class MeetingStats(BaseModel):
    """Meeting statistics"""
    total_meetings: int
    pending_meetings: int
    confirmed_meetings: int
    completed_meetings: int
    cancelled_meetings: int
    upcoming_meetings: int  # Próximas 7 dias
