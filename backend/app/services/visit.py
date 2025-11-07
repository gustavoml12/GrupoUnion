"""
Visit Service
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from fastapi import HTTPException, status

from app.models.visit import Visit, VisitStatus, VisitPurpose
from app.models.member import Member
from app.models.user import User


def create_visit(db: Session, visitor_id: str, visit_data: Dict[str, Any]) -> Visit:
    """Create a new visit"""
    # Verify both members exist
    visitor = db.query(Member).filter(Member.id == visitor_id).first()
    if not visitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visitante não encontrado"
        )
    
    visited = db.query(Member).filter(Member.id == visit_data['visited_id']).first()
    if not visited:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membro visitado não encontrado"
        )
    
    # Cannot visit yourself
    if visitor_id == visit_data['visited_id']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode registrar uma visita a si mesmo"
        )
    
    # Create visit
    visit = Visit(
        visitor_id=visitor_id,
        **visit_data
    )
    
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit


def get_visit_by_id(db: Session, visit_id: str) -> Optional[Visit]:
    """Get visit by ID"""
    return db.query(Visit).filter(Visit.id == visit_id).first()


def get_member_visits(
    db: Session,
    member_id: str,
    as_visitor: bool = True,
    status_filter: Optional[VisitStatus] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Visit]:
    """Get visits for a member (as visitor or visited)"""
    if as_visitor:
        query = db.query(Visit).filter(Visit.visitor_id == member_id)
    else:
        query = db.query(Visit).filter(Visit.visited_id == member_id)
    
    if status_filter:
        query = query.filter(Visit.status == status_filter)
    
    return query.order_by(Visit.visit_date.desc()).offset(skip).limit(limit).all()


def get_all_visits(
    db: Session,
    status_filter: Optional[VisitStatus] = None,
    purpose_filter: Optional[VisitPurpose] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Visit]:
    """Get all visits with filters (Hub/Admin)"""
    query = db.query(Visit).options(
        joinedload(Visit.visitor),
        joinedload(Visit.visited)
    )
    
    if status_filter:
        query = query.filter(Visit.status == status_filter)
    
    if purpose_filter:
        query = query.filter(Visit.purpose == purpose_filter)
    
    if date_from:
        query = query.filter(Visit.visit_date >= date_from)
    
    if date_to:
        query = query.filter(Visit.visit_date <= date_to)
    
    return query.order_by(Visit.visit_date.desc()).offset(skip).limit(limit).all()


def update_visit(db: Session, visit_id: str, update_data: Dict[str, Any]) -> Visit:
    """Update a visit"""
    visit = get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita não encontrada"
        )
    
    # Can only update if not completed
    if visit.status == VisitStatus.REALIZADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível editar uma visita já realizada"
        )
    
    for field, value in update_data.items():
        if value is not None and hasattr(visit, field):
            setattr(visit, field, value)
    
    db.commit()
    db.refresh(visit)
    return visit


def complete_visit(db: Session, visit_id: str, completion_data: Dict[str, Any]) -> Visit:
    """Mark visit as completed with summary"""
    visit = get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita não encontrada"
        )
    
    if visit.status == VisitStatus.REALIZADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta visita já foi marcada como realizada"
        )
    
    # Update with completion data
    visit.status = VisitStatus.REALIZADA
    visit.completed_at = datetime.utcnow()
    
    for field, value in completion_data.items():
        if value is not None and hasattr(visit, field):
            setattr(visit, field, value)
    
    db.commit()
    db.refresh(visit)
    return visit


def cancel_visit(db: Session, visit_id: str) -> Visit:
    """Cancel a visit"""
    visit = get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita não encontrada"
        )
    
    if visit.status == VisitStatus.REALIZADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível cancelar uma visita já realizada"
        )
    
    visit.status = VisitStatus.CANCELADA
    db.commit()
    db.refresh(visit)
    return visit


def delete_visit(db: Session, visit_id: str) -> bool:
    """Delete a visit"""
    visit = get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita não encontrada"
        )
    
    db.delete(visit)
    db.commit()
    return True


def get_visit_stats(db: Session, member_id: Optional[str] = None) -> Dict[str, Any]:
    """Get visit statistics"""
    if member_id:
        # Stats for specific member
        total_made = db.query(Visit).filter(Visit.visitor_id == member_id).count()
        total_received = db.query(Visit).filter(Visit.visited_id == member_id).count()
        total = total_made + total_received
        
        completed = db.query(Visit).filter(
            or_(Visit.visitor_id == member_id, Visit.visited_id == member_id),
            Visit.status == VisitStatus.REALIZADA
        ).count()
        
        pending = db.query(Visit).filter(
            or_(Visit.visitor_id == member_id, Visit.visited_id == member_id),
            Visit.status == VisitStatus.AGENDADA
        ).count()
        
        # Average quality (only for visits made)
        avg_quality = db.query(func.avg(Visit.networking_quality)).filter(
            Visit.visitor_id == member_id,
            Visit.networking_quality.isnot(None)
        ).scalar()
        
        # Count potential referrals
        referrals_count = db.query(Visit).filter(
            Visit.visitor_id == member_id,
            Visit.potential_referrals.isnot(None),
            Visit.potential_referrals != ''
        ).count()
        
    else:
        # Global stats
        total = db.query(Visit).count()
        total_made = total
        total_received = total
        completed = db.query(Visit).filter(Visit.status == VisitStatus.REALIZADA).count()
        pending = db.query(Visit).filter(Visit.status == VisitStatus.AGENDADA).count()
        avg_quality = db.query(func.avg(Visit.networking_quality)).filter(
            Visit.networking_quality.isnot(None)
        ).scalar()
        referrals_count = db.query(Visit).filter(
            Visit.potential_referrals.isnot(None),
            Visit.potential_referrals != ''
        ).count()
    
    return {
        "total_visits": total,
        "visits_made": total_made,
        "visits_received": total_received,
        "completed_visits": completed,
        "pending_visits": pending,
        "average_networking_quality": float(avg_quality) if avg_quality else None,
        "total_potential_referrals": referrals_count
    }
