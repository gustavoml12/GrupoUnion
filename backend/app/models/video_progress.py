"""
Video Progress Model - Track user video watching progress
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class VideoProgress(Base):
    """Track user progress on onboarding videos"""
    __tablename__ = "video_progress"
    
    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    video_id = Column(String, ForeignKey('onboarding_videos.id'), nullable=False)
    
    # Progress Info
    completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="video_progress")
    video = relationship("OnboardingVideo", back_populates="progress")
    
    def __repr__(self):
        return f"<VideoProgress user={self.user_id} video={self.video_id} completed={self.completed}>"
