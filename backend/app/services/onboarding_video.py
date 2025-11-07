"""
Onboarding Video Service
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.onboarding_video import OnboardingVideo
from app.models.video_progress import VideoProgress
from app.models.user import User


def create_video(db: Session, video_data: Dict[str, Any]) -> OnboardingVideo:
    """Create a new onboarding video"""
    video = OnboardingVideo(**video_data)
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


def get_video_by_id(db: Session, video_id: str) -> Optional[OnboardingVideo]:
    """Get video by ID"""
    return db.query(OnboardingVideo).filter(OnboardingVideo.id == video_id).first()


def get_all_videos(db: Session, include_inactive: bool = False) -> List[OnboardingVideo]:
    """Get all videos ordered by order field"""
    query = db.query(OnboardingVideo)
    
    if not include_inactive:
        query = query.filter(OnboardingVideo.is_active == True)
    
    return query.order_by(OnboardingVideo.order).all()


def update_video(db: Session, video_id: str, video_data: Dict[str, Any]) -> OnboardingVideo:
    """Update video information"""
    video = get_video_by_id(db, video_id)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vídeo não encontrado"
        )
    
    for field, value in video_data.items():
        if value is not None and hasattr(video, field):
            setattr(video, field, value)
    
    db.commit()
    db.refresh(video)
    return video


def delete_video(db: Session, video_id: str) -> bool:
    """Delete a video"""
    video = get_video_by_id(db, video_id)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vídeo não encontrado"
        )
    
    db.delete(video)
    db.commit()
    return True


def reorder_videos(db: Session, video_orders: List[Dict[str, Any]]) -> List[OnboardingVideo]:
    """
    Reorder videos
    video_orders: [{"id": "video_id", "order": 1}, ...]
    """
    updated_videos = []
    
    for item in video_orders:
        video = get_video_by_id(db, item["id"])
        if video:
            video.order = item["order"]
            updated_videos.append(video)
    
    db.commit()
    
    for video in updated_videos:
        db.refresh(video)
    
    return updated_videos


# Video Progress Functions

def get_user_progress(db: Session, user_id: str, video_id: str) -> Optional[VideoProgress]:
    """Get user progress for a specific video"""
    return db.query(VideoProgress).filter(
        and_(
            VideoProgress.user_id == user_id,
            VideoProgress.video_id == video_id
        )
    ).first()


def get_all_user_progress(db: Session, user_id: str) -> List[VideoProgress]:
    """Get all video progress for a user"""
    return db.query(VideoProgress).filter(VideoProgress.user_id == user_id).all()


def mark_video_started(db: Session, user_id: str, video_id: str) -> VideoProgress:
    """Mark video as started by user"""
    # Check if progress already exists
    progress = get_user_progress(db, user_id, video_id)
    
    if progress:
        return progress
    
    # Create new progress
    progress = VideoProgress(
        user_id=user_id,
        video_id=video_id,
        completed=False
    )
    
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress


def mark_video_completed(db: Session, user_id: str, video_id: str) -> VideoProgress:
    """Mark video as completed by user"""
    progress = get_user_progress(db, user_id, video_id)
    
    if not progress:
        # Create progress if doesn't exist
        progress = VideoProgress(
            user_id=user_id,
            video_id=video_id,
            completed=True,
            completed_at=datetime.utcnow()
        )
        db.add(progress)
    else:
        # Update existing progress
        progress.completed = True
        progress.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(progress)
    return progress


def get_videos_with_progress(db: Session, user_id: str) -> List[Dict[str, Any]]:
    """Get all videos with user progress"""
    videos = get_all_videos(db, include_inactive=False)
    result = []
    
    for video in videos:
        progress = get_user_progress(db, user_id, video.id)
        
        video_dict = {
            "id": video.id,
            "title": video.title,
            "description": video.description,
            "video_url": video.video_url,
            "provider": video.provider.value,
            "thumbnail_url": video.thumbnail_url,
            "duration_minutes": video.duration_minutes,
            "order": video.order,
            "is_active": video.is_active,
            "created_at": video.created_at,
            "updated_at": video.updated_at,
            "user_progress": None
        }
        
        if progress:
            video_dict["user_progress"] = {
                "id": progress.id,
                "user_id": progress.user_id,
                "video_id": progress.video_id,
                "completed": progress.completed,
                "completed_at": progress.completed_at,
                "started_at": progress.started_at,
                "updated_at": progress.updated_at
            }
        
        result.append(video_dict)
    
    return result


def get_user_completion_stats(db: Session, user_id: str) -> Dict[str, Any]:
    """Get user video completion statistics"""
    all_videos = get_all_videos(db, include_inactive=False)
    user_progress = get_all_user_progress(db, user_id)
    
    total_videos = len(all_videos)
    completed_videos = sum(1 for p in user_progress if p.completed)
    
    completion_percentage = (completed_videos / total_videos * 100) if total_videos > 0 else 0
    
    return {
        "total_videos": total_videos,
        "completed_videos": completed_videos,
        "pending_videos": total_videos - completed_videos,
        "completion_percentage": round(completion_percentage, 2)
    }
