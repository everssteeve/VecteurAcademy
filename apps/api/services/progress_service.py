from datetime import UTC, datetime
import uuid

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import ModuleProgress, QuizResult
from schemas.progress import ProgressRead
from schemas.user import ModuleProgressRead, QuizResultCreate, QuizResultRead


class ProgressService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_progress(self, user_id: uuid.UUID) -> ProgressRead:
        mp_result = await self.session.execute(
            select(ModuleProgress).where(ModuleProgress.user_id == user_id)
        )
        module_progress = [
            ModuleProgressRead.model_validate(row) for row in mp_result.scalars().all()
        ]

        qr_result = await self.session.execute(
            select(QuizResult)
            .where(QuizResult.user_id == user_id)
            .order_by(QuizResult.answered_at.desc())
        )
        quiz_results = [
            QuizResultRead.model_validate(row) for row in qr_result.scalars().all()
        ]

        return ProgressRead(module_progress=module_progress, quiz_results=quiz_results)

    async def track_module_start(self, user_id: uuid.UUID, module_id: str) -> None:
        stmt = (
            insert(ModuleProgress)
            .values(user_id=user_id, module_id=module_id)
            .on_conflict_do_nothing(constraint="uq_module_progress_user_module")
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def save_quiz_result_for_user(
        self, user_id: uuid.UUID, data: QuizResultCreate
    ) -> QuizResultRead:
        quiz_result = QuizResult(
            user_id=user_id,
            quiz_type=data.quiz_type,
            module_id=data.module_id,
            score=data.score,
            max_score=data.max_score,
            answers=data.answers,
        )
        self.session.add(quiz_result)

        if data.quiz_type == "module" and data.module_id is not None:
            stmt = (
                insert(ModuleProgress)
                .values(
                    user_id=user_id,
                    module_id=data.module_id,
                    completed_at=datetime.now(UTC),
                )
                .on_conflict_do_update(
                    constraint="uq_module_progress_user_module",
                    set_={"completed_at": datetime.now(UTC)},
                )
            )
            await self.session.execute(stmt)

        await self.session.commit()
        await self.session.refresh(quiz_result)
        return QuizResultRead.model_validate(quiz_result)
