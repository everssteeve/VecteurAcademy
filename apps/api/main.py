from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401 — ensures Alembic autogenerate discovers all models
from routers.auth import router as auth_router
from routers.progress import router as progress_router

app = FastAPI(title="formations-ia API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(progress_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
