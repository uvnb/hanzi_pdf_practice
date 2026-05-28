"""Create Hanzi, users and notebook tables.

Revision ID: 20260527_0001
Revises:
Create Date: 2026-05-27
"""

from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260527_0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "hanzi_characters",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("character", sa.String(length=4), nullable=False),
        sa.Column("pinyin", sa.String(length=50), nullable=False),
        sa.Column("hsk_level", sa.SmallInteger(), nullable=True),
        sa.Column("meaning_vi", sa.Text(), nullable=False),
        sa.Column("example_sentences", sa.JSON(), nullable=False),
        sa.Column("ai_enriched", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_hanzi_characters_character",
        "hanzi_characters",
        ["character"],
        unique=True,
    )
    op.create_index(
        "ix_hanzi_characters_hsk_level",
        "hanzi_characters",
        ["hsk_level"],
        unique=False,
    )
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("auth_provider", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table(
        "user_notebooks",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("character_id", sa.Uuid(), nullable=False),
        sa.Column("added_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["character_id"], ["hanzi_characters.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "character_id"),
    )


def downgrade() -> None:
    op.drop_table("user_notebooks")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_index("ix_hanzi_characters_hsk_level", table_name="hanzi_characters")
    op.drop_index("ix_hanzi_characters_character", table_name="hanzi_characters")
    op.drop_table("hanzi_characters")
