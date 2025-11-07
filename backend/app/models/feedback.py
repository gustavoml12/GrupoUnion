from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Feedback(Base):
    """Feedback model - Quality feedback on referrals"""
    __tablename__ = "feedbacks"

    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    referral_id = Column(String, ForeignKey("referrals.id"), nullable=False, unique=True)
    given_by = Column(String, ForeignKey("members.id"), nullable=False)
    
    # Feedback
    was_well_served = Column(Boolean, nullable=False)  # Cliente foi bem atendido?
    quality_rating = Column(Integer, nullable=False)  # 1-5 estrelas
    comments = Column(Text, nullable=True)
    
    # Deal Info
    deal_closed = Column(Boolean, default=False)
    deal_value = Column(Float, nullable=True)  # Valor do negócio (opcional)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    referral = relationship("Referral", backref="feedback")
    member = relationship("Member", foreign_keys=[given_by], backref="feedbacks_given")
    
    def __repr__(self):
        return f"<Feedback for Referral {self.referral_id}>"
