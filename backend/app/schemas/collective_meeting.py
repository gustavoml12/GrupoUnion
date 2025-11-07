"""
Collective Meeting Schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.collective_meeting import CollectiveMeetingType, CollectiveMeetingStatus


# Base Schema
class CollectiveMeetingBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    meeting_type: CollectiveMeetingType
    scheduled_date: datetime
    duration_minutes: int = 60
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    agenda: Optional[str] = None


# Create Schema
class CollectiveMeetingCreate(CollectiveMeetingBase):
    """Schema for creating a collective meeting"""
    pass


# Update Schema
class CollectiveMeetingUpdate(BaseModel):
    """Schema for updating a collective meeting"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    agenda: Optional[str] = None
    notes: Optional[str] = None


# Response Schema
class CollectiveMeetingResponse(CollectiveMeetingBase):
    """Schema for collective meeting response"""
    id: str
    status: CollectiveMeetingStatus
    created_by_id: str
    notes: Optional[str]
    total_invited: int
    total_confirmed: int
    total_attended: int
    created_at: datetime
    updated_at: datetime
    cancelled_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Attendee Schema
class MeetingAttendee(BaseModel):
    """Schema for meeting attendee"""
    member_id: str
    member_name: str
    company_name: str
    confirmed: bool
    attended: bool
    confirmed_at: Optional[datetime]


# Meeting with Attendees
class CollectiveMeetingWithAttendees(CollectiveMeetingResponse):
    """Collective meeting with attendee list"""
    attendees: List[MeetingAttendee]


# Confirm Attendance
class ConfirmAttendance(BaseModel):
    """Schema for confirming attendance"""
    confirmed: bool = True


# Mark Attendance
class MarkAttendance(BaseModel):
    """Schema for marking attendance"""
    member_ids: List[str]


# Statistics
class CollectiveMeetingStats(BaseModel):
    """Collective meeting statistics"""
    total_meetings: int
    upcoming_meetings: int
    past_meetings: int
    cancelled_meetings: int
    average_attendance_rate: Optional[float]
