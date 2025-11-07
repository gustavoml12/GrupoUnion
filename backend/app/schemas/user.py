from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    referral_code: Optional[str] = Field(None, description="Código de indicação de quem convidou")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "joao@example.com",
                "password": "SenhaForte123!",
                "full_name": "João Silva",
                "phone": "+55 11 98765-4321",
                "referral_code": "ABC123XYZ"
            }
        }


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "joao@example.com",
                "password": "SenhaForte123!"
            }
        }


class ReferrerInfo(BaseModel):
    """Schema for referrer basic info"""
    id: str
    full_name: Optional[str] = None
    email: str
    
    class Config:
        from_attributes = True


class UserResponse(UserBase):
    """Schema for user response"""
    id: str
    role: UserRole
    status: UserStatus
    email_verified: bool
    referral_code: str
    referred_by_id: Optional[str] = None
    referred_by: Optional[ReferrerInfo] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for user update"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[UserStatus] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "João Silva",
                "phone": "+55 11 98765-4321",
                "status": "ACTIVE"
            }
        }


class Token(BaseModel):
    """Schema for token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
