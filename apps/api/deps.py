import os
from typing import Annotated
from uuid import UUID

from fastapi import Header, HTTPException, status
from jose import JWTError, jwt
from pydantic import BaseModel

JWT_SECRET = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"


class CurrentUser(BaseModel):
    user_id: UUID


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
) -> CurrentUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if authorization is None:
        raise credentials_exception
    try:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            raise credentials_exception
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        sub: str | None = payload.get("sub")
        if sub is None:
            raise credentials_exception
        return CurrentUser(user_id=UUID(sub))
    except (JWTError, ValueError):
        raise credentials_exception from None
