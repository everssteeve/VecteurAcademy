"""initial_user_schema

Revision ID: 0001
Revises:
Create Date: 2026-04-28

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("esn_name", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default=sa.text("'learner'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.CheckConstraint("role IN ('learner', 'trainer', 'admin')", name="ck_users_role"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )

    op.create_table(
        "module_progress",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module_id", sa.String(100), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "module_id", name="uq_module_progress_user_module"),
    )

    op.create_table(
        "quiz_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quiz_type", sa.String(20), nullable=False),
        sa.Column("module_id", sa.String(100), nullable=True),
        sa.Column("score", sa.Integer, nullable=False),
        sa.Column("max_score", sa.Integer, nullable=False),
        sa.Column("answers", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("answered_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.CheckConstraint("quiz_type IN ('module', 'final')", name="ck_quiz_results_type"),
        sa.CheckConstraint("quiz_type = 'final' OR module_id IS NOT NULL", name="ck_quiz_results_module_id"),
        sa.CheckConstraint("score >= 0", name="ck_quiz_results_score"),
        sa.CheckConstraint("max_score > 0", name="ck_quiz_results_max_score"),
    )


def downgrade() -> None:
    op.drop_table("quiz_results")
    op.drop_table("module_progress")
    op.drop_table("users")
