"""
Member Service - Business logic for member management
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.user import User, UserRole, UserStatus
from app.models.member import Member, MemberStatus
from app.schemas.member import MemberCreate, MemberUpdate
from app.services import notification as notification_service


def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Get all users with their referrer information"""
    return db.query(User).options(joinedload(User.referred_by)).offset(skip).limit(limit).all()


def get_pending_visitors(db: Session) -> List[User]:
    """Get all visitors with pending status"""
    return db.query(User).filter(
        User.role == UserRole.VISITOR,
        User.status == UserStatus.PENDING
    ).all()


def get_all_members(db: Session) -> List[User]:
    """Get all users with MEMBER role"""
    return db.query(User).filter(User.role == UserRole.MEMBER).all()


def approve_visitor_to_member(db: Session, user_id: str) -> User:
    """
    Approve a visitor and promote them to member
    """
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Check if user is a visitor
    if user.role != UserRole.VISITOR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não é um visitante"
        )
    
    # Promote to member
    user.role = UserRole.MEMBER
    user.status = UserStatus.ACTIVE
    
    db.commit()
    db.refresh(user)
    
    # Send notification
    try:
        notification_service.notify_member_approved(db, user.id, user.full_name or user.email)
    except Exception as e:
        print(f"Error sending notification: {e}")
    
    return user


def reject_visitor(db: Session, user_id: str) -> User:
    """
    Reject a visitor application
    """
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Check if user is a visitor
    if user.role != UserRole.VISITOR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não é um visitante"
        )
    
    # Set status to inactive
    user.status = UserStatus.INACTIVE
    
    db.commit()
    db.refresh(user)
    
    return user


def update_user_status(db: Session, user_id: str, new_status: UserStatus) -> User:
    """
    Update user status
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    user.status = new_status
    db.commit()
    db.refresh(user)
    
    return user


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_member_by_user_id(db: Session, user_id: str) -> Optional[Member]:
    """Get member by user ID"""
    return db.query(Member).filter(Member.user_id == user_id).first()


def create_member_profile(db: Session, user_id: str, member_data: MemberCreate) -> Member:
    """
    Create member profile after user is approved
    """
    # Check if member profile already exists
    existing_member = get_member_by_user_id(db, user_id)
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Perfil de membro já existe"
        )
    
    # Create member profile
    member = Member(
        user_id=user_id,
        company_name=member_data.company_name,
        business_category=member_data.business_category,
        company_description=member_data.company_description,
        website=member_data.website,
        business_phone=member_data.business_phone,
        business_email=member_data.business_email,
        city=member_data.city,
        state=member_data.state,
        status=MemberStatus.ACTIVE,
        reputation_score=100.0,  # Start with 100
        total_referrals_given=0,
        total_referrals_received=0,
        total_deals_closed=0,
    )
    
    db.add(member)
    db.commit()
    db.refresh(member)
    
    return member


def update_member_profile(db: Session, user_id: str, member_data: MemberUpdate) -> Member:
    """
    Update member profile
    """
    member = get_member_by_user_id(db, user_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de membro não encontrado"
        )
    
    # Update only provided fields
    update_data = member_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)
    
    db.commit()
    db.refresh(member)
    
    return member


def get_member_statistics(db: Session, user_id: str) -> Dict[str, Any]:
    """
    Get complete statistics for a member including referrals
    """
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Get all visitors referred by this user
    visitors_referred = db.query(User).filter(User.referred_by_id == user_id).all()
    
    # Count by status
    total_visitors = len(visitors_referred)
    active_members = sum(1 for v in visitors_referred if v.role == UserRole.MEMBER and v.status == UserStatus.ACTIVE)
    pending_visitors = sum(1 for v in visitors_referred if v.role == UserRole.VISITOR and v.status == UserStatus.PENDING)
    
    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.value,
        "status": user.status.value,
        "referral_code": user.referral_code,
        "total_visitors_referred": total_visitors,
        "active_members_referred": active_members,
        "pending_visitors_referred": pending_visitors,
        "visitors_referred": [
            {
                "id": v.id,
                "full_name": v.full_name,
                "email": v.email,
                "status": v.status.value,
                "role": v.role.value,
                "created_at": v.created_at
            }
            for v in visitors_referred
        ]
    }


def update_user(db: Session, user_id: str, user_data: Dict[str, Any]) -> User:
    """
    Update user information
    """
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Update only provided fields
    for field, value in user_data.items():
        if value is not None and hasattr(user, field):
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user
