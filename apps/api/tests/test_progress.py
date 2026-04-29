"""Tests for /progress and /quiz/result endpoints.

Requires PostgreSQL with DATABASE_URL set.
Run: uv run pytest tests/test_progress.py
"""

import os

from httpx import ASGITransport, AsyncClient
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from db import get_session
from main import app
from models import Base

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5433/test_formations_ia",
)

engine = create_async_engine(DATABASE_URL, echo=False, poolclass=NullPool)
TestSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_session() -> AsyncSession:  # type: ignore[return]
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncClient:
    app.dependency_overrides[get_session] = override_get_session
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def user_id(client: AsyncClient) -> str:
    resp = await client.post(
        "/auth/register",
        json={
            "email": "learner@esn.fr",
            "password": "Secur3P@ss",
            "esn_name": "TestESN",
        },
    )
    assert resp.status_code == 201
    return resp.json()["id"]


async def test_get_progress_empty(client: AsyncClient, user_id: str):
    resp = await client.get(f"/progress?user_id={user_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["module_progress"] == []
    assert data["quiz_results"] == []


async def test_track_module_start(client: AsyncClient, user_id: str):
    resp = await client.post(
        "/progress/module",
        json={"user_id": user_id, "module_id": "ai-engineering"},
    )
    assert resp.status_code == 200

    progress = (await client.get(f"/progress?user_id={user_id}")).json()
    assert len(progress["module_progress"]) == 1
    assert progress["module_progress"][0]["module_id"] == "ai-engineering"
    assert progress["module_progress"][0]["completed_at"] is None


async def test_track_module_start_idempotent(client: AsyncClient, user_id: str):
    body = {"user_id": user_id, "module_id": "ai-engineering"}
    await client.post("/progress/module", json=body)
    resp = await client.post("/progress/module", json=body)
    assert resp.status_code == 200

    progress = (await client.get(f"/progress?user_id={user_id}")).json()
    assert len(progress["module_progress"]) == 1


_ANSWERS = [
    {"question_id": "q1", "selected_option": "A", "is_correct": True},
    {"question_id": "q2", "selected_option": "B", "is_correct": False},
]


async def test_save_module_quiz_result(client: AsyncClient, user_id: str):
    resp = await client.post(
        "/quiz/result",
        json={
            "user_id": user_id,
            "quiz_type": "module",
            "module_id": "ai-engineering",
            "score": 1,
            "max_score": 2,
            "answers": _ANSWERS,
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["quiz_type"] == "module"
    assert data["score"] == 1

    progress = (await client.get(f"/progress?user_id={user_id}")).json()
    assert len(progress["module_progress"]) == 1
    assert progress["module_progress"][0]["completed_at"] is not None
    assert len(progress["quiz_results"]) == 1


async def test_save_final_quiz_result(client: AsyncClient, user_id: str):
    resp = await client.post(
        "/quiz/result",
        json={
            "user_id": user_id,
            "quiz_type": "final",
            "module_id": None,
            "score": 14,
            "max_score": 18,
            "answers": _ANSWERS,
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["quiz_type"] == "final"
    assert data["module_id"] is None

    progress = (await client.get(f"/progress?user_id={user_id}")).json()
    assert progress["module_progress"] == []
    assert len(progress["quiz_results"]) == 1


async def test_get_progress_returns_only_own_data(client: AsyncClient, user_id: str):
    resp2 = await client.post(
        "/auth/register",
        json={
            "email": "other@esn.fr",
            "password": "Secur3P@ss",
            "esn_name": "OtherESN",
        },
    )
    other_id = resp2.json()["id"]

    await client.post(
        "/progress/module",
        json={"user_id": other_id, "module_id": "foundation-models"},
    )

    progress = (await client.get(f"/progress?user_id={user_id}")).json()
    assert progress["module_progress"] == []
