"""
Quiz API
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.quiz import (
    QuizQuestionCreate,
    QuizQuestionUpdate,
    QuizQuestionResponse,
    QuizQuestionPublic,
    QuizOptionCreate,
    QuizOptionResponse,
    QuizAnswerSubmit,
    QuizAnswerResponse,
    QuizAnswerFeedback,
    QuizResultSummary
)
from app.services import quiz as quiz_service
from app.api.dependencies import get_current_active_user, require_role


router = APIRouter(prefix="/quiz", tags=["quiz"])


# Admin/Hub Routes - Question Management

@router.post("/questions", response_model=QuizQuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    question: QuizQuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Create a quiz question with options
    Requires: HUB or ADMIN role
    """
    question_data = question.model_dump()
    new_question = quiz_service.create_question_with_options(db, question_data)
    return new_question


@router.get("/videos/{video_id}/questions/admin", response_model=List[QuizQuestionResponse])
def get_video_questions_admin(
    video_id: str,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get all questions for a video (admin view with correct answers)
    Requires: HUB or ADMIN role
    """
    questions = quiz_service.get_questions_by_video(db, video_id, include_inactive)
    return questions


@router.patch("/questions/{question_id}", response_model=QuizQuestionResponse)
def update_question(
    question_id: str,
    question_data: QuizQuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Update question information
    Requires: HUB or ADMIN role
    """
    update_dict = question_data.model_dump(exclude_unset=True)
    updated_question = quiz_service.update_question(db, question_id, update_dict)
    return updated_question


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    question_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Delete a question
    Requires: HUB or ADMIN role
    """
    quiz_service.delete_question(db, question_id)
    return None


@router.post("/questions/{question_id}/options", response_model=QuizOptionResponse)
def add_option(
    question_id: str,
    option: QuizOptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Add a new option to a question
    Requires: HUB or ADMIN role
    """
    option_data = option.model_dump()
    new_option = quiz_service.create_option(db, question_id, option_data)
    return new_option


@router.patch("/options/{option_id}", response_model=QuizOptionResponse)
def update_option(
    option_id: str,
    option_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Update an option
    Requires: HUB or ADMIN role
    """
    updated_option = quiz_service.update_option(db, option_id, option_data)
    return updated_option


@router.delete("/options/{option_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_option(
    option_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Delete an option
    Requires: HUB or ADMIN role
    """
    quiz_service.delete_option(db, option_id)
    return None


# User Routes - Taking Quiz

@router.get("/videos/{video_id}/questions", response_model=List[QuizQuestionPublic])
def get_video_questions(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all active questions for a video (without correct answers)
    Available to all authenticated users
    """
    questions = quiz_service.get_questions_by_video(db, video_id, include_inactive=False)
    
    # Convert to public format (without correct answers)
    public_questions = []
    for q in questions:
        public_q = {
            "id": q.id,
            "question_text": q.question_text,
            "order": q.order,
            "options": [
                {
                    "id": opt.id,
                    "option_text": opt.option_text,
                    "order": opt.order
                }
                for opt in sorted(q.options, key=lambda x: x.order)
            ]
        }
        public_questions.append(public_q)
    
    return public_questions


@router.post("/answers", response_model=QuizAnswerFeedback)
def submit_answer(
    answer: QuizAnswerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Submit an answer to a quiz question
    """
    user_answer = quiz_service.submit_answer(
        db,
        current_user.id,
        answer.question_id,
        answer.selected_option_id
    )
    
    # Get correct option for feedback
    question = quiz_service.get_question_by_id(db, answer.question_id)
    correct_option = next((opt for opt in question.options if opt.is_correct), None)
    
    return {
        "is_correct": user_answer.is_correct,
        "correct_option_id": correct_option.id if correct_option else None,
        "explanation": None
    }


@router.get("/videos/{video_id}/results", response_model=QuizResultSummary)
def get_quiz_results(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get quiz results for current user and video
    """
    results = quiz_service.get_quiz_results(db, current_user.id, video_id)
    return results
