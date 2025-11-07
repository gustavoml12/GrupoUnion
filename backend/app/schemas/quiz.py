"""
Quiz Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Quiz Option Schemas

class QuizOptionBase(BaseModel):
    """Base schema for quiz option"""
    option_text: str = Field(..., min_length=1)
    is_correct: bool = False
    order: int = Field(default=0, ge=0)


class QuizOptionCreate(QuizOptionBase):
    """Schema for creating a quiz option"""
    pass


class QuizOptionResponse(QuizOptionBase):
    """Schema for quiz option response"""
    id: str
    question_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuizOptionPublic(BaseModel):
    """Public schema for quiz option (without correct answer)"""
    id: str
    option_text: str
    order: int
    
    class Config:
        from_attributes = True


# Quiz Question Schemas

class QuizQuestionBase(BaseModel):
    """Base schema for quiz question"""
    question_text: str = Field(..., min_length=1)
    order: int = Field(default=0, ge=0)
    is_active: bool = True


class QuizQuestionCreate(QuizQuestionBase):
    """Schema for creating a quiz question with options"""
    video_id: str
    options: List[QuizOptionCreate] = Field(..., min_items=2, max_items=6)
    
    class Config:
        json_schema_extra = {
            "example": {
                "video_id": "video-uuid",
                "question_text": "Qual é o principal objetivo do Grupo Union?",
                "order": 1,
                "is_active": True,
                "options": [
                    {"option_text": "Networking empresarial qualificado", "is_correct": True, "order": 0},
                    {"option_text": "Vender produtos", "is_correct": False, "order": 1},
                    {"option_text": "Fazer eventos sociais", "is_correct": False, "order": 2},
                    {"option_text": "Consultoria empresarial", "is_correct": False, "order": 3}
                ]
            }
        }


class QuizQuestionUpdate(BaseModel):
    """Schema for updating a quiz question"""
    question_text: Optional[str] = Field(None, min_length=1)
    order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class QuizQuestionResponse(QuizQuestionBase):
    """Schema for quiz question response (with correct answers - for admin)"""
    id: str
    video_id: str
    options: List[QuizOptionResponse]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QuizQuestionPublic(BaseModel):
    """Public schema for quiz question (without correct answers - for users)"""
    id: str
    question_text: str
    order: int
    options: List[QuizOptionPublic]
    
    class Config:
        from_attributes = True


# Quiz Answer Schemas

class QuizAnswerSubmit(BaseModel):
    """Schema for submitting a quiz answer"""
    question_id: str
    selected_option_id: str


class QuizAnswerResponse(BaseModel):
    """Schema for quiz answer response"""
    id: str
    user_id: str
    question_id: str
    selected_option_id: str
    is_correct: bool
    answered_at: datetime
    
    class Config:
        from_attributes = True


class QuizAnswerFeedback(BaseModel):
    """Schema for quiz answer feedback"""
    is_correct: bool
    correct_option_id: str
    explanation: Optional[str] = None


class QuizResultSummary(BaseModel):
    """Schema for quiz results summary"""
    video_id: str
    total_questions: int
    answered_questions: int
    correct_answers: int
    score_percentage: float
    passed: bool  # True if score >= 70%
