"""
Collective Meetings API
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.collective_meeting import CollectiveMeetingStatus, meeting_attendees
from app.schemas.collective_meeting import (
    CollectiveMeetingCreate,
    CollectiveMeetingUpdate,
    CollectiveMeetingResponse,
    CollectiveMeetingWithAttendees,
    ConfirmAttendance,
    MarkAttendance,
    CollectiveMeetingStats,
    MeetingAttendee
)
from app.services import collective_meeting as meeting_service
from app.api.dependencies import get_current_active_user, require_role


router = APIRouter(prefix="/collective-meetings", tags=["collective-meetings"])


# Hub/Admin Routes

@router.post("", response_model=CollectiveMeetingResponse, status_code=status.HTTP_201_CREATED)
def create_collective_meeting(
    meeting: CollectiveMeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Create a new collective meeting (invites all active members)
    Requires: HUB or ADMIN role
    """
    meeting_data = meeting.model_dump()
    new_meeting = meeting_service.create_collective_meeting(db, current_user.id, meeting_data)
    return new_meeting


@router.get("", response_model=List[CollectiveMeetingResponse])
def get_all_collective_meetings(
    status_filter: Optional[CollectiveMeetingStatus] = Query(None),
    upcoming_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all collective meetings
    Hub/Admin: see all meetings
    Members: see only their meetings
    """
    if current_user.role in [UserRole.HUB, UserRole.ADMIN]:
        meetings = meeting_service.get_all_collective_meetings(
            db,
            status_filter=status_filter,
            upcoming_only=upcoming_only,
            skip=skip,
            limit=limit
        )
    else:
        # Members see only meetings they're invited to
        if not hasattr(current_user, 'member') or not current_user.member:
            return []
        
        meetings = meeting_service.get_member_collective_meetings(
            db,
            current_user.member.id,
            upcoming_only=upcoming_only,
            skip=skip,
            limit=limit
        )
    
    return meetings


@router.get("/stats", response_model=CollectiveMeetingStats)
def get_meeting_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get collective meeting statistics
    Requires: HUB or ADMIN role
    """
    stats = meeting_service.get_meeting_stats(db)
    return stats


@router.get("/{meeting_id}", response_model=CollectiveMeetingWithAttendees)
def get_collective_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific collective meeting with attendees
    """
    meeting = meeting_service.get_collective_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    # Build attendees list
    attendees_data = []
    stmt = db.query(meeting_attendees).filter(meeting_attendees.c.meeting_id == meeting_id).all()
    
    for att in stmt:
        from app.models.member import Member
        member = db.query(Member).filter(Member.id == att.member_id).first()
        if member:
            attendees_data.append({
                "member_id": member.id,
                "member_name": member.user.full_name or member.user.email if hasattr(member, 'user') else "Unknown",
                "company_name": member.company_name,
                "confirmed": att.confirmed,
                "attended": att.attended,
                "confirmed_at": att.confirmed_at
            })
    
    meeting_dict = {
        **meeting.__dict__,
        "attendees": attendees_data
    }
    
    return meeting_dict


@router.patch("/{meeting_id}", response_model=CollectiveMeetingResponse)
def update_collective_meeting(
    meeting_id: str,
    meeting_update: CollectiveMeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Update a collective meeting
    Requires: HUB or ADMIN role
    """
    update_data = meeting_update.model_dump(exclude_unset=True)
    updated_meeting = meeting_service.update_collective_meeting(db, meeting_id, update_data)
    return updated_meeting


@router.post("/{meeting_id}/complete", response_model=CollectiveMeetingResponse)
def complete_meeting(
    meeting_id: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Mark meeting as completed
    Requires: HUB or ADMIN role
    """
    completed_meeting = meeting_service.complete_meeting(db, meeting_id, notes)
    return completed_meeting


@router.delete("/{meeting_id}/cancel", status_code=status.HTTP_204_NO_CONTENT)
def cancel_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Cancel a meeting
    Requires: HUB or ADMIN role
    """
    meeting_service.cancel_meeting(db, meeting_id)
    return None


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Delete a meeting
    Requires: HUB or ADMIN role
    """
    meeting_service.delete_meeting(db, meeting_id)
    return None


@router.post("/{meeting_id}/attendance", response_model=CollectiveMeetingResponse)
def mark_attendance(
    meeting_id: str,
    attendance: MarkAttendance,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Mark attendance for members who attended
    Requires: HUB or ADMIN role
    """
    updated_meeting = meeting_service.mark_attendance(db, meeting_id, attendance.member_ids)
    return updated_meeting


# Member Routes

@router.post("/{meeting_id}/confirm", status_code=status.HTTP_200_OK)
def confirm_attendance(
    meeting_id: str,
    confirmation: ConfirmAttendance,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Confirm or decline attendance for a meeting
    Available to members
    """
    if not hasattr(current_user, 'member') or not current_user.member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você precisa ser um membro"
        )
    
    member_id = current_user.member.id
    meeting_service.confirm_attendance(db, meeting_id, member_id, confirmation.confirmed)
    
    return {"message": "Presença confirmada" if confirmation.confirmed else "Presença declinada"}
