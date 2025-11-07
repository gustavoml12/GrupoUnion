"""
Notification Model
"""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.database import Base


class NotificationType(str, Enum):
    """Notification type enum"""
    MEMBER_APPROVED = "MEMBER_APPROVED"  # Cadastro aprovado
    MEMBER_REJECTED = "MEMBER_REJECTED"  # Cadastro reprovado
    MEETING_CONFIRMED = "MEETING_CONFIRMED"  # Reunião confirmada
    MEETING_CANCELLED = "MEETING_CANCELLED"  # Reunião cancelada
    MEETING_REMINDER = "MEETING_REMINDER"  # Lembrete de reunião
    NEW_VIDEO = "NEW_VIDEO"  # Novo vídeo disponível
    REFERRAL_APPROVED = "REFERRAL_APPROVED"  # Indicação aprovada
    SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT"  # Anúncio do sistema
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED"  # Pagamento confirmado
    PAYMENT_REJECTED = "PAYMENT_REJECTED"  # Pagamento rejeitado


class NotificationPriority(str, Enum):
    """Notification priority enum"""
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"


class Notification(Base):
    """Notification model for user notifications"""
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Relationships
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Notification details
    type = Column(SQLEnum(NotificationType), nullable=False)
    priority = Column(SQLEnum(NotificationPriority), nullable=False, default=NotificationPriority.NORMAL)
    
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    
    # Optional link to related resource
    action_url = Column(String, nullable=True)  # URL para ação (ex: /meetings/123)
    action_label = Column(String, nullable=True)  # Label do botão (ex: "Ver Reunião")
    
    # Related entity IDs (for reference)
    related_entity_type = Column(String, nullable=True)  # Ex: "meeting", "video", "member"
    related_entity_id = Column(String, nullable=True)
    
    # Status
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)  # Notificações podem expirar
    
    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.id} - {self.type} - User {self.user_id}>"

    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.read_at = datetime.utcnow()
