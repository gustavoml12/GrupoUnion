"""
Visit Model - Members visiting other members for networking
"""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.database import Base


class VisitPurpose(str, Enum):
    """Visit purpose enum"""
    CONHECER_SERVICOS = "CONHECER_SERVICOS"  # Conhecer serviços/produtos
    NETWORKING = "NETWORKING"  # Networking geral
    PARCERIA = "PARCERIA"  # Discutir parceria
    INDICACAO = "INDICACAO"  # Receber/fazer indicação
    FOLLOW_UP = "FOLLOW_UP"  # Follow-up de contato anterior
    OUTRO = "OUTRO"  # Outro motivo


class VisitStatus(str, Enum):
    """Visit status enum"""
    AGENDADA = "AGENDADA"  # Visita agendada
    REALIZADA = "REALIZADA"  # Visita realizada
    CANCELADA = "CANCELADA"  # Visita cancelada
    NAO_REALIZADA = "NAO_REALIZADA"  # Não compareceu


class Visit(Base):
    """Visit model - Members visiting other members"""
    __tablename__ = "visits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Who visits whom
    visitor_id = Column(String, ForeignKey('members.id', ondelete='CASCADE'), nullable=False)  # Quem visita
    visited_id = Column(String, ForeignKey('members.id', ondelete='CASCADE'), nullable=False)  # Quem é visitado
    
    # Visit details
    purpose = Column(SQLEnum(VisitPurpose), nullable=False)
    visit_date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)  # Duração em minutos
    location = Column(String, nullable=True)  # Local da visita
    
    # Status
    status = Column(SQLEnum(VisitStatus), default=VisitStatus.AGENDADA, nullable=False)
    
    # Notes and learnings
    visitor_notes = Column(Text, nullable=True)  # Notas do visitante (antes da visita)
    visit_summary = Column(Text, nullable=True)  # Resumo da visita (depois)
    services_learned = Column(Text, nullable=True)  # Serviços/produtos conhecidos
    potential_referrals = Column(Text, nullable=True)  # Potenciais indicações identificadas
    
    # Rating (1-5)
    networking_quality = Column(Integer, nullable=True)  # Qualidade do networking (1-5)
    
    # Follow-up
    follow_up_needed = Column(String, nullable=True)  # Ações de follow-up necessárias
    follow_up_date = Column(DateTime, nullable=True)  # Data para follow-up
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)  # Quando foi marcada como realizada
    
    # Relationships
    visitor = relationship("Member", foreign_keys=[visitor_id], backref="visits_made")
    visited = relationship("Member", foreign_keys=[visited_id], backref="visits_received")

    def __repr__(self):
        return f"<Visit {self.id} - {self.visitor_id} visits {self.visited_id}>"

    def mark_as_completed(self):
        """Mark visit as completed"""
        self.status = VisitStatus.REALIZADA
        self.completed_at = datetime.utcnow()
