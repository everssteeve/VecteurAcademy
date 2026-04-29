import bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User
from schemas.user import UserCreate, UserRead


class EmailAlreadyExistsError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def register(self, data: UserCreate) -> UserRead:
        result = await self.session.execute(
            select(User).where(User.email == data.email)
        )
        if result.scalar_one_or_none() is not None:
            raise EmailAlreadyExistsError

        password_hash = bcrypt.hashpw(
            data.password.encode("utf-8"), bcrypt.gensalt(rounds=12)
        ).decode("utf-8")

        user = User(
            email=data.email,
            password_hash=password_hash,
            first_name=data.first_name,
            last_name=data.last_name,
            esn_name=data.esn_name,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return UserRead.model_validate(user)

    async def login(self, email: str, password: str) -> UserRead:
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user is None or not bcrypt.checkpw(
            password.encode("utf-8"), user.password_hash.encode("utf-8")
        ):
            raise InvalidCredentialsError

        return UserRead.model_validate(user)
