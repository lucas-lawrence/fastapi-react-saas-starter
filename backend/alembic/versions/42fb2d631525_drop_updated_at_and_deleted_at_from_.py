"""drop updated_at and deleted_at from refresh_tokens

Revision ID: 42fb2d631525
Revises: 007ee7a91eac
Create Date: 2026-06-11 01:53:40.314759

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '42fb2d631525'
down_revision: Union[str, None] = '007ee7a91eac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('refresh_tokens', 'updated_at')
    op.drop_column('refresh_tokens', 'deleted_at')


def downgrade() -> None:
    op.add_column('refresh_tokens', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('refresh_tokens', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
