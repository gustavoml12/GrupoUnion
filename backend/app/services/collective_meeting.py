"""
Collective Meeting Service
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from fastapi import HTTPException, status

from app.models.collective_meeting import CollectiveMeeting, CollectiveMeetingStatus, meeting_attendees
from app.models.member import Member
from app.models.user import User


def create_collective_meeting(db: Session, creator_id: str, meeting_data: Dict[str, Any]) -> CollectiveMeeting:
    """Create a new collective meeting and invite all active members"""
    # Create meeting
    meeting = CollectiveMeeting(
        created_by_id=creator_id,
        **meeting_data
    )
    
    db.add(meeting)
    db.flush()  # Get meeting ID
    
    # Get all active members
    active_members = db.query(Member).join(
        User, Member.user_id == User.id
    ).filter(
        User.role == "MEMBER",
        User.status == "ACTIVE"
    ).all()
    
    # Add all members as attendees
    for member in active_members:
        meeting.attendees.append(member)
    
    meeting.total_invited = len(active_members)
    
    db.commit()
    db.refresh(meeting)
    return meeting


def get_collective_meeting_by_id(db: Session, meeting_id: str) -> Optional[CollectiveMeeting]:
    """Get collective meeting by ID"""
    return db.query(CollectiveMeeting).filter(CollectiveMeeting.id == meeting_id).first()


def get_all_collective_meetings(
    db: Session,
    status_filter: Optional[CollectiveMeetingStatus] = None,
    upcoming_only: bool = False,
    skip: int = 0,
    limit: int = 100
) -> List[CollectiveMeeting]:
    """Get all collective meetings"""
    query = db.query(CollectiveMeeting)
    
    if status_filter:
        query = query.filter(CollectiveMeeting.status == status_filter)
    
    if upcoming_only:
        query = query.filter(
            CollectiveMeeting.scheduled_date >= datetime.utcnow(),
            CollectiveMeeting.status != CollectiveMeetingStatus.CANCELADA
        )
    
    return query.order_by(CollectiveMeeting.scheduled_date.desc()).offset(skip).limit(limit).all()


def get_member_collective_meetings(
    db: Session,
    member_id: str,
    upcoming_only: bool = False,
    skip: int = 0,
    limit: int = 100
) -> List[CollectiveMeeting]:
    """Get collective meetings for a specific member"""
    query = db.query(CollectiveMeeting).join(
        meeting_attendees,
        CollectiveMeeting.id == meeting_attendees.c.meeting_id
    ).filter(
        meeting_attendees.c.member_id == member_id
    )
    
    if upcoming_only:
        query = query.filter(
            CollectiveMeeting.scheduled_date >= datetime.utcnow(),
            CollectiveMeeting.status != CollectiveMeetingStatus.CANCELADA
        )
    
    return query.order_by(CollectiveMeeting.scheduled_date.desc()).offset(skip).limit(limit).all()


def update_collective_meeting(db: Session, meeting_id: str, update_data: Dict[str, Any]) -> CollectiveMeeting:
    """Update a collective meeting"""
    meeting = get_collective_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    if meeting.status == CollectiveMeetingStatus.CANCELADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível editar uma reunião cancelada"
        )
    
    for field, value in update_data.items():
        if value is not None and hasattr(meeting, field):
            setattr(meeting, field, value)
    
    db.commit()
    db.refresh(meeting)
    return meeting


def confirm_attendance(db: Session, meeting_id: str, member_id: str, confirmed: bool = True) -> bool:
    """Confirm or decline attendance for a meeting"""
    meeting = get_collective_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    # Update attendance confirmation
    stmt = meeting_attendees.update().where(
        and_(
            meeting_attendees.c.meeting_id == meeting_id,
            meeting_attendees.c.member_id == member_id
        )
    ).values(
        confirmed=confirmed,
        confirmed_at=datetime.utcnow() if confirmed else None
    )
    
    db.execute(stmt)
    
    # Update total confirmed count
    confirmed_count = db.query(func.count()).select_from(meeting_attendees).filter(
        and_(
            meeting_attendees.c.meeting_id == meeting_id,
            meeting_attendees.c.confirmed == True
        )
    ).scalar()
    
    meeting.total_confirmed = confirmed_count
    
    db.commit()
    return True


def mark_attendance(db: Session, meeting_id: str, member_ids: List[str]) -> CollectiveMeeting:
    """Mark attendance for members who attended the meeting"""
    meeting = get_collective_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    # Reset all attendance to False first
    db.execute(
        meeting_attendees.update().where(
            meeting_attendees.c.meeting_id == meeting_id
        ).values(attended=False)
    )
    
    # Mark specified members as attended
    if member_ids:
        db.execute(
            meeting_attendees.update().where(
                and_(
                    meeting_attendees.c.meeting_id == meeting_id,
                    meeting_attendees.c.member_id.in_(member_ids)
                )
            ).values(attended=True)
        )
    
    meeting.total_attended = len(member_ids)
    
    db.commit()
    db.refresh(meeting)
    return meeting


def complete_meeting(db: Session, meeting_id: str, notes: Optional[str] = None) -> CollectiveMeeting:
    """Mark meeting as completed"""
    meeting = get_collective_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    if meeting.status == CollectiveMeetingStatus.REALIZADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta reunião já foi marcada como realizada"
        )
    
    meeting.mark_as_completed()
    if notes:
        meeting.notes = notes
    
    db.commit()
    db.refresh(meeting)
    return meeting


def cancel_meeting(db: Session, meeting_id: str) -> CollectiveMeeting:
    """Cancel a meeting"""
    meeting = get_collective_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    if meeting.status == CollectiveMeetingStatus.REALIZADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível cancelar uma reunião já realizada"
        )
    
    meeting.cancel()
    
    db.commit()
    db.refresh(meeting)
    return meeting


def delete_meeting(db: Session, meeting_id: str) -> bool:
    """Delete a meeting"""
    meeting = get_collective_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    db.delete(meeting)
    db.commit()
    return True


def get_meeting_stats(db: Session) -> Dict[str, Any]:
    """Get collective meeting statistics"""
    total = db.query(CollectiveMeeting).count()
    
    upcoming = db.query(CollectiveMeeting).filter(
        CollectiveMeeting.scheduled_date >= datetime.utcnow(),
        CollectiveMeeting.status != CollectiveMeetingStatus.CANCELADA
    ).count()
    
    past = db.query(CollectiveMeeting).filter(
        CollectiveMeeting.scheduled_date < datetime.utcnow()
    ).count()
    
    cancelled = db.query(CollectiveMeeting).filter(
        CollectiveMeeting.status == CollectiveMeetingStatus.CANCELADA
    ).count()
    
    # Calculate average attendance rate
    completed_meetings = db.query(CollectiveMeeting).filter(
        CollectiveMeeting.status == CollectiveMeetingStatus.REALIZADA,
        CollectiveMeeting.total_invited > 0
    ).all()
    
    if completed_meetings:
        attendance_rates = [
            (m.total_attended / m.total_invited * 100) 
            for m in completed_meetings 
            if m.total_invited > 0
        ]
        avg_attendance = sum(attendance_rates) / len(attendance_rates) if attendance_rates else None
    else:
        avg_attendance = None
    
    return {
        "total_meetings": total,
        "upcoming_meetings": upcoming,
        "past_meetings": past,
        "cancelled_meetings": cancelled,
        "average_attendance_rate": avg_attendance
    }
