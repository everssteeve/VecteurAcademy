"""Tests for /auth/register and /auth/login endpoints.

Requires PostgreSQL with DATABASE_URL set.
Run: uv run pytest tests/test_auth.py
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


_VALID_USER = {"email": "test@esn.fr", "password": "Secur3P@ss", "esn_name": "TestESN"}


async def test_register_success(client: AsyncClient):
    resp = await client.post("/auth/register", json=_VALID_USER)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "test@esn.fr"
    assert data["esn_name"] == "TestESN"
    assert data["role"] == "learner"
    assert "password_hash" not in data
    assert "password" not in data


async def test_register_duplicate_email(client: AsyncClient):
    await client.post("/auth/register", json=_VALID_USER)
    resp = await client.post("/auth/register", json=_VALID_USER)
    assert resp.status_code == 409


async def test_login_success(client: AsyncClient):
    await client.post("/auth/register", json=_VALID_USER)
    resp = await client.post(
        "/auth/login",
        json={"email": _VALID_USER["email"], "password": _VALID_USER["password"]},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "test@esn.fr"
    assert data["esn_name"] == "TestESN"


async def test_login_wrong_password(client: AsyncClient):
    await client.post("/auth/register", json=_VALID_USER)
    resp = await client.post(
        "/auth/login",
        json={"email": _VALID_USER["email"], "password": "WrongPassword1"},
    )
    assert resp.status_code == 401


async def test_login_unknown_email(client: AsyncClient):
    resp = await client.post(
        "/auth/login",
        json={"email": "unknown@esn.fr", "password": "Secur3P@ss"},
    )
    assert resp.status_code == 401


async def test_login_same_error_for_wrong_pw_and_unknown_email(client: AsyncClient):
    await client.post("/auth/register", json=_VALID_USER)
    r1 = await client.post(
        "/auth/login", json={"email": _VALID_USER["email"], "password": "Wrong1"}
    )
    r2 = await client.post(
        "/auth/login", json={"email": "nobody@esn.fr", "password": "Secur3P@ss"}
    )
    assert r1.json()["detail"] == r2.json()["detail"]
