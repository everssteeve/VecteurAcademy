import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from schemas.progress import ModuleStartRequest, ProgressRead, QuizResultWithUser
from schemas.user import QuizResultRead
from services.progress_service import ProgressService

router = APIRouter(tags=["progress"])


@router.get("/progress", response_model=ProgressRead)
async def get_progress(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> ProgressRead:
    return await ProgressService(session).get_progress(user_id)


@router.post("/progress/module", status_code=200)
async def track_module_start(
    body: ModuleStartRequest,
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> dict:
    await ProgressService(session).track_module_start(body.user_id, body.module_id)
    return {}


@router.post("/quiz/result", response_model=QuizResultRead, status_code=201)
async def save_quiz_result(
    body: QuizResultWithUser,
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> QuizResultRead:
    return await ProgressService(session).save_quiz_result(body)
