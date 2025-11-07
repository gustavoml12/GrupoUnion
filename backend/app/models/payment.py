import enum
from datetime import datetime
from sqlalchemy import Column, String, Enum as SQLEnum, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class PaymentStatus(str, enum.Enum):
    """Payment status"""
    PENDING = "PENDING"  # Aguardando pagamento
    PROOF_UPLOADED = "PROOF_UPLOADED"  # Comprovante enviado
    VERIFIED = "VERIFIED"  # Verificado pelo Hub
    REJECTED = "REJECTED"  # Rejeitado
    EXPIRED = "EXPIRED"  # Expirado


class PaymentType(str, enum.Enum):
    """Payment type"""
    ONBOARDING = "ONBOARDING"  # Taxa de entrada
    MONTHLY = "MONTHLY"  # Mensalidade
    ANNUAL = "ANNUAL"  # Anuidade


class Payment(Base):
    """Payment model - Member payments"""
    __tablename__ = "payments"

    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Key
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Payment Info
    payment_type = Column(SQLEnum(PaymentType), nullable=False)
    amount = Column(Float, nullable=False)  # Valor em reais
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    # PIX Info
    pix_key = Column(String, nullable=True)  # Chave PIX usada
    pix_qr_code = Column(Text, nullable=True)  # QR Code PIX (base64 ou URL)
    
    # Proof
    payment_proof_url = Column(String, nullable=True)  # URL do comprovante
    payment_date = Column(DateTime, nullable=True)  # Data do pagamento
    
    # Verification
    verified_by = Column(String, ForeignKey("users.id"), nullable=True)  # Hub que verificou
    verified_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Reference
    reference_month = Column(String, nullable=True)  # Ex: "2025-11" para mensalidades
    due_date = Column(DateTime, nullable=True)  # Data de vencimento
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    verifier = relationship("User", foreign_keys=[verified_by])
    
    def __repr__(self):
        return f"<Payment {self.id} - {self.payment_type} - {self.status}>"
