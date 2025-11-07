"""
Profile API
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import os
import uuid
from pathlib import Path

from app.core.database import get_db
from app.models.user import User
from app.models.member import Member
from app.schemas.profile import ProfileUpdate, ProfileCompletion
from app.services import profile as profile_service
from app.api.dependencies import get_current_active_user


router = APIRouter(prefix="/profile", tags=["profile"])

# Upload directory
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")
PROFILE_PHOTOS_DIR = os.path.join(UPLOAD_DIR, "profile_photos")
os.makedirs(PROFILE_PHOTOS_DIR, exist_ok=True)


@router.get("/completion", response_model=ProfileCompletion)
def get_profile_completion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get profile completion status and suggestions
    """
    # Get member profile
    if not hasattr(current_user, 'member') or not current_user.member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você precisa completar seu cadastro de membro primeiro"
        )
    
    member = current_user.member
    
    # Calculate completion
    completion = profile_service.calculate_profile_completion(member, current_user)
    suggestions = profile_service.get_profile_suggestions(member, current_user)
    
    return {
        "completion_percentage": completion,
        "suggestions": suggestions
    }


@router.patch("/update", response_model=dict)
def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update profile information
    """
    # Get member profile
    if not hasattr(current_user, 'member') or not current_user.member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você precisa completar seu cadastro de membro primeiro"
        )
    
    member_id = current_user.member.id
    update_dict = profile_data.model_dump(exclude_unset=True)
    
    updated_member = profile_service.update_member_profile(db, member_id, update_dict)
    
    return {
        "message": "Perfil atualizado com sucesso",
        "profile_completed": updated_member.profile_completed
    }


@router.post("/photo", response_model=dict)
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload profile photo
    """
    # Get member profile
    if not hasattr(current_user, 'member') or not current_user.member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você precisa completar seu cadastro de membro primeiro"
        )
    
    # Validate file type
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de arquivo não permitido. Use: {', '.join(allowed_extensions)}"
        )
    
    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    file_content = await file.read()
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo muito grande. Tamanho máximo: 5MB"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(PROFILE_PHOTOS_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Update member profile
    member = current_user.member
    
    # Delete old photo if exists
    if member.profile_photo_url:
        old_file_path = os.path.join(UPLOAD_DIR, member.profile_photo_url.lstrip('/uploads/'))
        if os.path.exists(old_file_path):
            try:
                os.remove(old_file_path)
            except Exception as e:
                print(f"Error deleting old photo: {e}")
    
    # Update database
    photo_url = f"/uploads/profile_photos/{unique_filename}"
    updated_member = profile_service.update_member_profile(
        db,
        member.id,
        {"profile_photo_url": photo_url}
    )
    
    return {
        "message": "Foto de perfil atualizada com sucesso",
        "photo_url": photo_url,
        "profile_completed": updated_member.profile_completed
    }


@router.delete("/photo", response_model=dict)
def delete_profile_photo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete profile photo
    """
    # Get member profile
    if not hasattr(current_user, 'member') or not current_user.member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você precisa completar seu cadastro de membro primeiro"
        )
    
    member = current_user.member
    
    if not member.profile_photo_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma foto de perfil encontrada"
        )
    
    # Delete file
    file_path = os.path.join(UPLOAD_DIR, member.profile_photo_url.lstrip('/uploads/'))
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting photo: {e}")
    
    # Update database
    updated_member = profile_service.update_member_profile(
        db,
        member.id,
        {"profile_photo_url": None}
    )
    
    return {
        "message": "Foto de perfil removida com sucesso",
        "profile_completed": updated_member.profile_completed
    }
