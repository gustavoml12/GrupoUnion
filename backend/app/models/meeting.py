"""
Meeting Model
"""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.database import Base


class MeetingType(str, Enum):
    """Meeting type enum"""
    ONLINE = "ONLINE"
    PRESENCIAL = "PRESENCIAL"


class MeetingStatus(str, Enum):
    """Meeting status enum"""
    PENDING = "PENDING"  # Aguardando confirmação
    CONFIRMED = "CONFIRMED"  # Confirmada
    CANCELLED = "CANCELLED"  # Cancelada
    COMPLETED = "COMPLETED"  # Realizada


class Meeting(Base):
    """Meeting model for scheduling member meetings"""
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Relationships
    member_id = Column(String, ForeignKey('members.id', ondelete='CASCADE'), nullable=False)
    scheduled_by_id = Column(String, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    confirmed_by_id = Column(String, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    
    # Meeting details
    meeting_type = Column(SQLEnum(MeetingType), nullable=False, default=MeetingType.ONLINE)
    scheduled_date = Column(DateTime, nullable=False)
    duration_minutes = Column(String, default="60")  # Duração padrão: 60 minutos
    
    # Location/Link
    location = Column(String, nullable=True)  # Para reuniões presenciais
    meeting_link = Column(String, nullable=True)  # Para reuniões online (Google Meet, Zoom, etc)
    
    # Status and notes
    status = Column(SQLEnum(MeetingStatus), nullable=False, default=MeetingStatus.PENDING)
    member_notes = Column(Text, nullable=True)  # Observações do membro
    hub_notes = Column(Text, nullable=True)  # Observações do Hub/Admin
    cancellation_reason = Column(Text, nullable=True)
    
    # Calendar integration (for future use)
    google_calendar_event_id = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    confirmed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    member = relationship("Member", back_populates="meetings")
    scheduled_by = relationship("User", foreign_keys=[scheduled_by_id])
    confirmed_by = relationship("User", foreign_keys=[confirmed_by_id])

    def __repr__(self):
        return f"<Meeting {self.id} - {self.member_id} - {self.scheduled_date}>"
