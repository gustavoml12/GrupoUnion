"""
Profile Schemas
"""
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl


# Profile Update Schema
class ProfileUpdate(BaseModel):
    """Schema for updating profile"""
    bio: Optional[str] = Field(None, max_length=1000)
    company_description: Optional[str] = Field(None, max_length=2000)
    website: Optional[str] = None
    business_phone: Optional[str] = None
    business_email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None
    interests: Optional[str] = Field(None, max_length=500)
    skills: Optional[str] = Field(None, max_length=500)


# Profile Completion Response
class ProfileCompletion(BaseModel):
    """Schema for profile completion status"""
    completion_percentage: int = Field(..., ge=0, le=100)
    suggestions: List[dict]
    
    class Config:
        from_attributes = True


# Profile Suggestion
class ProfileSuggestion(BaseModel):
    """Schema for profile completion suggestion"""
    field: str
    label: str
    priority: str  # high, medium, low
    description: str
