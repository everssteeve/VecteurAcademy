"""Tests for /progress and /quiz/result endpoints.

Requires PostgreSQL with DATABASE_URL set.
Run: uv run pytest tests/test_progress.py
"""

import os
import time

from httpx import ASGITransport, AsyncClient
from jose import jwt
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

_JWT_SECRET = os.environ.get("JWT_SECRET", "test-secret-min-32-chars-required!!")
_ALGORITHM = "HS256"


def make_token(user_id: str, expired: bool = False) -> str:
    now = int(time.time())
    exp = now - 60 if expired else now + 300
    return jwt.encode(
        {"sub": user_id, "iat": now, "exp": exp}, _JWT_SECRET, algorithm=_ALGORITHM
    )


def auth_headers(user_id: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {make_token(user_id)}"}


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
            "first_name": "Test",
            "last_name": "User",
            "esn_name": "TestESN",
        },
    )
    assert resp.status_code == 201
    return resp.json()["id"]


# ── Auth tests ────────────────────────────────────────────────────────────────


async def test_get_progress_without_token_returns_401(
    client: AsyncClient, user_id: str
):
    resp = await client.get("/progress")
    assert resp.status_code == 401


async def test_get_progress_with_invalid_token_returns_401(
    client: AsyncClient, user_id: str
):
    resp = await client.get("/progress", headers={"Authorization": "Bearer not-a-jwt"})
    assert resp.status_code == 401


async def test_get_progress_with_expired_token_returns_401(
    client: AsyncClient, user_id: str
):
    resp = await client.get(
        "/progress",
        headers={"Authorization": f"Bearer {make_token(user_id, expired=True)}"},
    )
    assert resp.status_code == 401


async def test_post_progress_module_without_token_returns_401(
    client: AsyncClient, user_id: str
):
    resp = await client.post("/progress/module", json={"module_id": "ai-engineering"})
    assert resp.status_code == 401


async def test_post_quiz_result_without_token_returns_401(
    client: AsyncClient, user_id: str
):
    resp = await client.post(
        "/quiz/result",
        json={
            "quiz_type": "module",
            "module_id": "ai-engineering",
            "score": 1,
            "max_score": 2,
            "answers": [],
        },
    )
    assert resp.status_code == 401


async def test_public_routes_remain_accessible(client: AsyncClient):
    assert (await client.get("/health")).status_code == 200
    resp = await client.post(
        "/auth/register",
        json={
            "email": "pub@esn.fr",
            "password": "Secur3P@ss",
            "first_name": "A",
            "last_name": "B",
            "esn_name": "E",
        },
    )
    assert resp.status_code == 201


# ── Functional tests ──────────────────────────────────────────────────────────


async def test_get_progress_empty(client: AsyncClient, user_id: str):
    resp = await client.get("/progress", headers=auth_headers(user_id))
    assert resp.status_code == 200
    data = resp.json()
    assert data["module_progress"] == []
    assert data["quiz_results"] == []


async def test_track_module_start(client: AsyncClient, user_id: str):
    resp = await client.post(
        "/progress/module",
        json={"module_id": "ai-engineering"},
        headers=auth_headers(user_id),
    )
    assert resp.status_code == 200

    progress = (await client.get("/progress", headers=auth_headers(user_id))).json()
    assert len(progress["module_progress"]) == 1
    assert progress["module_progress"][0]["module_id"] == "ai-engineering"
    assert progress["module_progress"][0]["completed_at"] is None


async def test_track_module_start_idempotent(client: AsyncClient, user_id: str):
    body = {"module_id": "ai-engineering"}
    await client.post("/progress/module", json=body, headers=auth_headers(user_id))
    resp = await client.post(
        "/progress/module", json=body, headers=auth_headers(user_id)
    )
    assert resp.status_code == 200

    progress = (await client.get("/progress", headers=auth_headers(user_id))).json()
    assert len(progress["module_progress"]) == 1


_ANSWERS = [
    {"question_id": "q1", "selected_option": "A", "is_correct": True},
    {"question_id": "q2", "selected_option": "B", "is_correct": False},
]


async def test_save_module_quiz_result(client: AsyncClient, user_id: str):
    resp = await client.post(
        "/quiz/result",
        json={
            "quiz_type": "module",
            "module_id": "ai-engineering",
            "score": 1,
            "max_score": 2,
            "answers": _ANSWERS,
        },
        headers=auth_headers(user_id),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["quiz_type"] == "module"
    assert data["score"] == 1

    progress = (await client.get("/progress", headers=auth_headers(user_id))).json()
    assert len(progress["module_progress"]) == 1
    assert progress["module_progress"][0]["completed_at"] is not None
    assert len(progress["quiz_results"]) == 1


async def test_save_final_quiz_result(client: AsyncClient, user_id: str):
    resp = await client.post(
        "/quiz/result",
        json={
            "quiz_type": "final",
            "module_id": None,
            "score": 14,
            "max_score": 18,
            "answers": _ANSWERS,
        },
        headers=auth_headers(user_id),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["quiz_type"] == "final"
    assert data["module_id"] is None

    progress = (await client.get("/progress", headers=auth_headers(user_id))).json()
    assert progress["module_progress"] == []
    assert len(progress["quiz_results"]) == 1


async def test_progress_isolated_per_user(client: AsyncClient, user_id: str):
    """User A's token cannot access user B's data — each token only serves its own user."""
    resp2 = await client.post(
        "/auth/register",
        json={
            "email": "other@esn.fr",
            "password": "Secur3P@ss",
            "first_name": "Other",
            "last_name": "User",
            "esn_name": "OtherESN",
        },
    )
    other_id = resp2.json()["id"]

    # Seed data for user B using user B's token
    await client.post(
        "/progress/module",
        json={"module_id": "foundation-models"},
        headers=auth_headers(other_id),
    )

    # User A's token returns only user A's data (empty), not user B's
    progress = (await client.get("/progress", headers=auth_headers(user_id))).json()
    assert progress["module_progress"] == []
