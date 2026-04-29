"""Tests for SQLAlchemy model constraints.

Requires PostgreSQL with DATABASE_URL set (e.g. postgresql+asyncpg://postgres:postgres@localhost:5432/test_formations_ia).
Run: uv run pytest tests/test_models.py
"""

import os

import pytest
import pytest_asyncio
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from models import Base, ModuleProgress, QuizResult, User

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5433/test_formations_ia",
)

# NullPool prevents connection reuse between tests — required with asyncpg
# to avoid "another operation is in progress" errors after IntegrityError
engine = create_async_engine(DATABASE_URL, echo=False, poolclass=NullPool)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def session() -> AsyncSession:
    async with AsyncSessionLocal() as s:
        yield s


async def _make_user(session: AsyncSession, email: str = "test@example.com") -> User:
    user = User(email=email, password_hash="hashed_pw", esn_name="ESN Test")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def test_user_unique_email(session: AsyncSession):
    await _make_user(session, "dup@example.com")
    with pytest.raises(IntegrityError):
        await _make_user(session, "dup@example.com")


async def test_module_progress_unique_per_user_module(session: AsyncSession):
    user = await _make_user(session)
    mp = ModuleProgress(user_id=user.id, module_id="ai-engineering")
    session.add(mp)
    await session.commit()

    with pytest.raises(IntegrityError):
        mp2 = ModuleProgress(user_id=user.id, module_id="ai-engineering")
        session.add(mp2)
        await session.commit()


async def test_quiz_result_check_module_id_required_for_module_type(
    session: AsyncSession,
):
    user = await _make_user(session)
    with pytest.raises(IntegrityError):
        qr = QuizResult(
            user_id=user.id,
            quiz_type="module",
            module_id=None,
            score=5,
            max_score=10,
            answers=[],
        )
        session.add(qr)
        await session.commit()


async def test_cascade_delete(session: AsyncSession):
    from sqlalchemy import func, select

    user = await _make_user(session)
    session.add(ModuleProgress(user_id=user.id, module_id="ai-engineering"))
    session.add(
        QuizResult(
            user_id=user.id,
            quiz_type="final",
            module_id=None,
            score=8,
            max_score=10,
            answers=[{"question_id": "q1", "selected_option": 0, "is_correct": True}],
        )
    )
    await session.commit()

    await session.delete(user)
    await session.commit()

    mp_count = await session.scalar(
        select(func.count()).where(ModuleProgress.user_id == user.id)
    )
    qr_count = await session.scalar(
        select(func.count()).where(QuizResult.user_id == user.id)
    )
    assert mp_count == 0
    assert qr_count == 0
