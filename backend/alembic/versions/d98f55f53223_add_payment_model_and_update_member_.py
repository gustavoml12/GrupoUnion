"""add payment model and update member fields

Revision ID: d98f55f53223
Revises: 4e7df46f1c4a
Create Date: 2025-11-05 18:49:05.919047

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd98f55f53223'
down_revision: Union[str, None] = '4e7df46f1c4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new MemberStatus enum values
    op.execute("ALTER TYPE memberstatus ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING'")
    op.execute("ALTER TYPE memberstatus ADD VALUE IF NOT EXISTS 'PAYMENT_PROOF_UPLOADED'")
    op.execute("ALTER TYPE memberstatus ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL'")
    
    # Add new columns to members table
    op.add_column('members', sa.Column('application_reason', sa.Text(), nullable=True))
    op.add_column('members', sa.Column('linkedin_url', sa.String(), nullable=True))
    op.add_column('members', sa.Column('instagram_url', sa.String(), nullable=True))
    
    # Create payments table
    op.create_table('payments',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('payment_type', sa.Enum('ONBOARDING', 'MONTHLY', 'ANNUAL', name='paymenttype'), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'PROOF_UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED', name='paymentstatus'), nullable=False),
        sa.Column('pix_key', sa.String(), nullable=True),
        sa.Column('pix_qr_code', sa.Text(), nullable=True),
        sa.Column('payment_proof_url', sa.String(), nullable=True),
        sa.Column('payment_date', sa.DateTime(), nullable=True),
        sa.Column('verified_by', sa.String(), nullable=True),
        sa.Column('verified_at', sa.DateTime(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('reference_month', sa.String(), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['verified_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop payments table
    op.drop_table('payments')
    
    # Drop payment enums
    op.execute('DROP TYPE IF EXISTS paymentstatus')
    op.execute('DROP TYPE IF EXISTS paymenttype')
    
    # Remove columns from members table
    op.drop_column('members', 'instagram_url')
    op.drop_column('members', 'linkedin_url')
    op.drop_column('members', 'application_reason')
