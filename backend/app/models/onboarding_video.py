"""
Onboarding Video Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class VideoProvider(str, enum.Enum):
    """Video provider types"""
    YOUTUBE = "YOUTUBE"
    PANDA = "PANDA"
    VIMEO = "VIMEO"


class OnboardingVideo(Base):
    """Onboarding video model"""
    __tablename__ = "onboarding_videos"
    
    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Video Info
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String, nullable=False)  # URL do vídeo (YouTube, Panda, etc)
    provider = Column(SQLEnum(VideoProvider), nullable=False)
    thumbnail_url = Column(String, nullable=True)
    
    # Order and Status
    order = Column(Integer, nullable=False, default=0)  # Ordem de exibição
    is_active = Column(Boolean, default=True, nullable=False)
    duration_minutes = Column(Integer, nullable=True)  # Duração estimada em minutos
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    progress = relationship("VideoProgress", back_populates="video", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<OnboardingVideo {self.title}>"
