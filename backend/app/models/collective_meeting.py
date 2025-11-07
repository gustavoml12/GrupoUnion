"""
Collective Meeting Model - Meetings with all members
"""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Text, Integer, Boolean, Enum as SQLEnum, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.core.database import Base


class CollectiveMeetingType(str, Enum):
    """Meeting type enum"""
    ONLINE = "ONLINE"
    PRESENCIAL = "PRESENCIAL"


class CollectiveMeetingStatus(str, Enum):
    """Meeting status enum"""
    AGENDADA = "AGENDADA"  # Scheduled
    CONFIRMADA = "CONFIRMADA"  # Confirmed
    CANCELADA = "CANCELADA"  # Cancelled
    REALIZADA = "REALIZADA"  # Completed


# Association table for meeting attendees
meeting_attendees = Table(
    'meeting_attendees',
    Base.metadata,
    Column('meeting_id', String, ForeignKey('collective_meetings.id', ondelete='CASCADE'), primary_key=True),
    Column('member_id', String, ForeignKey('members.id', ondelete='CASCADE'), primary_key=True),
    Column('confirmed', Boolean, default=False),
    Column('attended', Boolean, default=False),
    Column('confirmed_at', DateTime, nullable=True)
)


class CollectiveMeeting(Base):
    """Collective meeting model for meetings with all members"""
    __tablename__ = "collective_meetings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Meeting details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    meeting_type = Column(SQLEnum(CollectiveMeetingType), nullable=False)
    
    # Schedule
    scheduled_date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    
    # Location/Link
    location = Column(String, nullable=True)  # For in-person meetings
    meeting_link = Column(String, nullable=True)  # For online meetings
    
    # Status
    status = Column(SQLEnum(CollectiveMeetingStatus), default=CollectiveMeetingStatus.AGENDADA, nullable=False)
    
    # Creator
    created_by_id = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Notes
    agenda = Column(Text, nullable=True)  # Meeting agenda
    notes = Column(Text, nullable=True)  # Meeting notes/minutes
    
    # Attendance tracking
    total_invited = Column(Integer, default=0)
    total_confirmed = Column(Integer, default=0)
    total_attended = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    cancelled_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    created_by = relationship("User", backref="collective_meetings_created")
    attendees = relationship("Member", secondary=meeting_attendees, backref="collective_meetings")

    def __repr__(self):
        return f"<CollectiveMeeting {self.id} - {self.title}>"

    def mark_as_completed(self):
        """Mark meeting as completed"""
        self.status = CollectiveMeetingStatus.REALIZADA
        self.completed_at = datetime.utcnow()

    def cancel(self):
        """Cancel meeting"""
        self.status = CollectiveMeetingStatus.CANCELADA
        self.cancelled_at = datetime.utcnow()
