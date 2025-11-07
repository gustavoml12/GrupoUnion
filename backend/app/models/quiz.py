"""
Quiz Models - Questions and Answers for Videos
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class QuizQuestion(Base):
    """Quiz question for a video"""
    __tablename__ = "quiz_questions"
    
    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Key
    video_id = Column(String, ForeignKey('onboarding_videos.id', ondelete='CASCADE'), nullable=False)
    
    # Question Info
    question_text = Column(Text, nullable=False)
    order = Column(Integer, nullable=False, default=0)  # Ordem da pergunta
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    video = relationship("OnboardingVideo", backref="questions")
    options = relationship("QuizOption", back_populates="question", cascade="all, delete-orphan")
    user_answers = relationship("QuizAnswer", back_populates="question", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<QuizQuestion {self.question_text[:50]}>"


class QuizOption(Base):
    """Multiple choice option for a question"""
    __tablename__ = "quiz_options"
    
    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Key
    question_id = Column(String, ForeignKey('quiz_questions.id', ondelete='CASCADE'), nullable=False)
    
    # Option Info
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    order = Column(Integer, nullable=False, default=0)  # Ordem da opção (A, B, C, D)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    question = relationship("QuizQuestion", back_populates="options")
    
    def __repr__(self):
        return f"<QuizOption {self.option_text[:30]} - Correct: {self.is_correct}>"


class QuizAnswer(Base):
    """User's answer to a quiz question"""
    __tablename__ = "quiz_answers"
    
    # Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    question_id = Column(String, ForeignKey('quiz_questions.id', ondelete='CASCADE'), nullable=False)
    selected_option_id = Column(String, ForeignKey('quiz_options.id', ondelete='CASCADE'), nullable=False)
    
    # Answer Info
    is_correct = Column(Boolean, nullable=False)
    
    # Timestamps
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="quiz_answers")
    question = relationship("QuizQuestion", back_populates="user_answers")
    selected_option = relationship("QuizOption")
    
    def __repr__(self):
        return f"<QuizAnswer user={self.user_id} correct={self.is_correct}>"
