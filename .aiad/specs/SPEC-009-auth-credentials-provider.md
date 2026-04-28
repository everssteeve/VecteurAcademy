# SPEC-009-auth-credentials-provider

**Intent parent** : INTENT-003
**Auteur** : Steeve Evers (PE)
**Date** : 2026-04-28
**Statut** : done
**SQS** : 4/5 ⚠️ (réserve : db.py + passlib + try/catch authorize + signIn redirect pattern corrigés)
**Drift Lock** : 2026-04-28 — implémentation conforme à la SPEC. Écart documenté : `bcrypt` raw utilisé à la place de `passlib` (incompatibilité bcrypt>=4.x). `NEXT_PUBLIC_API_URL` ajouté à `apps/web/.env.local` (manquant au moment de la rédaction de la SPEC).

---

## 1. Contexte

Auth.js v5 est configuré avec un credentials provider mais son `authorize()` retourne un utilisateur fictif hardcodé. La page `/register` affiche "fonctionnalité à venir". Cette SPEC branche l'authentification sur la base réelle : côté FastAPI, deux endpoints (`/auth/login`, `/auth/register`) avec vérification bcrypt ; côté Next.js, remplacement du stub et ajout du formulaire d'inscription avec le champ `esn_name`. Dépend de SPEC-008 (tables `users` en base).

---

## 2. Comportement Attendu

### Input

**Inscription :**
```
POST /auth/register  (FastAPI)
Body: { email: str, password: str, esn_name: str }
```

**Connexion :**
```
POST /auth/login  (FastAPI)
Body: { email: str, password: str }
```

**Formulaire Next.js :** `FormData` soumis via Server Actions (`registerAction`, `loginAction` existant).

### Processing

**`apps/api/db.py`** (à créer) :

```python
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

engine = create_async_engine(os.environ["DATABASE_URL"], echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_session() -> AsyncSession:  # type: ignore[return]
    async with AsyncSessionLocal() as session:
        yield session
```

**FastAPI — `apps/api/services/auth_service.py`**

Utiliser `passlib` (déjà dans `pyproject.toml` via `passlib[bcrypt]`) — **pas** le module raw `bcrypt` :

```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
```

`register(email, password, esn_name)` :
1. Requête `SELECT` sur `users` WHERE email = email
2. Si résultat → lever `EmailAlreadyExistsError` (→ HTTP 409)
3. `password_hash = pwd_context.hash(password)`
4. `INSERT INTO users (email, password_hash, esn_name)` avec valeurs default pour `id`, `role`, `created_at`
5. Retourner `{ id, email, esn_name, role }`

`login(email, password)` :
1. Requête `SELECT` sur `users` WHERE email = email
2. Si non trouvé → lever `InvalidCredentialsError` (→ HTTP 401)
3. `pwd_context.verify(password, user.password_hash)`
4. Si faux → lever `InvalidCredentialsError` (→ HTTP 401, même erreur que step 2 — anti-enumeration)
5. Retourner `{ id, email, esn_name, role }`

**FastAPI — `apps/api/routers/auth.py`**

```python
POST /auth/register  → AuthService.register()  → 201 UserRead
POST /auth/login     → AuthService.login()     → 200 UserRead
```

**Next.js — `apps/web/auth.ts`** (modifier `authorize()`) :

```typescript
async authorize(credentials) {
  const parsed = loginSchema.safeParse(credentials)
  if (!parsed.success) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
      cache: "no-store",
    })

    if (!res.ok) return null

    const user = await res.json()  // { id, email, esn_name, role }
    return { id: user.id, email: user.email, role: user.role, esn_name: user.esn_name }
  } catch {
    // API indisponible — ne pas propager, laisser Auth.js gérer comme credentials invalides
    return null
  }
}
```

Mettre à jour les callbacks pour propager `id` et `esn_name` dans le JWT et la session :

```typescript
callbacks: {
  jwt({ token, user }) {
    if (user) {
      token.role = user.role
      token.esn_name = (user as { esn_name: string }).esn_name
      // token.sub est déjà l'id (Auth.js convention)
    }
    return token
  },
  session({ session, token }) {
    session.user.role = token.role as string
    session.user.esn_name = token.esn_name as string
    return session
  },
},
```

**Next.js — `apps/web/lib/schemas/auth.ts`** (ajouter `esn_name`) :

```typescript
export const registerSchema = loginSchema
  .extend({
    esn_name: z.string().min(2, "Le nom de l'ESN doit contenir au moins 2 caractères"),
    confirmPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  })
  .refine(...)
```

**Next.js — `apps/web/app/(auth)/actions.ts`** (ajouter `registerAction`) :

`registerAction` doit importer `AuthError` de `next-auth` (déjà présent dans le fichier pour `loginAction`).

```typescript
export async function registerAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    esn_name: formData.get("esn_name"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: parsed.data.email,
      password: parsed.data.password,
      esn_name: parsed.data.esn_name,
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    if (res.status === 409) return { error: "Cette adresse email est déjà utilisée." }
    return { error: "Erreur lors de la création du compte. Réessayez." }
  }

  // signIn avec redirectTo lève NEXT_REDIRECT (comportement normal App Router) — il faut re-throw
  // tout ce qui n'est pas AuthError, comme dans loginAction existant
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Erreur d'authentification après inscription. Réessayez." }
    }
    throw error  // re-throw NEXT_REDIRECT pour que Next.js effectue la redirection
  }
  return null
}
```

**Next.js — `apps/web/components/auth/register-form.tsx`** (nouveau composant) :

Formulaire client avec 4 champs : `email`, `esn_name`, `password`, `confirmPassword`. Validation Zod côté client au submit (même pattern que `LoginForm`). Utilise `useActionState(registerAction, null)`.

**Next.js — `apps/web/app/(auth)/register/page.tsx`** (remplacer placeholder) :

Importer et rendre `<RegisterForm />`.

**Next.js — `apps/web/lib/types/next-auth.d.ts`** (ajouter `esn_name`) :

```typescript
interface User { role: string; esn_name: string }
interface Session { user: { role: string; esn_name: string } & DefaultSession["user"] }
interface JWT { role: string; esn_name: string }
```

### Output

- Session Auth.js JWT contenant `{ sub: uuid, email, role: "learner", esn_name }`
- Utilisateur créé en base avec mot de passe hashé (bcrypt, rounds=12)
- Redirection vers `/dashboard` après inscription ou connexion réussie

### Cas limites

1. **Email déjà utilisé** → FastAPI 409 → `registerAction` retourne `{ error: "Cette adresse email est déjà utilisée." }`
2. **Mauvais mot de passe** → FastAPI 401 → `authorize()` retourne `null` → Auth.js lève `CredentialsSignin` → `loginAction` retourne `{ error: "Identifiants invalides…" }`
3. **API FastAPI indisponible** → `fetch()` rejette (network error) → `authorize()` doit attraper l'exception et retourner `null` (ne pas propager une 500 vers l'utilisateur)
4. **Password en clair dans les logs** → `password` ne doit jamais être loggué — aucun `console.log` ni logger sur les payloads contenant le mot de passe
5. **Validation Zod échoue côté client** → `event.preventDefault()` bloque le submit — l'erreur s'affiche inline sans appel réseau
6. **`confirmPassword` ne correspond pas** → erreur Zod `path: ["confirmPassword"]` affichée sous le champ

---

## 3. Critères d'Acceptation

- [ ] `POST /auth/register` avec données valides → 201 + utilisateur en base avec `password_hash` (jamais le plaintext)
- [ ] `POST /auth/register` avec email existant → 409
- [ ] `POST /auth/login` avec credentials corrects → 200 + `{ id, email, esn_name, role }`
- [ ] `POST /auth/login` avec mauvais mot de passe → 401
- [ ] `POST /auth/login` avec email inconnu → 401 (même message que mot de passe faux)
- [ ] Après inscription via `/register`, l'utilisateur est redirigé vers `/dashboard` avec session valide
- [ ] Session JWT contient `esn_name` et `role` (vérifiable via `getServerSession()` ou `auth()`)
- [ ] `authorize()` retourne `null` (pas d'exception) si l'API FastAPI est indisponible
- [ ] `pytest apps/api/tests/test_auth.py` — tests register, login, email dupliqué, mauvais mdp passent

---

## 4. Interface / API

### FastAPI — `apps/api/routers/auth.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, LoginRequest, UserRead
from app.db import get_session

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, session: AsyncSession = Depends(get_session)):
    ...

@router.post("/login", response_model=UserRead)
async def login(body: LoginRequest, session: AsyncSession = Depends(get_session)):
    ...
```

### Schéma Pydantic additionnel — `LoginRequest`

```python
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
```

### Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `apps/api/routers/auth.py` | Créer — endpoints `/auth/register` et `/auth/login` |
| `apps/api/services/auth_service.py` | Créer — `AuthService.register()` et `AuthService.login()` |
| `apps/api/schemas/user.py` | Modifier — ajouter `LoginRequest` |
| `apps/api/db.py` | Créer — `get_session` dependency (voir code ci-dessous) |
| `apps/api/main.py` | Modifier — `app.include_router(auth_router)` |
| `apps/web/auth.ts` | Modifier — remplacer stub par appel FastAPI, callbacks JWT/session |
| `apps/web/lib/schemas/auth.ts` | Modifier — ajouter `esn_name` à `registerSchema` |
| `apps/web/lib/types/next-auth.d.ts` | Modifier — ajouter `esn_name` aux interfaces |
| `apps/web/app/(auth)/actions.ts` | Modifier — ajouter `registerAction` |
| `apps/web/components/auth/register-form.tsx` | Créer — formulaire inscription client |
| `apps/web/app/(auth)/register/page.tsx` | Modifier — remplacer placeholder par `<RegisterForm />` |

---

## 5. Dépendances

- **SPEC-008 requise** — tables `users` en base + modèle `User` SQLAlchemy importable
- `bcrypt` — déjà dans `pyproject.toml`
- `pydantic[email]` — requis pour `EmailStr` (vérifier dans `pyproject.toml`)
- `NEXT_PUBLIC_API_URL` — défini dans `.env` (déjà présent dans `.env.example`)
- **RGPD** : checklist `CLAUDE-RGPD` obligatoire avant implémentation (collecte email + ESN)
- **RGAA** : formulaire d'inscription → checklist `CLAUDE-RGAA` (labels, aria, focus management)

---

## 6. Estimation Context Budget

| Fichier injecté | Tokens estimés |
|-----------------|---------------|
| AGENT-GUIDE (condensé) | ~500 |
| Cette SPEC | ~1 200 |
| `apps/web/auth.ts` | ~150 |
| `apps/web/lib/schemas/auth.ts` | ~100 |
| `apps/web/app/(auth)/actions.ts` | ~150 |
| `apps/web/app/(auth)/login/login-form.tsx` | ~200 |
| `apps/api/main.py` | ~100 |
| `apps/api/models/user.py` (post SPEC-008) | ~200 |
| `apps/api/schemas/user.py` (post SPEC-008) | ~150 |
| **Total estimé** | ~2 750 × 1.7 = **~4 700 tokens** |

Budget confortable — rester sous 10K tokens avec les fichiers générés.

---

## 7. Definition of Output Done (DoOD)

- [ ] `POST /auth/register` et `POST /auth/login` implémentés et testés (pytest)
- [ ] `authorize()` dans `auth.ts` branchée sur FastAPI (stub supprimé)
- [ ] `RegisterForm` rendu sur `/register` avec les 4 champs (email, esn_name, password, confirmPassword)
- [ ] Inscription fonctionnelle end-to-end : formulaire → FastAPI → DB → session JWT → dashboard
- [ ] Connexion fonctionnelle end-to-end : formulaire → FastAPI → session JWT → dashboard
- [ ] Session JWT contient `esn_name` (vérifiable via React DevTools ou `auth()` côté serveur)
- [ ] `ruff check apps/api/` passing + `pnpm --filter web lint` passing
- [ ] SPEC mise à jour si écart (Drift Lock)
- [ ] **RGPD** : `CLAUDE-RGPD` consulté — password jamais loggué, hash bcrypt vérifié, email seul identifiant
- [ ] **RGAA** : `CLAUDE-RGAA` consulté — `RegisterForm` accessible (labels explicites, aria-invalid, focus visible)
