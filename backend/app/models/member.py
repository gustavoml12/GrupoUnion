import enum
from datetime import datetime
from sqlalchemy import Column, String, Enum as SQLEnum, DateTime, Integer, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class MemberStatus(str, enum.Enum):
    """Member status in onboarding process"""
    LEAD = "LEAD"  # Preencheu formulário inicial
    PAYMENT_PENDING = "PAYMENT_PENDING"  # Aguardando pagamento
    PAYMENT_PROOF_UPLOADED = "PAYMENT_PROOF_UPLOADED"  # Comprovante enviado
    PENDING_APPROVAL = "PENDING_APPROVAL"  # Aguardando aprovação do Hub
    APPROVED = "APPROVED"  # Aprovado pelo Hub
    REJECTED = "REJECTED"  # Reprovado
    ACTIVE = "ACTIVE"  # Membro ativo
    SUSPENDED = "SUSPENDED"  # Suspenso temporariamente
    INACTIVE = "INACTIVE"  # Inativo


class BusinessCategory(str, enum.Enum):
    """Business categories"""
    TECNOLOGIA = "TECNOLOGIA"
    SAUDE = "SAUDE"
    EDUCACAO = "EDUCACAO"
    FINANCAS = "FINANCAS"
    MARKETING = "MARKETING"
    CONSULTORIA = "CONSULTORIA"
    CONSTRUCAO = "CONSTRUCAO"
    ALIMENTACAO = "ALIMENTACAO"
    VAREJO = "VAREJO"
    SERVICOS = "SERVICOS"
    INDUSTRIA = "INDUSTRIA"
    OUTROS = "OUTROS"


class Member(Base):
    """Member model - Business owner profile"""
    __tablename__ = "members"

    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Key
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Business Info
    company_name = Column(String, nullable=False)
    business_category = Column(SQLEnum(BusinessCategory), nullable=False)
    company_description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    
    # Contact
    business_phone = Column(String, nullable=True)
    business_email = Column(String, nullable=True)
    
    # Address
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    
    # Onboarding
    status = Column(SQLEnum(MemberStatus), default=MemberStatus.LEAD, nullable=False)
    application_reason = Column(Text, nullable=True)  # Por que quer participar
    videos_watched = Column(Integer, default=0)
    questionnaire_completed = Column(DateTime, nullable=True)
    meeting_scheduled = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Social Media
    linkedin_url = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    facebook_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    
    # Profile
    profile_photo_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    interests = Column(Text, nullable=True)  # Áreas de interesse (JSON ou texto separado por vírgula)
    skills = Column(Text, nullable=True)  # Habilidades
    profile_completed = Column(Integer, default=0)  # Porcentagem de completude do perfil (0-100)
    
    # Reputation
    reputation_score = Column(Float, default=0.0)
    total_referrals_given = Column(Integer, default=0)
    total_referrals_received = Column(Integer, default=0)
    total_deals_closed = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="member")
    meetings = relationship("Meeting", back_populates="member", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Member {self.company_name}>"
