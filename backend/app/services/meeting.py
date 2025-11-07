"""
Meeting Service
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from fastapi import HTTPException, status

from app.models.meeting import Meeting, MeetingStatus, MeetingType
from app.models.member import Member
from app.models.user import User
from app.services import notification as notification_service


def create_meeting(db: Session, member_id: str, user_id: str, meeting_data: Dict[str, Any]) -> Meeting:
    """Create a new meeting"""
    # Verify member exists
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membro não encontrado"
        )
    
    # Check if member already has a pending meeting
    existing_pending = db.query(Meeting).filter(
        and_(
            Meeting.member_id == member_id,
            Meeting.status == MeetingStatus.PENDING
        )
    ).first()
    
    if existing_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já possui uma reunião pendente. Aguarde a confirmação ou cancele a anterior."
        )
    
    # Create meeting
    meeting = Meeting(
        member_id=member_id,
        scheduled_by_id=user_id,
        **meeting_data
    )
    
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


def get_meeting_by_id(db: Session, meeting_id: str) -> Optional[Meeting]:
    """Get meeting by ID with member details"""
    return db.query(Meeting).options(
        joinedload(Meeting.member).joinedload(Member.user)
    ).filter(Meeting.id == meeting_id).first()


def get_member_meetings(db: Session, member_id: str, include_cancelled: bool = False) -> List[Meeting]:
    """Get all meetings for a member"""
    query = db.query(Meeting).filter(Meeting.member_id == member_id)
    
    if not include_cancelled:
        query = query.filter(Meeting.status != MeetingStatus.CANCELLED)
    
    return query.order_by(Meeting.scheduled_date.desc()).all()


def get_all_meetings(
    db: Session,
    status_filter: Optional[MeetingStatus] = None,
    meeting_type_filter: Optional[MeetingType] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Meeting]:
    """Get all meetings with filters"""
    query = db.query(Meeting).options(
        joinedload(Meeting.member).joinedload(Member.user)
    )
    
    if status_filter:
        query = query.filter(Meeting.status == status_filter)
    
    if meeting_type_filter:
        query = query.filter(Meeting.meeting_type == meeting_type_filter)
    
    if date_from:
        query = query.filter(Meeting.scheduled_date >= date_from)
    
    if date_to:
        query = query.filter(Meeting.scheduled_date <= date_to)
    
    return query.order_by(Meeting.scheduled_date.asc()).offset(skip).limit(limit).all()


def update_meeting(db: Session, meeting_id: str, meeting_data: Dict[str, Any]) -> Meeting:
    """Update meeting information"""
    meeting = get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    # Don't allow updating completed or cancelled meetings
    if meeting.status in [MeetingStatus.COMPLETED, MeetingStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não é possível atualizar uma reunião {meeting.status.value.lower()}"
        )
    
    for field, value in meeting_data.items():
        if value is not None and hasattr(meeting, field):
            setattr(meeting, field, value)
    
    db.commit()
    db.refresh(meeting)
    return meeting


def confirm_meeting(
    db: Session,
    meeting_id: str,
    confirmed_by_id: str,
    confirm_data: Dict[str, Any]
) -> Meeting:
    """Confirm a meeting"""
    meeting = get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    if meeting.status != MeetingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas reuniões pendentes podem ser confirmadas"
        )
    
    meeting.status = MeetingStatus.CONFIRMED
    meeting.confirmed_by_id = confirmed_by_id
    meeting.confirmed_at = datetime.utcnow()
    
    # Update optional fields
    if confirm_data.get('meeting_link'):
        meeting.meeting_link = confirm_data['meeting_link']
    if confirm_data.get('location'):
        meeting.location = confirm_data['location']
    if confirm_data.get('hub_notes'):
        meeting.hub_notes = confirm_data['hub_notes']
    
    db.commit()
    db.refresh(meeting)
    
    # Send notification
    try:
        user = db.query(User).join(Member).filter(Member.id == meeting.member_id).first()
        if user:
            notification_service.notify_meeting_confirmed(
                db,
                user.id,
                meeting.id,
                meeting.scheduled_date.strftime('%d/%m/%Y às %H:%M'),
                meeting.meeting_link,
                meeting.location
            )
    except Exception as e:
        print(f"Error sending notification: {e}")
    
    return meeting


def cancel_meeting(
    db: Session,
    meeting_id: str,
    cancellation_reason: str
) -> Meeting:
    """Cancel a meeting"""
    meeting = get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    if meeting.status in [MeetingStatus.COMPLETED, MeetingStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não é possível cancelar uma reunião {meeting.status.value.lower()}"
        )
    
    meeting.status = MeetingStatus.CANCELLED
    meeting.cancellation_reason = cancellation_reason
    meeting.cancelled_at = datetime.utcnow()
    
    db.commit()
    db.refresh(meeting)
    return meeting


def complete_meeting(
    db: Session,
    meeting_id: str,
    hub_notes: Optional[str] = None
) -> Meeting:
    """Mark meeting as completed"""
    meeting = get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    if meeting.status != MeetingStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas reuniões confirmadas podem ser marcadas como concluídas"
        )
    
    meeting.status = MeetingStatus.COMPLETED
    meeting.completed_at = datetime.utcnow()
    
    if hub_notes:
        meeting.hub_notes = hub_notes
    
    db.commit()
    db.refresh(meeting)
    return meeting


def delete_meeting(db: Session, meeting_id: str) -> bool:
    """Delete a meeting"""
    meeting = get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    db.delete(meeting)
    db.commit()
    return True


def get_meeting_stats(db: Session) -> Dict[str, int]:
    """Get meeting statistics"""
    total = db.query(Meeting).count()
    pending = db.query(Meeting).filter(Meeting.status == MeetingStatus.PENDING).count()
    confirmed = db.query(Meeting).filter(Meeting.status == MeetingStatus.CONFIRMED).count()
    completed = db.query(Meeting).filter(Meeting.status == MeetingStatus.COMPLETED).count()
    cancelled = db.query(Meeting).filter(Meeting.status == MeetingStatus.CANCELLED).count()
    
    # Upcoming meetings (next 7 days)
    today = datetime.utcnow()
    next_week = today + timedelta(days=7)
    upcoming = db.query(Meeting).filter(
        and_(
            Meeting.scheduled_date >= today,
            Meeting.scheduled_date <= next_week,
            or_(
                Meeting.status == MeetingStatus.PENDING,
                Meeting.status == MeetingStatus.CONFIRMED
            )
        )
    ).count()
    
    return {
        "total_meetings": total,
        "pending_meetings": pending,
        "confirmed_meetings": confirmed,
        "completed_meetings": completed,
        "cancelled_meetings": cancelled,
        "upcoming_meetings": upcoming
    }


def get_available_slots(db: Session, date: datetime, duration_minutes: int = 60) -> List[datetime]:
    """
    Get available time slots for a given date
    This is a simple implementation - can be enhanced with business hours, etc.
    """
    # Get all meetings for the date
    start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)
    
    existing_meetings = db.query(Meeting).filter(
        and_(
            Meeting.scheduled_date >= start_of_day,
            Meeting.scheduled_date < end_of_day,
            or_(
                Meeting.status == MeetingStatus.PENDING,
                Meeting.status == MeetingStatus.CONFIRMED
            )
        )
    ).all()
    
    # Business hours: 9:00 - 18:00
    available_slots = []
    current_time = start_of_day.replace(hour=9, minute=0)
    end_time = start_of_day.replace(hour=18, minute=0)
    
    while current_time < end_time:
        # Check if slot is available
        is_available = True
        for meeting in existing_meetings:
            meeting_end = meeting.scheduled_date + timedelta(minutes=int(meeting.duration_minutes))
            slot_end = current_time + timedelta(minutes=duration_minutes)
            
            # Check for overlap
            if not (slot_end <= meeting.scheduled_date or current_time >= meeting_end):
                is_available = False
                break
        
        if is_available:
            available_slots.append(current_time)
        
        # Move to next slot (30 minutes intervals)
        current_time += timedelta(minutes=30)
    
    return available_slots
