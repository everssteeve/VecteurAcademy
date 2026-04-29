from pydantic import BaseModel

from schemas.user import ModuleProgressRead, QuizResultRead


class ModuleStartRequest(BaseModel):
    module_id: str


class ProgressRead(BaseModel):
    module_progress: list[ModuleProgressRead]
    quiz_results: list[QuizResultRead]
