"""
Profile Service - Calculate profile completion and manage profile updates
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.member import Member
from app.models.user import User


def calculate_profile_completion(member: Member, user: User) -> int:
    """
    Calculate profile completion percentage
    Returns a value from 0 to 100
    """
    total_fields = 0
    completed_fields = 0
    
    # Required fields (always count)
    required_fields = [
        ('company_name', member.company_name),
        ('business_category', member.business_category),
        ('full_name', user.full_name),
        ('email', user.email),
    ]
    
    for field_name, value in required_fields:
        total_fields += 1
        if value:
            completed_fields += 1
    
    # Optional but important fields (weighted)
    optional_fields = [
        ('profile_photo_url', member.profile_photo_url, 2),  # Weight 2 - very important
        ('bio', member.bio, 2),  # Weight 2
        ('company_description', member.company_description, 1.5),
        ('website', member.website, 1),
        ('business_phone', member.business_phone, 1),
        ('business_email', member.business_email, 1),
        ('city', member.city, 1),
        ('state', member.state, 1),
        ('linkedin_url', member.linkedin_url, 1.5),  # Weight 1.5 - important for networking
        ('instagram_url', member.instagram_url, 0.5),
        ('facebook_url', member.facebook_url, 0.5),
        ('twitter_url', member.twitter_url, 0.5),
        ('interests', member.interests, 1),
        ('skills', member.skills, 1),
    ]
    
    for field_name, value, weight in optional_fields:
        total_fields += weight
        if value and str(value).strip():
            completed_fields += weight
    
    # Calculate percentage
    if total_fields == 0:
        return 0
    
    percentage = int((completed_fields / total_fields) * 100)
    return min(100, max(0, percentage))  # Ensure between 0 and 100


def update_profile_completion(db: Session, member_id: str) -> int:
    """
    Update the profile_completed field for a member
    Returns the new completion percentage
    """
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membro não encontrado"
        )
    
    user = db.query(User).filter(User.id == member.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    completion = calculate_profile_completion(member, user)
    member.profile_completed = completion
    
    db.commit()
    db.refresh(member)
    
    return completion


def get_profile_suggestions(member: Member, user: User) -> list:
    """
    Get suggestions for completing the profile
    Returns a list of missing fields with priority
    """
    suggestions = []
    
    # Check critical fields
    if not member.profile_photo_url:
        suggestions.append({
            "field": "profile_photo_url",
            "label": "Foto de Perfil",
            "priority": "high",
            "description": "Adicione uma foto profissional para aumentar sua credibilidade"
        })
    
    if not member.bio or len(member.bio) < 50:
        suggestions.append({
            "field": "bio",
            "label": "Biografia",
            "priority": "high",
            "description": "Conte um pouco sobre você e sua trajetória profissional"
        })
    
    if not member.company_description:
        suggestions.append({
            "field": "company_description",
            "label": "Descrição da Empresa",
            "priority": "medium",
            "description": "Descreva sua empresa e o que ela faz"
        })
    
    if not member.linkedin_url:
        suggestions.append({
            "field": "linkedin_url",
            "label": "LinkedIn",
            "priority": "high",
            "description": "Conecte seu perfil do LinkedIn para facilitar o networking"
        })
    
    if not member.website:
        suggestions.append({
            "field": "website",
            "label": "Website",
            "priority": "medium",
            "description": "Adicione o site da sua empresa"
        })
    
    if not member.interests:
        suggestions.append({
            "field": "interests",
            "label": "Áreas de Interesse",
            "priority": "medium",
            "description": "Compartilhe suas áreas de interesse para encontrar conexões relevantes"
        })
    
    if not member.skills:
        suggestions.append({
            "field": "skills",
            "label": "Habilidades",
            "priority": "medium",
            "description": "Liste suas principais habilidades profissionais"
        })
    
    if not member.city or not member.state:
        suggestions.append({
            "field": "location",
            "label": "Localização",
            "priority": "low",
            "description": "Adicione sua cidade e estado"
        })
    
    return suggestions


def update_member_profile(db: Session, member_id: str, profile_data: Dict[str, Any]) -> Member:
    """
    Update member profile and recalculate completion
    """
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membro não encontrado"
        )
    
    # Update fields
    for field, value in profile_data.items():
        if value is not None and hasattr(member, field):
            setattr(member, field, value)
    
    # Recalculate completion
    user = db.query(User).filter(User.id == member.user_id).first()
    if user:
        member.profile_completed = calculate_profile_completion(member, user)
    
    db.commit()
    db.refresh(member)
    
    return member
