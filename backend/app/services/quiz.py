"""
Quiz Service
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.quiz import QuizQuestion, QuizOption, QuizAnswer
from app.models.onboarding_video import OnboardingVideo


def create_question_with_options(db: Session, question_data: Dict[str, Any]) -> QuizQuestion:
    """Create a quiz question with its options"""
    # Extract options from question data
    options_data = question_data.pop('options', [])
    
    # Validate at least one correct answer
    correct_count = sum(1 for opt in options_data if opt.get('is_correct', False))
    if correct_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pelo menos uma opção deve ser marcada como correta"
        )
    
    if correct_count > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas uma opção pode ser marcada como correta"
        )
    
    # Create question
    question = QuizQuestion(**question_data)
    db.add(question)
    db.flush()  # Get question ID
    
    # Create options
    for opt_data in options_data:
        option = QuizOption(
            question_id=question.id,
            **opt_data
        )
        db.add(option)
    
    db.commit()
    db.refresh(question)
    return question


def get_question_by_id(db: Session, question_id: str) -> Optional[QuizQuestion]:
    """Get question by ID with options"""
    return db.query(QuizQuestion).filter(QuizQuestion.id == question_id).first()


def get_questions_by_video(db: Session, video_id: str, include_inactive: bool = False) -> List[QuizQuestion]:
    """Get all questions for a video"""
    query = db.query(QuizQuestion).filter(QuizQuestion.video_id == video_id)
    
    if not include_inactive:
        query = query.filter(QuizQuestion.is_active == True)
    
    return query.order_by(QuizQuestion.order).all()


def update_question(db: Session, question_id: str, question_data: Dict[str, Any]) -> QuizQuestion:
    """Update question information"""
    question = get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pergunta não encontrada"
        )
    
    for field, value in question_data.items():
        if value is not None and hasattr(question, field):
            setattr(question, field, value)
    
    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question_id: str) -> bool:
    """Delete a question and its options"""
    question = get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pergunta não encontrada"
        )
    
    db.delete(question)
    db.commit()
    return True


def update_option(db: Session, option_id: str, option_data: Dict[str, Any]) -> QuizOption:
    """Update a quiz option"""
    option = db.query(QuizOption).filter(QuizOption.id == option_id).first()
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opção não encontrada"
        )
    
    # If marking as correct, unmark others
    if option_data.get('is_correct', False):
        db.query(QuizOption).filter(
            and_(
                QuizOption.question_id == option.question_id,
                QuizOption.id != option_id
            )
        ).update({'is_correct': False})
    
    for field, value in option_data.items():
        if value is not None and hasattr(option, field):
            setattr(option, field, value)
    
    db.commit()
    db.refresh(option)
    return option


def delete_option(db: Session, option_id: str) -> bool:
    """Delete a quiz option"""
    option = db.query(QuizOption).filter(QuizOption.id == option_id).first()
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opção não encontrada"
        )
    
    # Check if question will have at least 2 options after deletion
    remaining_options = db.query(QuizOption).filter(
        and_(
            QuizOption.question_id == option.question_id,
            QuizOption.id != option_id
        )
    ).count()
    
    if remaining_options < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pergunta deve ter pelo menos 2 opções"
        )
    
    db.delete(option)
    db.commit()
    return True


def create_option(db: Session, question_id: str, option_data: Dict[str, Any]) -> QuizOption:
    """Add a new option to a question"""
    question = get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pergunta não encontrada"
        )
    
    # If marking as correct, unmark others
    if option_data.get('is_correct', False):
        db.query(QuizOption).filter(
            QuizOption.question_id == question_id
        ).update({'is_correct': False})
    
    option = QuizOption(
        question_id=question_id,
        **option_data
    )
    db.add(option)
    db.commit()
    db.refresh(option)
    return option


# User Answer Functions

def submit_answer(db: Session, user_id: str, question_id: str, selected_option_id: str) -> QuizAnswer:
    """Submit user's answer to a question"""
    # Verify question exists
    question = get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pergunta não encontrada"
        )
    
    # Verify option exists and belongs to question
    option = db.query(QuizOption).filter(
        and_(
            QuizOption.id == selected_option_id,
            QuizOption.question_id == question_id
        )
    ).first()
    
    if not option:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Opção inválida para esta pergunta"
        )
    
    # Check if user already answered this question
    existing_answer = db.query(QuizAnswer).filter(
        and_(
            QuizAnswer.user_id == user_id,
            QuizAnswer.question_id == question_id
        )
    ).first()
    
    if existing_answer:
        # Update existing answer
        existing_answer.selected_option_id = selected_option_id
        existing_answer.is_correct = option.is_correct
        db.commit()
        db.refresh(existing_answer)
        return existing_answer
    
    # Create new answer
    answer = QuizAnswer(
        user_id=user_id,
        question_id=question_id,
        selected_option_id=selected_option_id,
        is_correct=option.is_correct
    )
    
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


def get_user_answers_for_video(db: Session, user_id: str, video_id: str) -> List[QuizAnswer]:
    """Get all user answers for a video's questions"""
    questions = get_questions_by_video(db, video_id)
    question_ids = [q.id for q in questions]
    
    return db.query(QuizAnswer).filter(
        and_(
            QuizAnswer.user_id == user_id,
            QuizAnswer.question_id.in_(question_ids)
        )
    ).all()


def get_quiz_results(db: Session, user_id: str, video_id: str) -> Dict[str, Any]:
    """Get quiz results summary for a user and video"""
    questions = get_questions_by_video(db, video_id)
    answers = get_user_answers_for_video(db, user_id, video_id)
    
    total_questions = len(questions)
    answered_questions = len(answers)
    correct_answers = sum(1 for a in answers if a.is_correct)
    
    score_percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    passed = score_percentage >= 70  # 70% to pass
    
    return {
        "video_id": video_id,
        "total_questions": total_questions,
        "answered_questions": answered_questions,
        "correct_answers": correct_answers,
        "score_percentage": round(score_percentage, 2),
        "passed": passed
    }
