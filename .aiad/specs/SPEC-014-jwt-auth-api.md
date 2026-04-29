# SPEC-014-jwt-auth-api

**Intent parent** : INTENT-006
**Auteur** : PE
**Date** : 2026-04-29
**Statut** : done
**SQS** : 5/5 ✅

---

## 1. Contexte

L'audit Express du 2026-04-29 a révélé deux findings critiques couplés (🔴) :
- **#1 — IDOR total** (CVSS ~9.1) : `GET /progress?user_id=`, `POST /progress/module` et `POST /quiz/result` acceptent un `user_id` en query/body sans vérification → n'importe quel appelant avec un UUID valide peut lire ou écrire les données de progression de n'importe quel apprenant.
- **#2 — Absence de vérification JWT côté API** (CVSS ~8.8) : aucun endpoint FastAPI ne valide un token d'authentification ; la protection repose entièrement sur le fait que seul Next.js est censé appeler l'API.

Ces deux findings sont couplés : le fix #2 (vérifier un JWT) est le mécanisme qui permet de fermer #1 (ne plus accepter `user_id` depuis le client — l'extraire du token à la place).

---

## 2. Comportement Attendu

### Input

- Toutes les routes protégées reçoivent un header `Authorization: Bearer <token>`.
- Le token est un JWT HS256 signé avec `JWT_SECRET` (la même clé partagée entre Next.js et FastAPI), contenant au minimum :
  - `sub` : UUID de l'utilisateur (string)
  - `exp` : timestamp d'expiration (max 5 min après émission, pour les appels inter-services)
- **Aucun `user_id` n'est accepté en query param ni en body** pour les routes protégées.

Routes protégées (JWT requis) :
- `GET /progress`
- `POST /progress/module`
- `POST /quiz/result`

Routes publiques (pas de JWT requis) :
- `POST /auth/register`
- `POST /auth/login`
- `GET /health`

### Processing

**FastAPI — `deps.py` :**
```python
async def get_current_user(
    authorization: Annotated[str, Header()],
    # format attendu : "Bearer <token>"
) -> CurrentUser:
    # 1. Extraire le token ("Bearer xxx" → "xxx")
    # 2. Décoder avec python-jose : jose.jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    # 3. Extraire sub → user_id (UUID)
    # 4. Retourner CurrentUser(user_id=UUID(sub))
    # 5. Lever HTTP 401 si : header absent, format invalide, signature invalide, token expiré
```

**FastAPI — Routers :**
- `GET /progress` : supprime `user_id: uuid.UUID` du query param → utilise `current_user.user_id`
- `POST /progress/module` : supprime `user_id` du schéma `ModuleStartRequest` → utilise `current_user.user_id`
- `POST /quiz/result` : supprime `user_id` du schéma `QuizResultWithUser` (= utilise directement `QuizResultCreate`) → utilise `current_user.user_id`

**Next.js — `lib/api-token.ts` :**
```ts
import { SignJWT } from "jose"

export async function createApiToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret)
}
```

**Next.js — Server Actions :**
```ts
const token = await createApiToken(session.user.id)
await fetch(`${API_URL}/progress/module`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ module_id: moduleId }),  // plus de user_id
})
```

### Output

- Routes protégées sans token valide → HTTP 401 `{"detail": "Not authenticated"}`
- Routes protégées avec token valide → comportement inchangé (données de l'utilisateur identifié par le token)
- Body avec `user_id` résiduel → **ignoré** (Pydantic ignore les champs inconnus par défaut — sécurité garantie par le JWT, pas par le rejet du champ)

### Cas limites

1. **Header Authorization absent** → 401 (FastAPI `Header()` obligatoire)
2. **Token malformé** (pas un JWT) → 401 (python-jose lève `JWTError`)
3. **Signature invalide** (mauvaise clé) → 401
4. **Token expiré** → 401 (python-jose vérifie `exp` automatiquement)
5. **`user_id` envoyé dans le body** (anciens clients) → **ignoré silencieusement** (Pydantic ignore les champs inconnus par défaut — pas besoin d'`extra="forbid"` pour la sécurité, car le serveur extrait toujours `user_id` depuis le JWT)
6. **`JWT_SECRET` manquant côté API** → exception au démarrage (fail-fast, pas à la requête)

---

## 3. Critères d'Acceptation

- [x] `GET /progress` sans header Authorization → 401
- [x] `GET /progress` avec token signature invalide → 401
- [x] `GET /progress` avec token expiré → 401
- [x] `GET /progress` avec token valide → 200, retourne uniquement les données de l'utilisateur du token
- [x] `POST /progress/module` sans token → 401
- [x] `POST /quiz/result` sans token → 401
- [x] `POST /auth/register`, `POST /auth/login`, `GET /health` sans token → toujours accessibles
- [x] Les Server Actions `markModuleStartedAction`, `saveModuleQuizResultAction`, `saveFinalQuizResultAction` envoient un header `Authorization: Bearer <token>` valide
- [x] Le body des Server Actions ne contient plus de champ `user_id`
- [x] `uv run pytest tests/test_progress.py` → tous les tests passent
- [x] Test Playwright : requête HTTP directe vers FastAPI `GET /progress` sans auth → 401 (via `request` fixture Playwright)

---

## 4. Interface / API

### FastAPI — `apps/api/deps.py` (nouveau fichier)

```python
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
    # str | None avec default=None : FastAPI retourne 422 si Annotated[str, Header()] est absent
    # → rendre optionnel et lever 401 explicitement pour respecter RFC 7235
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
```

### FastAPI — `apps/api/routers/progress.py` (modifié)

```python
@router.get("/progress", response_model=ProgressRead)
async def get_progress(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> ProgressRead:
    return await ProgressService(session).get_progress(current_user.user_id)


@router.post("/progress/module", status_code=200)
async def track_module_start(
    body: ModuleStartRequest,  # user_id supprimé du schéma
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> dict:
    await ProgressService(session).track_module_start(current_user.user_id, body.module_id)
    return {}


@router.post("/quiz/result", response_model=QuizResultRead, status_code=201)
async def save_quiz_result(
    body: QuizResultCreate,  # QuizResultWithUser supprimé — plus de user_id
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> QuizResultRead:
    return await ProgressService(session).save_quiz_result_for_user(current_user.user_id, body)
```

### FastAPI — `apps/api/schemas/progress.py` (modifié)

```python
class ModuleStartRequest(BaseModel):
    module_id: str  # user_id supprimé
```

`QuizResultWithUser` est supprimé — les routes utilisent directement `QuizResultCreate`.

### FastAPI — `apps/api/services/progress_service.py` (modifié)

Renommer `save_quiz_result` en `save_quiz_result_for_user`, séparer `user_id` du body :

```python
async def save_quiz_result_for_user(
    self, user_id: uuid.UUID, data: QuizResultCreate
) -> QuizResultRead:
    quiz_result = QuizResult(
        user_id=user_id,          # ← remplace data.user_id (3 occurrences dans l'implémentation)
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
            .values(user_id=user_id, module_id=data.module_id, completed_at=datetime.now(UTC))
            .on_conflict_do_update(
                constraint="uq_module_progress_user_module",
                set_={"completed_at": datetime.now(UTC)},
            )
        )
        await self.session.execute(stmt)

    await self.session.commit()
    await self.session.refresh(quiz_result)
    return QuizResultRead.model_validate(quiz_result)
```

L'import `from schemas.progress import QuizResultWithUser` dans `progress_service.py` est supprimé — remplacé par `from schemas.user import QuizResultCreate`.

### Next.js — `apps/web/lib/api-token.ts` (nouveau fichier)

```ts
import { SignJWT } from "jose"

export async function createApiToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret)
}
```

---

## 5. Dépendances

- `jose` (npm) — à ajouter en dépendance directe dans `apps/web/package.json` (déjà dans le lockfile pnpm comme dep transitive de `@auth/core`, donc pas de téléchargement)
- `python-jose[cryptography]` — déjà dans `apps/api/pyproject.toml`
- `JWT_SECRET` — déjà dans `.env` et `.env.example`
- `ProgressService.save_quiz_result` peut nécessiter un refactor de signature si `user_id` est actuellement intégré dans `QuizResultWithUser` → vérifier `apps/api/services/progress_service.py`

---

## 6. Estimation Context Budget

**Contexte à injecter pour cette tâche :**
- AGENT-GUIDE (condensé) : ~500 tokens
- Cette SPEC : ~700 tokens
- `apps/api/routers/progress.py` : ~60 tokens
- `apps/api/schemas/progress.py` : ~40 tokens
- `apps/api/schemas/user.py` : ~80 tokens
- `apps/api/services/progress_service.py` : ~100 tokens
- `apps/web/app/(learner)/actions.ts` : ~100 tokens
- `apps/web/auth.ts` : ~120 tokens
- `apps/api/tests/test_progress.py` : ~150 tokens
- **Total estimé brut** : ~1 850 tokens
- **Total estimé ×1.7** : **~3 150 tokens**

---

## 7. Definition of Output Done (DoOD)

- [x] `apps/api/deps.py` créé avec `get_current_user` (HS256, JWT_SECRET, raise 401 sur tout écart)
- [x] `apps/api/schemas/progress.py` : `ModuleStartRequest` sans `user_id`, `QuizResultWithUser` supprimé
- [x] `apps/api/routers/progress.py` : `Depends(get_current_user)` sur les 3 routes, `user_id` extrait du token
- [x] `apps/api/services/progress_service.py` : `save_quiz_result` renommé en `save_quiz_result_for_user(self, user_id: uuid.UUID, data: QuizResultCreate)` — `data.user_id` remplacé par le paramètre `user_id` aux 3 occurrences (lignes QuizResult(), values(), set_()); import `QuizResultWithUser` supprimé, import `QuizResultCreate` ajouté
- [x] `apps/web/package.json` : `jose` ajouté en dep directe (`pnpm --filter web add jose`)
- [x] `apps/web/lib/api-token.ts` créé avec `createApiToken`
- [x] `apps/web/app/(learner)/actions.ts` : `user_id` absent des bodies, `Authorization: Bearer` ajouté
- [x] `apps/api/tests/test_progress.py` : helper `make_token(user_id)` ajouté, tous les tests mis à jour pour passer le token, 3 nouveaux tests 401 (absent / invalide / expiré)
- [x] `apps/web/e2e/security-escalation.spec.ts` créé : test direct FastAPI `GET /progress` sans auth → 401
- [x] `uv run pytest tests/test_progress.py` → pass
- [x] `pnpm --filter web lint` → pass
- [x] SPEC mise à jour si écart découvert à l'exécution (Drift Lock)
- [x] Gouvernance RGPD vérifiée : les données de progression sont désormais isolées par token → conforme
- [x] Gouvernance RGESN vérifiée : overhead JWT decode < 1 ms par requête, pas de dégradation performance
