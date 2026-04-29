from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from deps import CurrentUser, get_current_user
from schemas.progress import ModuleStartRequest, ProgressRead
from schemas.user import QuizResultCreate, QuizResultRead
from services.progress_service import ProgressService

router = APIRouter(tags=["progress"])


@router.get("/progress", response_model=ProgressRead)
async def get_progress(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> ProgressRead:
    return await ProgressService(session).get_progress(current_user.user_id)


@router.post("/progress/module", status_code=200)
async def track_module_start(
    body: ModuleStartRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> dict:
    await ProgressService(session).track_module_start(
        current_user.user_id, body.module_id
    )
    return {}


@router.post("/quiz/result", response_model=QuizResultRead, status_code=201)
async def save_quiz_result(
    body: QuizResultCreate,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> QuizResultRead:
    return await ProgressService(session).save_quiz_result_for_user(
        current_user.user_id, body
    )
