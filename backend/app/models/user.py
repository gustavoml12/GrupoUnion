import enum
import secrets
from datetime import datetime
from sqlalchemy import Column, String, Enum as SQLEnum, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class UserRole(str, enum.Enum):
    """User roles"""
    VISITOR = "VISITOR"  # Visitante - Registrado mas não aprovado
    MEMBER = "MEMBER"    # Membro - Aprovado pelo Hub
    HUB = "HUB"          # Hub - Gestor do grupo
    ADMIN = "ADMIN"      # Admin - Administrador do sistema


class UserStatus(str, enum.Enum):
    """User status"""
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    INACTIVE = "INACTIVE"


class User(Base):
    """User model - Authentication and basic info"""
    __tablename__ = "users"

    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Authentication
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    
    # Role & Status
    role = Column(SQLEnum(UserRole), default=UserRole.VISITOR, nullable=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.PENDING, nullable=False)
    
    # Profile
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    # Referral System
    referral_code = Column(String, unique=True, nullable=False, index=True, default=lambda: secrets.token_urlsafe(8))
    referred_by_id = Column(String, ForeignKey('users.id'), nullable=True)
    
    # Security
    email_verified = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    referred_by = relationship("User", remote_side=[id], backref="referrals", foreign_keys=[referred_by_id])
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email}>"
