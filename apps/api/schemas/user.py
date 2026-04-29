from datetime import datetime
from typing import Literal
import uuid

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    esn_name: str


class UserRead(BaseModel):
    id: uuid.UUID
    email: EmailStr
    first_name: str | None
    last_name: str | None
    esn_name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ModuleProgressRead(BaseModel):
    module_id: str
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class QuizResultCreate(BaseModel):
    quiz_type: Literal["module", "final"]
    module_id: str | None
    score: int
    max_score: int
    answers: list[dict]


class QuizResultRead(QuizResultCreate):
    id: uuid.UUID
    answered_at: datetime

    model_config = {"from_attributes": True}
