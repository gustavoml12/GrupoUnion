from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.services import auth as auth_service
from app.api.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user
    
    - **email**: Valid email address
    - **password**: Minimum 8 characters
    - **full_name**: User's full name (optional)
    - **phone**: Phone number (optional)
    """
    # Create user
    db_user = auth_service.create_user(db, user)
    
    # Create tokens
    tokens = auth_service.create_tokens(db_user)
    
    # Return tokens and user data
    return {
        **tokens,
        "user": UserResponse.from_orm(db_user)
    }


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password
    
    - **email**: Registered email
    - **password**: User password
    """
    # Authenticate user
    user = auth_service.authenticate_user(db, credentials)
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create tokens
    tokens = auth_service.create_tokens(user)
    
    # Return tokens and user data
    return {
        **tokens,
        "user": UserResponse.from_orm(user)
    }


@router.post("/logout")
def logout():
    """
    Logout user (client should delete tokens)
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current authenticated user info
    Requires: Valid JWT token
    """
    return current_user
