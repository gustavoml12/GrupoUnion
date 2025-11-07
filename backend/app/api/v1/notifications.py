"""
Notifications API
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
    NotificationStats
)
from app.services import notification as notification_service
from app.api.dependencies import get_current_active_user, require_role


router = APIRouter(prefix="/notifications", tags=["notifications"])


# User Routes

@router.get("/me", response_model=List[NotificationResponse])
def get_my_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get notifications for current user
    """
    notifications = notification_service.get_user_notifications(
        db,
        current_user.id,
        unread_only=unread_only,
        limit=limit,
        offset=offset
    )
    return notifications


@router.get("/me/stats", response_model=NotificationStats)
def get_my_notification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get notification statistics for current user
    """
    stats = notification_service.get_notification_stats(db, current_user.id)
    return stats


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark a notification as read
    """
    notification = notification_service.get_notification_by_id(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    # Verify ownership
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar esta notificação"
        )
    
    updated_notification = notification_service.mark_as_read(db, notification_id)
    return updated_notification


@router.post("/me/read-all", status_code=status.HTTP_200_OK)
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark all notifications as read for current user
    """
    count = notification_service.mark_all_as_read(db, current_user.id)
    return {"message": f"{count} notificações marcadas como lidas"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a notification
    """
    notification = notification_service.get_notification_by_id(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    # Verify ownership
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para deletar esta notificação"
        )
    
    notification_service.delete_notification(db, notification_id)
    return None


# Admin Routes

@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Create a notification (admin only)
    Requires: HUB or ADMIN role
    """
    notification_data = notification.model_dump()
    new_notification = notification_service.create_notification(db, notification_data)
    return new_notification


@router.post("/broadcast", status_code=status.HTTP_201_CREATED)
def broadcast_notification(
    title: str = Query(..., min_length=1, max_length=200),
    message: str = Query(..., min_length=1, max_length=1000),
    target_role: str = Query(None, description="Target specific role (MEMBER, VISITOR, etc)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """
    Broadcast a notification to all users or specific role
    Requires: ADMIN role
    """
    from app.models.user import User, UserRole
    
    # Get target users
    query = db.query(User)
    if target_role:
        try:
            role_enum = UserRole[target_role.upper()]
            query = query.filter(User.role == role_enum)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role inválido: {target_role}"
            )
    
    users = query.all()
    user_ids = [user.id for user in users]
    
    if not user_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum usuário encontrado para o filtro especificado"
        )
    
    # Create notifications
    notifications = notification_service.notify_system_announcement(
        db,
        user_ids,
        title,
        message
    )
    
    return {
        "message": f"Notificação enviada para {len(notifications)} usuários",
        "count": len(notifications)
    }


@router.delete("/cleanup", status_code=status.HTTP_200_OK)
def cleanup_old_notifications(
    days: int = Query(30, ge=1, le=365, description="Delete notifications older than X days"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """
    Delete old notifications (admin only)
    Requires: ADMIN role
    """
    count = notification_service.delete_old_notifications(db, days)
    return {"message": f"{count} notificações antigas deletadas"}
