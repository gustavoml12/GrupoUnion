"""
Onboarding Video Schemas
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime
from app.models.onboarding_video import VideoProvider


class OnboardingVideoBase(BaseModel):
    """Base schema for onboarding video"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    video_url: str = Field(..., description="URL do vídeo (YouTube, Panda Video, etc)")
    provider: VideoProvider
    thumbnail_url: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, ge=1, description="Duração em minutos")


class OnboardingVideoCreate(OnboardingVideoBase):
    """Schema for creating a video"""
    order: int = Field(default=0, ge=0, description="Ordem de exibição")
    is_active: bool = Field(default=True)
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Bem-vindo ao Grupo Union",
                "description": "Vídeo de boas-vindas e introdução à plataforma",
                "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "provider": "YOUTUBE",
                "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
                "duration_minutes": 10,
                "order": 1,
                "is_active": True
            }
        }


class OnboardingVideoUpdate(BaseModel):
    """Schema for updating a video"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    video_url: Optional[str] = None
    provider: Optional[VideoProvider] = None
    thumbnail_url: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class OnboardingVideoResponse(OnboardingVideoBase):
    """Schema for video response"""
    id: str
    order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class VideoProgressBase(BaseModel):
    """Base schema for video progress"""
    video_id: str
    completed: bool = False


class VideoProgressCreate(VideoProgressBase):
    """Schema for creating video progress"""
    pass


class VideoProgressUpdate(BaseModel):
    """Schema for updating video progress"""
    completed: bool
    
    class Config:
        json_schema_extra = {
            "example": {
                "completed": True
            }
        }


class VideoProgressResponse(BaseModel):
    """Schema for video progress response"""
    id: str
    user_id: str
    video_id: str
    completed: bool
    completed_at: Optional[datetime]
    started_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class OnboardingVideoWithProgress(OnboardingVideoResponse):
    """Video with user progress"""
    user_progress: Optional[VideoProgressResponse] = None
    
    class Config:
        from_attributes = True
