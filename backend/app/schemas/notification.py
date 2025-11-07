"""
Notification Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.notification import NotificationType, NotificationPriority


# Base Schema
class NotificationBase(BaseModel):
    type: NotificationType
    priority: NotificationPriority = NotificationPriority.NORMAL
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=1000)
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
    expires_at: Optional[datetime] = None


# Create Schema
class NotificationCreate(NotificationBase):
    """Schema for creating a notification"""
    user_id: str


# Update Schema
class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    is_read: Optional[bool] = None


# Response Schema
class NotificationResponse(NotificationBase):
    """Schema for notification response"""
    id: str
    user_id: str
    is_read: bool
    read_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Bulk Actions
class NotificationMarkAllRead(BaseModel):
    """Schema for marking all notifications as read"""
    user_id: str


# Statistics
class NotificationStats(BaseModel):
    """Notification statistics"""
    total_notifications: int
    unread_notifications: int
    read_notifications: int
    notifications_by_type: dict


# Helper schemas for creating specific notification types
class MemberApprovedNotification(BaseModel):
    """Helper for member approved notification"""
    member_id: str
    member_name: str


class MeetingConfirmedNotification(BaseModel):
    """Helper for meeting confirmed notification"""
    meeting_id: str
    meeting_date: str
    meeting_link: Optional[str] = None
    location: Optional[str] = None


class NewVideoNotification(BaseModel):
    """Helper for new video notification"""
    video_id: str
    video_title: str
