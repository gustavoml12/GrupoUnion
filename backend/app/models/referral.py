import enum
from datetime import datetime
from sqlalchemy import Column, String, Enum as SQLEnum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Qualification(str, enum.Enum):
    """Referral qualification level"""
    HOT = "HOT"  # Quente - Cliente pronto para fechar
    WARM = "WARM"  # Morno - Cliente interessado
    COLD = "COLD"  # Frio - Cliente em prospecção


class ReferralStatus(str, enum.Enum):
    """Referral status in pipeline"""
    PENDING = "PENDING"  # Pendente - Ainda não contatado
    CONTACTED = "CONTACTED"  # Contato feito
    NEGOTIATING = "NEGOTIATING"  # Em negociação
    WON = "WON"  # Ganho - Negócio fechado
    LOST = "LOST"  # Perdido - Não fechou
    CANCELLED = "CANCELLED"  # Cancelado


class Referral(Base):
    """Referral model - Business referrals between members"""
    __tablename__ = "referrals"

    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    from_member_id = Column(String, ForeignKey("members.id"), nullable=False)
    to_member_id = Column(String, ForeignKey("members.id"), nullable=False)
    
    # Client Info
    client_name = Column(String, nullable=False)
    client_company = Column(String, nullable=True)
    client_phone = Column(String, nullable=False)
    client_email = Column(String, nullable=True)
    
    # Referral Details
    qualification = Column(SQLEnum(Qualification), nullable=False)
    context = Column(Text, nullable=False)  # Por que está indicando
    client_need = Column(Text, nullable=True)  # Necessidade específica
    
    # Status
    status = Column(SQLEnum(ReferralStatus), default=ReferralStatus.PENDING, nullable=False)
    
    # Tracking
    contacted_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    from_member = relationship("Member", foreign_keys=[from_member_id], backref="referrals_given")
    to_member = relationship("Member", foreign_keys=[to_member_id], backref="referrals_received")
    
    def __repr__(self):
        return f"<Referral {self.client_name} -> {self.to_member_id}>"
