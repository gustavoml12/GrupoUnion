"""
Onboarding Videos API
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.onboarding_video import (
    OnboardingVideoCreate,
    OnboardingVideoUpdate,
    OnboardingVideoResponse,
    OnboardingVideoWithProgress,
    VideoProgressUpdate,
    VideoProgressResponse
)
from app.services import onboarding_video as video_service
from app.api.dependencies import get_current_active_user, require_role


router = APIRouter(prefix="/onboarding-videos", tags=["onboarding-videos"])


# Admin/Hub Routes - Video Management

@router.post("", response_model=OnboardingVideoResponse, status_code=status.HTTP_201_CREATED)
def create_video(
    video: OnboardingVideoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Create a new onboarding video
    Requires: HUB or ADMIN role
    """
    video_data = video.model_dump()
    new_video = video_service.create_video(db, video_data)
    return new_video


@router.get("/all", response_model=List[OnboardingVideoResponse])
def get_all_videos_admin(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get all videos (for admin management)
    Requires: HUB or ADMIN role
    """
    videos = video_service.get_all_videos(db, include_inactive=include_inactive)
    return videos


@router.get("/{video_id}", response_model=OnboardingVideoResponse)
def get_video(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get video by ID"""
    video = video_service.get_video_by_id(db, video_id)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vídeo não encontrado"
        )
    return video


@router.patch("/{video_id}", response_model=OnboardingVideoResponse)
def update_video(
    video_id: str,
    video_data: OnboardingVideoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Update video information
    Requires: HUB or ADMIN role
    """
    update_dict = video_data.model_dump(exclude_unset=True)
    updated_video = video_service.update_video(db, video_id, update_dict)
    return updated_video


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Delete a video
    Requires: HUB or ADMIN role
    """
    video_service.delete_video(db, video_id)
    return None


# Member Routes - Video Viewing

@router.get("", response_model=List[OnboardingVideoWithProgress])
def get_videos_for_member(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all active videos with user progress
    Available to all authenticated users
    """
    videos_with_progress = video_service.get_videos_with_progress(db, current_user.id)
    return videos_with_progress


@router.post("/{video_id}/start", response_model=VideoProgressResponse)
def mark_video_started(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark video as started"""
    # Verify video exists
    video = video_service.get_video_by_id(db, video_id)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vídeo não encontrado"
        )
    
    progress = video_service.mark_video_started(db, current_user.id, video_id)
    return progress


@router.post("/{video_id}/complete", response_model=VideoProgressResponse)
def mark_video_completed(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark video as completed"""
    # Verify video exists
    video = video_service.get_video_by_id(db, video_id)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vídeo não encontrado"
        )
    
    progress = video_service.mark_video_completed(db, current_user.id, video_id)
    return progress


@router.get("/stats/me")
def get_my_completion_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's video completion statistics"""
    stats = video_service.get_user_completion_stats(db, current_user.id)
    return stats
