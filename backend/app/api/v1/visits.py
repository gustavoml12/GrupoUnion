"""
Visits API
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.visit import VisitStatus, VisitPurpose
from app.schemas.visit import (
    VisitCreate,
    VisitUpdate,
    VisitComplete,
    VisitResponse,
    VisitWithMembers,
    VisitStats
)
from app.services import visit as visit_service
from app.api.dependencies import get_current_active_user, require_role


router = APIRouter(prefix="/visits", tags=["visits"])


# Member Routes

@router.post("", response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
def create_visit(
    visit: VisitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new visit
    Available to members only
    """
    # Get member_id from user
    if not hasattr(current_user, 'member') or not current_user.member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você precisa ser um membro para registrar visitas"
        )
    
    member_id = current_user.member.id
    visit_data = visit.model_dump()
    
    new_visit = visit_service.create_visit(db, member_id, visit_data)
    return new_visit


@router.get("/my-visits", response_model=List[VisitResponse])
def get_my_visits(
    as_visitor: bool = Query(True, description="True for visits made, False for visits received"),
    status_filter: Optional[VisitStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get my visits (made or received)
    """
    if not hasattr(current_user, 'member') or not current_user.member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você precisa ser um membro"
        )
    
    member_id = current_user.member.id
    visits = visit_service.get_member_visits(
        db,
        member_id,
        as_visitor=as_visitor,
        status_filter=status_filter,
        skip=skip,
        limit=limit
    )
    return visits


@router.get("/my-stats", response_model=VisitStats)
def get_my_visit_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get my visit statistics
    """
    if not hasattr(current_user, 'member') or not current_user.member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você precisa ser um membro"
        )
    
    member_id = current_user.member.id
    stats = visit_service.get_visit_stats(db, member_id)
    return stats


@router.get("/{visit_id}", response_model=VisitResponse)
def get_visit(
    visit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific visit
    """
    visit = visit_service.get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita não encontrada"
        )
    
    # Verify access (visitor or visited or Hub/Admin)
    if current_user.role not in [UserRole.HUB, UserRole.ADMIN]:
        if not hasattr(current_user, 'member') or not current_user.member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado"
            )
        
        member_id = current_user.member.id
        if visit.visitor_id != member_id and visit.visited_id != member_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar esta visita"
            )
    
    return visit


@router.patch("/{visit_id}", response_model=VisitResponse)
def update_visit(
    visit_id: str,
    visit_update: VisitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a visit
    Only the visitor can update
    """
    visit = visit_service.get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita não encontrada"
        )
    
    # Verify ownership
    if not hasattr(current_user, 'member') or not current_user.member or visit.visitor_id != current_user.member.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas o visitante pode editar a visita"
        )
    
    update_data = visit_update.model_dump(exclude_unset=True)
    updated_visit = visit_service.update_visit(db, visit_id, update_data)
    return updated_visit


@router.post("/{visit_id}/complete", response_model=VisitResponse)
def complete_visit(
    visit_id: str,
    completion: VisitComplete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark visit as completed with summary
    Only the visitor can complete
    """
    visit = visit_service.get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita não encontrada"
        )
    
    # Verify ownership
    if not hasattr(current_user, 'member') or not current_user.member or visit.visitor_id != current_user.member.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas o visitante pode completar a visita"
        )
    
    completion_data = completion.model_dump()
    completed_visit = visit_service.complete_visit(db, visit_id, completion_data)
    return completed_visit


@router.delete("/{visit_id}/cancel", status_code=status.HTTP_204_NO_CONTENT)
def cancel_visit(
    visit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cancel a visit
    Only the visitor can cancel
    """
    visit = visit_service.get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita não encontrada"
        )
    
    # Verify ownership
    if not hasattr(current_user, 'member') or not current_user.member or visit.visitor_id != current_user.member.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas o visitante pode cancelar a visita"
        )
    
    visit_service.cancel_visit(db, visit_id)
    return None


# Hub/Admin Routes

@router.get("/all/visits", response_model=List[VisitWithMembers])
def get_all_visits(
    status_filter: Optional[VisitStatus] = Query(None),
    purpose_filter: Optional[VisitPurpose] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get all visits with filters
    Requires: HUB or ADMIN role
    """
    visits = visit_service.get_all_visits(
        db,
        status_filter=status_filter,
        purpose_filter=purpose_filter,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit
    )
    
    # Format response with member details
    result = []
    for visit in visits:
        visit_dict = {
            **visit.__dict__,
            "visitor_name": visit.visitor.user.full_name or visit.visitor.user.email if hasattr(visit.visitor, 'user') else "Unknown",
            "visitor_company": visit.visitor.company_name,
            "visited_name": visit.visited.user.full_name or visit.visited.user.email if hasattr(visit.visited, 'user') else "Unknown",
            "visited_company": visit.visited.company_name
        }
        result.append(visit_dict)
    
    return result


@router.get("/all/stats", response_model=VisitStats)
def get_all_visit_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get global visit statistics
    Requires: HUB or ADMIN role
    """
    stats = visit_service.get_visit_stats(db)
    return stats


@router.delete("/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visit(
    visit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Delete a visit (admin only)
    Requires: HUB or ADMIN role
    """
    visit_service.delete_visit(db, visit_id)
    return None
