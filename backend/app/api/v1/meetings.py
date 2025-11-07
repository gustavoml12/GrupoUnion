"""
Meetings API
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.meeting import MeetingStatus, MeetingType
from app.schemas.meeting import (
    MeetingCreate,
    MeetingUpdate,
    MeetingResponse,
    MeetingWithMember,
    MeetingConfirm,
    MeetingCancel,
    MeetingComplete,
    MeetingStats
)
from app.services import meeting as meeting_service
from app.api.dependencies import get_current_active_user, require_role


router = APIRouter(prefix="/meetings", tags=["meetings"])


# Member Routes

@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(
    meeting: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new meeting request
    Available to all authenticated users with a member profile
    """
    # Get member_id from user
    if not hasattr(current_user, 'member') or not current_user.member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você precisa completar seu cadastro de membro primeiro"
        )
    
    member_id = current_user.member.id
    meeting_data = meeting.model_dump()
    
    new_meeting = meeting_service.create_meeting(db, member_id, current_user.id, meeting_data)
    return new_meeting


@router.get("/my-meetings", response_model=List[MeetingResponse])
def get_my_meetings(
    include_cancelled: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all meetings for the current user
    """
    if not hasattr(current_user, 'member') or not current_user.member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não possui um perfil de membro"
        )
    
    member_id = current_user.member.id
    meetings = meeting_service.get_member_meetings(db, member_id, include_cancelled)
    return meetings


@router.get("/my-meetings/{meeting_id}", response_model=MeetingResponse)
def get_my_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific meeting for the current user
    """
    meeting = meeting_service.get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    # Verify ownership
    if not hasattr(current_user, 'member') or not current_user.member or meeting.member_id != current_user.member.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar esta reunião"
        )
    
    return meeting


@router.patch("/my-meetings/{meeting_id}", response_model=MeetingResponse)
def update_my_meeting(
    meeting_id: str,
    meeting_data: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a meeting (only if pending)
    """
    meeting = meeting_service.get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    # Verify ownership
    if not hasattr(current_user, 'member') or not current_user.member or meeting.member_id != current_user.member.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para atualizar esta reunião"
        )
    
    update_dict = meeting_data.model_dump(exclude_unset=True)
    updated_meeting = meeting_service.update_meeting(db, meeting_id, update_dict)
    return updated_meeting


@router.delete("/my-meetings/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_my_meeting(
    meeting_id: str,
    cancel_data: MeetingCancel,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cancel a meeting
    """
    meeting = meeting_service.get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reunião não encontrada"
        )
    
    # Verify ownership
    if not hasattr(current_user, 'member') or not current_user.member or meeting.member_id != current_user.member.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para cancelar esta reunião"
        )
    
    meeting_service.cancel_meeting(db, meeting_id, cancel_data.cancellation_reason)
    return None


# Hub/Admin Routes

@router.post("/hub/create/{member_id}", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting_as_hub(
    member_id: str,
    meeting: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Create a meeting for a member (Hub creates)
    Requires: HUB or ADMIN role
    """
    meeting_data = meeting.model_dump()
    new_meeting = meeting_service.create_meeting(db, member_id, current_user.id, meeting_data)
    return new_meeting


@router.get("/all", response_model=List[MeetingWithMember])
def get_all_meetings(
    status_filter: Optional[MeetingStatus] = Query(None),
    meeting_type: Optional[MeetingType] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get all meetings with filters
    Requires: HUB or ADMIN role
    """
    meetings = meeting_service.get_all_meetings(
        db,
        status_filter=status_filter,
        meeting_type_filter=meeting_type,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit
    )
    
    # Format response with member details
    result = []
    for meeting in meetings:
        meeting_dict = {
            **meeting.__dict__,
            "member": {
                "id": meeting.member.id,
                "company_name": meeting.member.company_name,
                "business_category": meeting.member.business_category.value,
                "user_name": meeting.member.user.full_name,
                "user_email": meeting.member.user.email
            }
        }
        result.append(meeting_dict)
    
    return result


@router.get("/stats", response_model=MeetingStats)
def get_meeting_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get meeting statistics
    Requires: HUB or ADMIN role
    """
    stats = meeting_service.get_meeting_stats(db)
    return stats


@router.post("/{meeting_id}/confirm", response_model=MeetingResponse)
def confirm_meeting(
    meeting_id: str,
    confirm_data: MeetingConfirm,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Confirm a meeting
    Requires: HUB or ADMIN role
    """
    confirm_dict = confirm_data.model_dump()
    confirmed_meeting = meeting_service.confirm_meeting(db, meeting_id, current_user.id, confirm_dict)
    return confirmed_meeting


@router.post("/{meeting_id}/complete", response_model=MeetingResponse)
def complete_meeting(
    meeting_id: str,
    complete_data: MeetingComplete,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Mark meeting as completed
    Requires: HUB or ADMIN role
    """
    completed_meeting = meeting_service.complete_meeting(db, meeting_id, complete_data.hub_notes)
    return completed_meeting


@router.delete("/{meeting_id}/cancel", status_code=status.HTTP_204_NO_CONTENT)
def cancel_meeting_admin(
    meeting_id: str,
    cancel_data: MeetingCancel,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Cancel a meeting (admin)
    Requires: HUB or ADMIN role
    """
    meeting_service.cancel_meeting(db, meeting_id, cancel_data.cancellation_reason)
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


# Utility Routes

@router.get("/available-slots", response_model=List[datetime])
def get_available_slots(
    date: datetime = Query(..., description="Date to check availability"),
    duration_minutes: int = Query(60, ge=30, le=180),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get available time slots for a given date
    """
    slots = meeting_service.get_available_slots(db, date, duration_minutes)
    return slots
