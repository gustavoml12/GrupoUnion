"""
Notification Service
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from fastapi import HTTPException, status

from app.models.notification import Notification, NotificationType, NotificationPriority
from app.models.user import User


def create_notification(db: Session, notification_data: Dict[str, Any]) -> Notification:
    """Create a new notification"""
    notification = Notification(**notification_data)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def create_bulk_notifications(db: Session, notifications_data: List[Dict[str, Any]]) -> List[Notification]:
    """Create multiple notifications at once"""
    notifications = [Notification(**data) for data in notifications_data]
    db.add_all(notifications)
    db.commit()
    for notification in notifications:
        db.refresh(notification)
    return notifications


def get_notification_by_id(db: Session, notification_id: str) -> Optional[Notification]:
    """Get notification by ID"""
    return db.query(Notification).filter(Notification.id == notification_id).first()


def get_user_notifications(
    db: Session,
    user_id: str,
    unread_only: bool = False,
    limit: int = 50,
    offset: int = 0
) -> List[Notification]:
    """Get notifications for a user"""
    query = db.query(Notification).filter(Notification.user_id == user_id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Filter out expired notifications
    query = query.filter(
        or_(
            Notification.expires_at.is_(None),
            Notification.expires_at > datetime.utcnow()
        )
    )
    
    return query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()


def mark_as_read(db: Session, notification_id: str) -> Notification:
    """Mark a notification as read"""
    notification = get_notification_by_id(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    notification.mark_as_read()
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_as_read(db: Session, user_id: str) -> int:
    """Mark all notifications as read for a user"""
    count = db.query(Notification).filter(
        and_(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    db.commit()
    return count


def delete_notification(db: Session, notification_id: str) -> bool:
    """Delete a notification"""
    notification = get_notification_by_id(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    db.delete(notification)
    db.commit()
    return True


def delete_old_notifications(db: Session, days: int = 30) -> int:
    """Delete notifications older than X days"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    count = db.query(Notification).filter(
        Notification.created_at < cutoff_date
    ).delete()
    db.commit()
    return count


def get_notification_stats(db: Session, user_id: str) -> Dict[str, Any]:
    """Get notification statistics for a user"""
    total = db.query(Notification).filter(Notification.user_id == user_id).count()
    unread = db.query(Notification).filter(
        and_(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
    ).count()
    
    # Count by type
    by_type = db.query(
        Notification.type,
        func.count(Notification.id)
    ).filter(
        Notification.user_id == user_id
    ).group_by(Notification.type).all()
    
    notifications_by_type = {str(type_): count for type_, count in by_type}
    
    return {
        "total_notifications": total,
        "unread_notifications": unread,
        "read_notifications": total - unread,
        "notifications_by_type": notifications_by_type
    }


# Helper functions to create specific notification types

def notify_member_approved(db: Session, user_id: str, member_name: str) -> Notification:
    """Create notification for member approval"""
    return create_notification(db, {
        "user_id": user_id,
        "type": NotificationType.MEMBER_APPROVED,
        "priority": NotificationPriority.HIGH,
        "title": "🎉 Cadastro Aprovado!",
        "message": f"Parabéns {member_name}! Seu cadastro foi aprovado. Agora você é um membro oficial do Grupo Union!",
        "action_url": "/dashboard",
        "action_label": "Ir para Dashboard"
    })


def notify_member_rejected(db: Session, user_id: str, member_name: str, reason: Optional[str] = None) -> Notification:
    """Create notification for member rejection"""
    message = f"Olá {member_name}, infelizmente seu cadastro não foi aprovado."
    if reason:
        message += f" Motivo: {reason}"
    
    return create_notification(db, {
        "user_id": user_id,
        "type": NotificationType.MEMBER_REJECTED,
        "priority": NotificationPriority.HIGH,
        "title": "❌ Cadastro Não Aprovado",
        "message": message
    })


def notify_meeting_confirmed(
    db: Session,
    user_id: str,
    meeting_id: str,
    meeting_date: str,
    meeting_link: Optional[str] = None,
    location: Optional[str] = None
) -> Notification:
    """Create notification for meeting confirmation"""
    message = f"Sua reunião foi confirmada para {meeting_date}."
    if meeting_link:
        message += f" Link: {meeting_link}"
    elif location:
        message += f" Local: {location}"
    
    return create_notification(db, {
        "user_id": user_id,
        "type": NotificationType.MEETING_CONFIRMED,
        "priority": NotificationPriority.HIGH,
        "title": "✅ Reunião Confirmada",
        "message": message,
        "action_url": f"/meetings/schedule",
        "action_label": "Ver Reunião",
        "related_entity_type": "meeting",
        "related_entity_id": meeting_id
    })


def notify_meeting_cancelled(
    db: Session,
    user_id: str,
    meeting_id: str,
    reason: str
) -> Notification:
    """Create notification for meeting cancellation"""
    return create_notification(db, {
        "user_id": user_id,
        "type": NotificationType.MEETING_CANCELLED,
        "priority": NotificationPriority.HIGH,
        "title": "❌ Reunião Cancelada",
        "message": f"Sua reunião foi cancelada. Motivo: {reason}",
        "action_url": "/meetings/schedule",
        "action_label": "Agendar Nova Reunião",
        "related_entity_type": "meeting",
        "related_entity_id": meeting_id
    })


def notify_new_video(db: Session, user_ids: List[str], video_id: str, video_title: str) -> List[Notification]:
    """Create notifications for new video (bulk)"""
    notifications_data = [
        {
            "user_id": user_id,
            "type": NotificationType.NEW_VIDEO,
            "priority": NotificationPriority.NORMAL,
            "title": "🎥 Novo Vídeo Disponível",
            "message": f"Um novo vídeo foi adicionado: {video_title}",
            "action_url": "/onboarding/videos",
            "action_label": "Assistir Agora",
            "related_entity_type": "video",
            "related_entity_id": video_id
        }
        for user_id in user_ids
    ]
    return create_bulk_notifications(db, notifications_data)


def notify_referral_approved(db: Session, user_id: str, referred_name: str) -> Notification:
    """Create notification for referral approval"""
    return create_notification(db, {
        "user_id": user_id,
        "type": NotificationType.REFERRAL_APPROVED,
        "priority": NotificationPriority.NORMAL,
        "title": "🎁 Indicação Aprovada!",
        "message": f"Sua indicação {referred_name} foi aprovada e agora é um membro!",
        "action_url": "/dashboard",
        "action_label": "Ver Dashboard"
    })


def notify_payment_confirmed(db: Session, user_id: str, amount: float) -> Notification:
    """Create notification for payment confirmation"""
    return create_notification(db, {
        "user_id": user_id,
        "type": NotificationType.PAYMENT_CONFIRMED,
        "priority": NotificationPriority.HIGH,
        "title": "💰 Pagamento Confirmado",
        "message": f"Seu pagamento de R$ {amount:.2f} foi confirmado!",
        "action_url": "/dashboard",
        "action_label": "Ver Dashboard"
    })


def notify_system_announcement(db: Session, user_ids: List[str], title: str, message: str) -> List[Notification]:
    """Create system announcement notifications (bulk)"""
    notifications_data = [
        {
            "user_id": user_id,
            "type": NotificationType.SYSTEM_ANNOUNCEMENT,
            "priority": NotificationPriority.NORMAL,
            "title": title,
            "message": message
        }
        for user_id in user_ids
    ]
    return create_bulk_notifications(db, notifications_data)
