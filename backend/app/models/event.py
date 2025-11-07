import enum
from datetime import datetime
from sqlalchemy import Column, String, Enum as SQLEnum, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class EventType(str, enum.Enum):
    """Event types"""
    WEEKLY_MEETING = "WEEKLY_MEETING"  # Reunião semanal
    NETWORKING = "NETWORKING"  # Evento de networking
    TRAINING = "TRAINING"  # Treinamento
    SPECIAL = "SPECIAL"  # Evento especial


class Event(Base):
    """Event model - In-person meetings and events"""
    __tablename__ = "events"

    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Event Info
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(SQLEnum(EventType), nullable=False)
    
    # Date & Time
    event_date = Column(DateTime, nullable=False)
    duration_minutes = Column(String, nullable=True)  # Ex: "90"
    
    # Location
    location = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    
    # Organization
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    creator = relationship("User", backref="events_created")
    
    def __repr__(self):
        return f"<Event {self.title}>"


class EventAttendance(Base):
    """Event attendance model - Track who attended events"""
    __tablename__ = "event_attendances"

    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    member_id = Column(String, ForeignKey("members.id"), nullable=False)
    
    # Attendance
    confirmed = Column(Boolean, default=False)
    checked_in = Column(Boolean, default=False)
    checked_in_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    event = relationship("Event", backref="attendances")
    member = relationship("Member", backref="event_attendances")
    
    def __repr__(self):
        return f"<EventAttendance {self.member_id} -> {self.event_id}>"
