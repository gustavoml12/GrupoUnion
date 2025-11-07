"""add_referral_system_to_users

Revision ID: 57f3f7b04d5c
Revises: d98f55f53223
Create Date: 2025-11-05 20:18:34.420213

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '57f3f7b04d5c'
down_revision: Union[str, None] = 'd98f55f53223'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add referral_code column with unique constraint
    op.add_column('users', sa.Column('referral_code', sa.String(), nullable=True))
    op.create_index(op.f('ix_users_referral_code'), 'users', ['referral_code'], unique=True)
    
    # Add referred_by_id column with foreign key
    op.add_column('users', sa.Column('referred_by_id', sa.String(), nullable=True))
    op.create_foreign_key('fk_users_referred_by', 'users', 'users', ['referred_by_id'], ['id'])
    
    # Generate referral codes for existing users
    op.execute("""
        UPDATE users 
        SET referral_code = substring(md5(random()::text || id::text) from 1 for 11)
        WHERE referral_code IS NULL
    """)
    
    # Make referral_code NOT NULL after populating
    op.alter_column('users', 'referral_code', nullable=False)


def downgrade() -> None:
    op.drop_constraint('fk_users_referred_by', 'users', type_='foreignkey')
    op.drop_column('users', 'referred_by_id')
    op.drop_index(op.f('ix_users_referral_code'), table_name='users')
    op.drop_column('users', 'referral_code')
