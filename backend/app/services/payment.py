"""
Payment Service - Business logic for payments and applications
"""
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, UserRole, UserStatus
from app.models.member import Member, MemberStatus
from app.models.payment import Payment, PaymentStatus, PaymentType
from app.schemas.payment import ApplicationSubmit, PaymentProofUpload, PaymentVerify


# PIX Configuration
PIX_KEY = "64981211030"  # Chave PIX do Ecosistema Union
MONTHLY_FEE = 197.00  # Taxa mensal em reais


def submit_application(db: Session, user_id: str, application_data: ApplicationSubmit) -> Member:
    """
    Visitor submits application to become member
    """
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Check if user is a VISITOR
    if user.role != UserRole.VISITOR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas visitantes podem se candidatar"
        )
    
    # Check if application already exists
    existing_member = db.query(Member).filter(Member.user_id == user_id).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidatura já existe"
        )
    
    # Create member application
    member = Member(
        user_id=user_id,
        company_name=application_data.company_name,
        business_category=application_data.business_category,
        company_description=application_data.company_description,
        website=application_data.website,
        business_phone=application_data.business_phone,
        business_email=application_data.business_email,
        city=application_data.city,
        state=application_data.state,
        linkedin_url=application_data.linkedin_url,
        instagram_url=application_data.instagram_url,
        application_reason=application_data.application_reason,
        status=MemberStatus.PAYMENT_PENDING,
        reputation_score=100.0,
        total_referrals_given=0,
        total_referrals_received=0,
        total_deals_closed=0,
    )
    
    db.add(member)
    db.commit()
    db.refresh(member)
    
    # Create initial payment (onboarding fee)
    payment = Payment(
        user_id=user_id,
        payment_type=PaymentType.ONBOARDING,
        amount=MONTHLY_FEE,
        status=PaymentStatus.PENDING,
        pix_key=PIX_KEY,
        due_date=datetime.utcnow() + timedelta(days=7),  # 7 days to pay
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return member


def upload_payment_proof(db: Session, user_id: str, proof_data: PaymentProofUpload) -> Payment:
    """
    User uploads payment proof
    """
    # Get pending payment
    payment = db.query(Payment).filter(
        Payment.user_id == user_id,
        Payment.status == PaymentStatus.PENDING
    ).order_by(Payment.created_at.desc()).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento pendente não encontrado"
        )
    
    # Update payment with proof
    payment.payment_proof_url = proof_data.payment_proof_url
    payment.payment_date = proof_data.payment_date or datetime.utcnow()
    payment.status = PaymentStatus.PROOF_UPLOADED
    
    # Update member status
    member = db.query(Member).filter(Member.user_id == user_id).first()
    if member:
        member.status = MemberStatus.PAYMENT_PROOF_UPLOADED
    
    db.commit()
    db.refresh(payment)
    
    return payment


def get_pending_payments(db: Session) -> List[Payment]:
    """
    Get all payments with proof uploaded (for Hub to verify)
    """
    return db.query(Payment).filter(
        Payment.status == PaymentStatus.PROOF_UPLOADED
    ).all()


def verify_payment(db: Session, payment_id: str, verify_data: PaymentVerify, verifier_id: str) -> Payment:
    """
    Hub verifies payment proof
    When approved, automatically promotes visitor to MEMBER
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )
    
    if verify_data.approved:
        # Approve payment
        payment.status = PaymentStatus.VERIFIED
        payment.verified_by = verifier_id
        payment.verified_at = datetime.utcnow()
        
        # Get user and member
        user = db.query(User).filter(User.id == payment.user_id).first()
        member = db.query(Member).filter(Member.user_id == payment.user_id).first()
        
        if user and member:
            # Promote visitor to MEMBER
            user.role = UserRole.MEMBER
            user.status = UserStatus.ACTIVE
            
            # Update member status
            member.status = MemberStatus.APPROVED
            member.approved_at = datetime.utcnow()
            member.approved_by = verifier_id
    else:
        # Reject payment
        payment.status = PaymentStatus.REJECTED
        payment.verified_by = verifier_id
        payment.verified_at = datetime.utcnow()
        payment.rejection_reason = verify_data.rejection_reason
        
        # Update member status back to payment pending
        member = db.query(Member).filter(Member.user_id == payment.user_id).first()
        if member:
            member.status = MemberStatus.PAYMENT_PENDING
    
    db.commit()
    db.refresh(payment)
    
    return payment


def get_my_payment(db: Session, user_id: str) -> Optional[Payment]:
    """
    Get user's latest payment
    """
    return db.query(Payment).filter(
        Payment.user_id == user_id
    ).order_by(Payment.created_at.desc()).first()


def get_payment_by_id(db: Session, payment_id: str) -> Optional[Payment]:
    """
    Get payment by ID
    """
    return db.query(Payment).filter(Payment.id == payment_id).first()
