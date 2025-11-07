"""
Members API - Hub management endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse
from app.services import member as member_service
from app.api.dependencies import get_current_active_user, require_role


router = APIRouter(prefix="/members", tags=["members"])


@router.get("/pending", response_model=List[UserResponse])
def get_pending_visitors(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get all pending visitor applications
    Requires: HUB or ADMIN role
    """
    visitors = member_service.get_pending_visitors(db)
    return visitors


@router.get("/all", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get all users (visitors, members, hub, admin)
    Requires: HUB or ADMIN role
    """
    users = member_service.get_all_users(db)
    return users


@router.post("/{user_id}/approve", response_model=UserResponse)
def approve_visitor(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Approve a visitor and promote to member
    Requires: HUB or ADMIN role
    """
    user = member_service.approve_visitor_to_member(db, user_id)
    return user


@router.post("/{user_id}/reject", response_model=UserResponse)
def reject_visitor(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Reject a visitor application
    Requires: HUB or ADMIN role
    """
    user = member_service.reject_visitor(db, user_id)
    return user


@router.patch("/{user_id}/status", response_model=UserResponse)
def update_member_status(
    user_id: str,
    new_status: UserStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Update member status
    Requires: HUB or ADMIN role
    """
    user = member_service.update_user_status(db, user_id, new_status)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_member_details(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get member details by ID
    """
    user = member_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return user


@router.post("/profile", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member_profile(
    member_data: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create member profile (after being approved as MEMBER)
    Requires: MEMBER role
    """
    if current_user.role != UserRole.MEMBER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas membros aprovados podem criar perfil"
        )
    
    member = member_service.create_member_profile(db, current_user.id, member_data)
    return member


@router.get("/profile/me", response_model=MemberResponse)
def get_my_member_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's member profile
    """
    member = member_service.get_member_by_user_id(db, current_user.id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de membro não encontrado. Complete seu cadastro primeiro."
        )
    return member


@router.patch("/profile/me", response_model=MemberResponse)
def update_my_member_profile(
    member_data: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update current user's member profile
    """
    member = member_service.update_member_profile(db, current_user.id, member_data)
    return member


@router.get("/{user_id}/statistics")
def get_member_statistics(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get member statistics including referrals
    Requires: HUB or ADMIN role
    """
    stats = member_service.get_member_statistics(db, user_id)
    return stats


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Update user information
    Requires: HUB or ADMIN role
    """
    update_dict = user_data.model_dump(exclude_unset=True)
    user = member_service.update_user(db, user_id, update_dict)
    return user
