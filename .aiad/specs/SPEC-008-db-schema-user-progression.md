# SPEC-008-db-schema-user-progression

**Intent parent** : INTENT-003
**Auteur** : Steeve Evers (PE)
**Date** : 2026-04-28
**Statut** : done
**SQS** : 4/5 ⚠️ (réserve : UniqueConstraint corrigé + Alembic async documenté)

---

## 1. Contexte

VecteurAcademy n'a aucun schéma de base de données implémenté. Les utilisateurs, la progression et les résultats de quiz n'existent que comme types TypeScript dans `packages/shared-types/` — sans persistance. Cette SPEC crée les modèles SQLAlchemy et la migration Alembic qui fondent toute la chaîne d'authentification (SPEC-009) et de persistance de progression (SPEC-010).

**Choix architectural clé :** Auth.js v5 est configuré en mode JWT stateless (pas d'adaptateur DB côté Next.js). La validation des credentials se fera via un appel à l'API FastAPI. Toute la persistance (users, progression, quiz) est gérée par SQLAlchemy + Alembic dans `apps/api/`.

---

## 2. Comportement Attendu

### Input

Aucune entrée runtime pour cette SPEC — c'est une migration de schéma. L'input est la définition des modèles eux-mêmes.

### Processing

**Étape 1 — Modèle `User`**

```
Table : users
- id          : UUID, PK, DEFAULT gen_random_uuid()
- email       : VARCHAR(255), UNIQUE, NOT NULL, INDEX
- password_hash : VARCHAR(255), NOT NULL
- esn_name    : VARCHAR(255), NOT NULL
- role        : VARCHAR(50), NOT NULL, DEFAULT 'learner'
               CHECK role IN ('learner', 'trainer', 'admin')
- created_at  : TIMESTAMPTZ, DEFAULT NOW()
```

**Étape 2 — Modèle `ModuleProgress`**

```
Table : module_progress
- id           : UUID, PK, DEFAULT gen_random_uuid()
- user_id      : UUID, FK → users.id, ON DELETE CASCADE, NOT NULL
- module_id    : VARCHAR(100), NOT NULL  — slug du module (ex: "ai-engineering")
- completed_at : TIMESTAMPTZ, NULLABLE  — NULL = en cours, non-NULL = terminé
- UNIQUE(user_id, module_id)            — une ligne par (user, module)
```

`module_id` correspond aux 6 slugs définis dans les fichiers MDX :
`ai-engineering`, `foundation-models`, `model-selection`, `prompt-engineering`, `rag-agents`, `production-architecture`

**Étape 3 — Modèle `QuizResult`**

```
Table : quiz_results
- id          : UUID, PK, DEFAULT gen_random_uuid()
- user_id     : UUID, FK → users.id, ON DELETE CASCADE, NOT NULL
- quiz_type   : VARCHAR(20), NOT NULL, CHECK quiz_type IN ('module', 'final')
- module_id   : VARCHAR(100), NULLABLE
               — obligatoire si quiz_type = 'module', NULL si quiz_type = 'final'
- score       : INTEGER, NOT NULL, CHECK score >= 0
- max_score   : INTEGER, NOT NULL, CHECK max_score > 0
- answers     : JSONB, NOT NULL
               — tableau [{question_id, selected_option, is_correct}]
- answered_at : TIMESTAMPTZ, DEFAULT NOW()
```

Pas de contrainte UNIQUE sur (user_id, quiz_type, module_id) — un utilisateur peut repasser un quiz.

**Étape 4 — Initialisation et configuration Alembic**

Alembic n'est pas encore initialisé dans ce projet. L'agent doit :

```bash
# Depuis apps/api/
alembic init migrations
```

Puis configurer `apps/api/alembic.ini` :
```ini
sqlalchemy.url = # laisser vide — géré dynamiquement dans env.py
```

Configurer `apps/api/migrations/env.py` pour le mode **async** (requis par asyncpg) :

```python
import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool
from alembic import context
from app.models import Base  # importer Base pour autogenerate
import os

config = context.config
config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

def run_migrations_online():
    asyncio.run(run_async_migrations())

run_migrations_online()
```

Puis générer la migration :
```bash
alembic revision --autogenerate -m "initial_user_schema"
alembic upgrade head
```

La migration créé les 3 tables dans l'ordre :
1. `users` (pas de dépendance)
2. `module_progress` (dépend de `users`)
3. `quiz_results` (dépend de `users`)

**Étape 5 — Schémas Pydantic**

Exposer les schémas de sérialisation dans `apps/api/schemas/user.py` :

```python
class UserCreate(BaseModel):
    email: EmailStr
    password: str          # plaintext à l'entrée — hashé avant insertion
    esn_name: str

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    esn_name: str
    role: str
    created_at: datetime

class ModuleProgressRead(BaseModel):
    module_id: str
    completed_at: datetime | None

class QuizResultCreate(BaseModel):
    quiz_type: Literal["module", "final"]
    module_id: str | None
    score: int
    max_score: int
    answers: list[dict]    # [{question_id, selected_option, is_correct}]

class QuizResultRead(QuizResultCreate):
    id: UUID
    answered_at: datetime
```

### Output

- 3 tables créées dans PostgreSQL
- Migration Alembic versionnée et réversible (`upgrade` / `downgrade`)
- Modèles SQLAlchemy importables depuis `apps/api/models/`
- Schémas Pydantic importables depuis `apps/api/schemas/`

### Cas limites

1. **Email en double à l'inscription** → contrainte UNIQUE sur `users.email` lève `UniqueViolationError` — à attraper au niveau service (SPEC-009)
2. **module_id inconnu** → pas de FK vers une table de modules (les slugs sont définis dans le code, pas en DB) — validation au niveau service, pas au niveau schéma
3. **quiz_type = 'module' sans module_id** → la cohérence est assurée par un `CHECK` PostgreSQL : `CHECK (quiz_type = 'final' OR module_id IS NOT NULL)`
4. **Suppression d'un utilisateur** → `ON DELETE CASCADE` sur les FK de `module_progress` et `quiz_results` — toutes les données liées sont supprimées
5. **Re-run de migration** → Alembic vérifie la table `alembic_version` avant d'appliquer — idempotent en prod
6. **Rollback** → `downgrade` supprime les 3 tables dans l'ordre inverse (quiz_results → module_progress → users)

---

## 3. Critères d'Acceptation

- [ ] `alembic upgrade head` depuis un état vide crée les 3 tables sans erreur
- [ ] `alembic downgrade -1` supprime les 3 tables sans erreur
- [ ] Une insertion avec email dupliqué lève une `UniqueViolationError`
- [ ] Une insertion dans `quiz_results` avec `quiz_type='module'` et `module_id=NULL` lève une violation de contrainte CHECK
- [ ] La suppression d'un `User` supprime en cascade ses `ModuleProgress` et `QuizResult`
- [ ] Les modèles SQLAlchemy sont importables : `from apps.api.models import User, ModuleProgress, QuizResult`
- [ ] Les schémas Pydantic sont importables et valident correctement les données

---

## 4. Interface / API

### Modèle SQLAlchemy (apps/api/models/user.py)

```python
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Integer, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)  # index=True retiré — UNIQUE constraint crée déjà un index B-tree en PostgreSQL (RGESN)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    esn_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="learner")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    progress: Mapped[list["ModuleProgress"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    quiz_results: Mapped[list["QuizResult"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("role IN ('learner', 'trainer', 'admin')", name="ck_users_role"),
    )

class ModuleProgress(Base):
    __tablename__ = "module_progress"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    module_id: Mapped[str] = mapped_column(String(100), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="progress")

    __table_args__ = (
        UniqueConstraint("user_id", "module_id", name="uq_module_progress_user_module"),
    )

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quiz_type: Mapped[str] = mapped_column(String(20), nullable=False)
    module_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    max_score: Mapped[int] = mapped_column(Integer, nullable=False)
    answers: Mapped[dict] = mapped_column(JSONB, nullable=False)
    answered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="quiz_results")

    __table_args__ = (
        CheckConstraint("quiz_type IN ('module', 'final')", name="ck_quiz_results_type"),
        CheckConstraint("quiz_type = 'final' OR module_id IS NOT NULL", name="ck_quiz_results_module_id"),
        CheckConstraint("score >= 0", name="ck_quiz_results_score"),
        CheckConstraint("max_score > 0", name="ck_quiz_results_max_score"),
    )
```

### Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `apps/api/models/__init__.py` | Exporter `User`, `ModuleProgress`, `QuizResult`, `Base` |
| `apps/api/models/user.py` | Créer — modèles SQLAlchemy (ci-dessus) |
| `apps/api/schemas/__init__.py` | Exporter les schémas Pydantic |
| `apps/api/schemas/user.py` | Créer — schémas Pydantic `UserCreate`, `UserRead`, etc. |
| `apps/api/alembic.ini` | Créer via `alembic init migrations` (url gérée dynamiquement) |
| `apps/api/migrations/env.py` | Configurer pour mode async + `target_metadata = Base.metadata` (voir section Processing) |
| `apps/api/migrations/versions/<hash>_initial_user_schema.py` | Générer via `alembic revision --autogenerate -m "initial_user_schema"` |
| `apps/api/main.py` | Ajouter import des modèles pour que Alembic les découvre |

---

## 5. Dépendances

- PostgreSQL 16 en cours d'exécution (variable `DATABASE_URL` dans `.env`)
- Alembic 1.13+ + asyncpg — déjà dans `pyproject.toml`
- SQLAlchemy 2.0+ — déjà dans `pyproject.toml`
- `pydantic[email]` — **correctif** : `pydantic>=2.0` → `pydantic[email]>=2.0` (email-validator requis pour `EmailStr`)
- `passlib[bcrypt]` ou `bcrypt` — déjà dans `pyproject.toml` (pour le hashing en SPEC-009, pas dans cette SPEC)
- **Bloquant pour** : SPEC-009 (Auth.js credentials + endpoints FastAPI), SPEC-010 (persistance progression)

---

## 6. Estimation Context Budget

**Contexte à injecter pour cette tâche :**
- AGENT-GUIDE (condensé) : ~500 tokens
- Cette SPEC : ~800 tokens
- `apps/api/main.py` : ~100 tokens
- `apps/api/models/__init__.py` : ~50 tokens
- `apps/api/migrations/env.py` (template Alembic) : ~200 tokens
- `packages/shared-types/index.ts` (types existants) : ~200 tokens
- **Total estimé** : ~1 850 tokens × 1.7 (facteur réel) = **~3 150 tokens**

Cette SPEC est simple et ciblée — risque de context rot faible.

---

## 7. Definition of Output Done (DoOD)

- [ ] `apps/api/models/user.py` créé avec les 3 modèles SQLAlchemy
- [ ] `apps/api/schemas/user.py` créé avec les 5 schémas Pydantic
- [ ] Migration `0001_initial_user_schema` générée et testée (`upgrade` + `downgrade`)
- [ ] `alembic upgrade head` réussit depuis un état vide (PostgreSQL local ou CI)
- [ ] `pytest apps/api/tests/test_models.py` — tests de contraintes (unicité email, CHECK quiz_type, CASCADE) passent
- [ ] Lint Biome passing (côté TS non concerné) + `ruff check` passing côté Python
- [ ] SPEC mise à jour si écart découvert pendant l'implémentation (Drift Lock)
- [ ] **RGPD** : champ `password_hash` vérifié (jamais le plaintext) — checklist CLAUDE-RGPD consultée
- [ ] **RGESN** : pas d'index superflu (seul `email` indexé), JSONB préféré à des colonnes séparées pour `answers`
