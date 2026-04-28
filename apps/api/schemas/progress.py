import uuid

from pydantic import BaseModel

from schemas.user import ModuleProgressRead, QuizResultCreate, QuizResultRead


class ModuleStartRequest(BaseModel):
    user_id: uuid.UUID
    module_id: str


class QuizResultWithUser(QuizResultCreate):
    user_id: uuid.UUID


class ProgressRead(BaseModel):
    module_progress: list[ModuleProgressRead]
    quiz_results: list[QuizResultRead]
