"""
Member Statistics Schemas
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ReferredVisitor(BaseModel):
    """Visitor referred by this member"""
    id: str
    full_name: Optional[str]
    email: str
    status: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class MemberStatistics(BaseModel):
    """Complete member statistics"""
    # Basic info
    user_id: str
    full_name: Optional[str]
    email: str
    role: str
    status: str
    referral_code: str
    
    # Referral stats
    total_visitors_referred: int
    active_members_referred: int
    pending_visitors_referred: int
    
    # Detailed lists
    visitors_referred: List[ReferredVisitor]
    
    class Config:
        from_attributes = True
