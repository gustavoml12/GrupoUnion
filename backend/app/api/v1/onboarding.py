"""
Onboarding API - Application and payment endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.member import MemberResponse
from app.schemas.payment import (
    ApplicationSubmit,
    PaymentProofUpload,
    PaymentVerify,
    PaymentResponse
)
from app.services import payment as payment_service
from app.api.dependencies import get_current_active_user, require_role


router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("/apply", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def submit_application(
    application_data: ApplicationSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Visitor submits application to become member
    Requires: VISITOR role
    """
    if current_user.role != UserRole.VISITOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas visitantes podem se candidatar"
        )
    
    member = payment_service.submit_application(db, current_user.id, application_data)
    return member


@router.post("/payment/proof", response_model=PaymentResponse)
def upload_payment_proof(
    proof_data: PaymentProofUpload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload payment proof (comprovante)
    """
    payment = payment_service.upload_payment_proof(db, current_user.id, proof_data)
    return payment


@router.get("/payment/me", response_model=PaymentResponse)
def get_my_payment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get my latest payment
    """
    payment = payment_service.get_my_payment(db, current_user.id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum pagamento encontrado"
        )
    return payment


@router.get("/payments/pending", response_model=List[PaymentResponse])
def get_pending_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Get all payments with proof uploaded (for Hub to verify)
    Requires: HUB or ADMIN role
    """
    payments = payment_service.get_pending_payments(db)
    return payments


@router.post("/payments/{payment_id}/verify", response_model=PaymentResponse)
def verify_payment(
    payment_id: str,
    verify_data: PaymentVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.HUB, UserRole.ADMIN))
):
    """
    Hub verifies payment proof
    Requires: HUB or ADMIN role
    """
    payment = payment_service.verify_payment(db, payment_id, verify_data, current_user.id)
    return payment


@router.get("/pix-info")
def get_pix_info():
    """
    Get PIX payment information
    """
    return {
        "pix_key": payment_service.PIX_KEY,
        "amount": payment_service.MONTHLY_FEE,
        "description": "Taxa de inscrição - Ecosistema Union",
        "instructions": [
            "1. Abra o app do seu banco",
            "2. Escolha PIX",
            "3. Copie a chave PIX abaixo",
            "4. Cole no app do banco",
            "5. Confirme o valor de R$ 197,00",
            "6. Faça o pagamento",
            "7. Tire print do comprovante",
            "8. Faça upload aqui na plataforma"
        ]
    }
