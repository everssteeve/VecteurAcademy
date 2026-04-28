# SPEC-010-route-protection-progression

**Intent parent** : INTENT-003
**Auteur** : Steeve Evers (PE)
**Date** : 2026-04-28
**Statut** : done
**SQS** : 4/5 ⚠️ (réserve : snake_case JSONB unifié, variables final-quiz corrigées, status_code idempotent 200)
**Drift Lock** : 2026-04-28 — implémentation conforme à la SPEC. Ajout non prévu : `apps/api/tests/test_progress.py` (6 tests pytest dont test isolation RGPD cross-user). `max_score: 18` hardcodé dans `saveFinalQuizResultAction` — prescrit par la SPEC, à paramétrer si le nombre de questions du quiz final évolue. Réserve architecturale documentée : `GET /progress` non protégé côté FastAPI (auth déléguée à Auth.js/Next.js) — risque RGPD moyen si l'API est exposée publiquement avant ajout d'un mécanisme inter-service.

---

## 1. Contexte

Après SPEC-008 (schéma DB) et SPEC-009 (auth), les utilisateurs peuvent se connecter mais leur progression reste en état local (React). Cette SPEC branche la persistance côté FastAPI : visites de modules, scores de quiz de fin de module, score du quiz de parcours final. Le dashboard affiche un statut réel (Non commencé / En cours / Terminé). La route `/evaluation-finale` est ajoutée aux routes protégées.

---

## 2. Comportement Attendu

### Input

- Session Auth.js valide contenant `session.user.id` (UUID de l'utilisateur en DB)
- Événements déclencheurs : entrée sur `/modules/[slug]`, complétion d'un quiz de module, complétion du quiz final

### Processing

**Étape 1 — Middleware : ajouter `/evaluation-finale`**

Dans `middleware.ts`, étendre `isProtected` et `matcher` :

```typescript
const isProtected =
  pathname.startsWith("/dashboard") ||
  pathname.startsWith("/modules") ||
  pathname.startsWith("/evaluation-finale")

export const config = {
  matcher: ["/dashboard/:path*", "/modules/:path*", "/evaluation-finale/:path*", "/login"],
}
```

**Étape 2 — FastAPI : router `progress`**

`GET /progress?user_id={uuid}` :
- Requête `SELECT * FROM module_progress WHERE user_id = :user_id`
- Requête `SELECT * FROM quiz_results WHERE user_id = :user_id`
- Retourner `{ module_progress: [...], quiz_results: [...] }`

`POST /progress/module` :
- Body : `{ user_id: UUID, module_id: str }`
- `INSERT INTO module_progress (user_id, module_id) VALUES (...) ON CONFLICT (user_id, module_id) DO NOTHING`
- Retourner **200 toujours** (endpoint idempotent — pas de 201, même sur création)

`POST /quiz/result` :
- Body : `QuizResultCreate + user_id`
- Insérer dans `quiz_results`
- Si `quiz_type = 'module'` : upsert `module_progress` avec `completed_at = NOW()` pour marquer le module terminé
- Si `quiz_type = 'final'` : pas d'effet sur `module_progress`
- Retourner `QuizResultRead` (201)

**Étape 3 — Server Actions Next.js (`apps/web/app/(learner)/actions.ts`)**

Les Server Actions appellent `auth()` pour obtenir `session.user.id` — le client ne passe jamais d'userId.

```typescript
// Marquer le début de consultation d'un module
async function markModuleStartedAction(moduleId: string): Promise<void>
// Appelle POST /progress/module — fire & forget, ne throw pas

// Sauvegarder résultat d'un quiz de module (marque aussi le module "terminé")
async function saveModuleQuizResultAction(
  moduleId: string,
  score: number,
  maxScore: number,
  answers: Array<{ question_id: string; selected_option: string; is_correct: boolean }>
): Promise<void>
// Appelle POST /quiz/result avec quiz_type='module'

// Sauvegarder résultat du quiz final
async function saveFinalQuizResultAction(
  score: number,
  answers: Array<{ question_id: string; selected_option: string; is_correct: boolean }>
): Promise<void>
// Appelle POST /quiz/result avec quiz_type='final', module_id=null
```

**Étape 4 — Suivi visite de module**

Créer `apps/web/components/tracking/mark-module-started.tsx` (Client Component) :

```typescript
"use client"
import { useEffect } from "react"
import { markModuleStartedAction } from "@/app/(learner)/actions"

export function MarkModuleStarted({ moduleId }: { moduleId: string }) {
  useEffect(() => {
    markModuleStartedAction(moduleId).catch(() => {})
  }, [moduleId])
  return null
}
```

Dans `apps/web/app/(learner)/modules/[slug]/page.tsx` (Server Component), ajouter avant l'article MDX :

```tsx
<MarkModuleStarted moduleId={slug} />
```

**Étape 5 — Quiz de module : sauvegarder résultat**

Dans `apps/web/components/quiz/quiz.tsx`, passer `moduleId` à `QuizInteractive` :

```tsx
export function Quiz({ moduleId }: QuizProps) {
  const questions = quizData[moduleId] ?? []
  return <QuizInteractive questions={questions} moduleId={moduleId} />
}
```

Dans `apps/web/components/quiz/quiz-interactive.tsx`, ajouter le prop et l'appel à la complétion :

```typescript
interface QuizInteractiveProps {
  questions: QuizQuestion[]
  moduleId?: string  // optionnel pour ne pas casser les usages sans persistence
}
```

Quand `handleNext()` calcule le score final (dernier état `completed`) :

```typescript
if (props.moduleId) {
  const answersPayload = questions.map((q, i) => ({
    question_id: q.id,          // snake_case — cohérent avec SPEC-008 JSONB schema
    selected_option: nextAnswers[i] ?? "",
    is_correct: nextAnswers[i] === q.correctAnswer,
  }))
  saveModuleQuizResultAction(props.moduleId, score, questions.length, answersPayload).catch(() => {})
}
```

**Étape 6 — Quiz final : sauvegarder résultat**

Dans `apps/web/components/quiz/final-quiz.tsx`, quand l'état passe à `completed` dans `handleNext()`.
Variables réelles du composant : `questions` (prop), `state.answers: string[]`, `state.totalScore: number`.

```typescript
// À placer dans le bloc qui appelle setState({ status: "completed", ... })
const answersPayload = questions.map((q, i) => ({
  question_id: q.id,          // snake_case — cohérent avec SPEC-008 JSONB schema
  selected_option: finalAnswers[i] ?? "",   // finalAnswers = answers accumulés dans handleNext
  is_correct: finalAnswers[i] === q.correctAnswer,
}))
saveFinalQuizResultAction(totalScore, answersPayload).catch(() => {})
// totalScore = score calculé localement avant le setState
```

**Étape 7 — Dashboard : afficher la progression réelle**

`apps/web/app/(learner)/dashboard/page.tsx` (Server Component) :

```typescript
const session = await auth()
// session.user.id disponible après SPEC-009

const progressRes = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/progress?user_id=${session!.user.id}`,
  { cache: "no-store" }
)
const { module_progress, quiz_results } = progressRes.ok
  ? await progressRes.json()
  : { module_progress: [], quiz_results: [] }
```

Calculer le statut d'affichage par module :

```
completed_at IS NOT NULL → "Terminé" + score du quiz si disponible dans quiz_results
user_id dans module_progress mais completed_at IS NULL → "En cours"
absent de module_progress → "Non commencé"
```

Remplacer le hardcoded `"Non commencé"` dans la card par le statut calculé.

### Output

- Toute visite de `/modules/[slug]` crée/upserte une ligne `module_progress`
- Toute complétion d'un quiz de module insère dans `quiz_results` et met `completed_at` sur le module
- Toute complétion du quiz final insère dans `quiz_results`
- Dashboard affiche statut réel et score si disponible
- `/evaluation-finale` redirige vers `/login` si non authentifié

### Cas limites

1. **API FastAPI indisponible pendant la visite** → `markModuleStartedAction` catch silencieux — page s'affiche quand même, progression non tracée (acceptable : retry à la prochaine visite)
2. **Session expirée entre le rendu et le quiz** → `saveModuleQuizResultAction` appelle `auth()` → `null` → retourne sans erreur, sans sauvegarder. Le score est affiché côté client mais pas persisté — comportement acceptable.
3. **Double complétion du même quiz** → pas de contrainte UNIQUE sur `quiz_results` → deux lignes insérées. Le dashboard affiche le score du dernier résultat (tri par `answered_at DESC`).
4. **`moduleId` absent dans `quizData`** → `Quiz` retourne `questions = []`, `QuizInteractive` avec 0 questions n'affiche rien. Pas de crash.
5. **Fetch `/progress` échoue au dashboard** → fallback `{ module_progress: [], quiz_results: [] }` → tous les modules affichent "Non commencé" — dégradation gracieuse.
6. **`/evaluation-finale` sans session** → middleware redirige vers `/login?callbackUrl=/evaluation-finale` — déjà géré par le middleware Auth.js existant.

---

## 3. Critères d'Acceptation

- [x] Accéder à `/evaluation-finale` sans session → redirection vers `/login`
- [x] Visiter `/modules/ai-engineering` → une ligne apparaît dans `module_progress` (`completed_at = NULL`)
- [x] Compléter le quiz d'un module → `completed_at` non-null dans `module_progress` + ligne dans `quiz_results`
- [x] Compléter le quiz final → ligne dans `quiz_results` avec `quiz_type = 'final'`, `module_id = NULL`
- [x] Dashboard affiche "En cours" pour un module visité non complété
- [x] Dashboard affiche "Terminé" et le score pour un module dont le quiz est complété
- [x] `GET /progress?user_id={id}` retourne les données correctes (test pytest)
- [x] Déconnexion et reconnexion → progression toujours visible (persistance réelle vérifiée)

---

## 4. Interface / API

### FastAPI — `apps/api/routers/progress.py`

```python
router = APIRouter(prefix="", tags=["progress"])

@router.get("/progress", response_model=ProgressRead)
async def get_progress(user_id: UUID, session: AsyncSession = Depends(get_session)):
    ...

@router.post("/progress/module", status_code=200)
async def track_module_start(body: ModuleStartRequest, session: AsyncSession = Depends(get_session)):
    ...

@router.post("/quiz/result", response_model=QuizResultRead, status_code=201)
async def save_quiz_result(body: QuizResultWithUser, session: AsyncSession = Depends(get_session)):
    ...
```

### Schémas Pydantic (`apps/api/schemas/progress.py`)

```python
class ModuleStartRequest(BaseModel):
    user_id: UUID
    module_id: str

class QuizResultWithUser(QuizResultCreate):
    user_id: UUID

class ProgressRead(BaseModel):
    module_progress: list[ModuleProgressRead]
    quiz_results: list[QuizResultRead]
```

### Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `apps/api/routers/progress.py` | Créer — 3 endpoints |
| `apps/api/services/progress_service.py` | Créer — logique métier |
| `apps/api/schemas/progress.py` | Créer — schémas Pydantic |
| `apps/api/main.py` | Modifier — inclure progress router |
| `apps/web/middleware.ts` | Modifier — ajouter `/evaluation-finale` |
| `apps/web/app/(learner)/actions.ts` | Créer — 3 Server Actions |
| `apps/web/components/tracking/mark-module-started.tsx` | Créer — Client Component |
| `apps/web/app/(learner)/modules/[slug]/page.tsx` | Modifier — ajouter `<MarkModuleStarted>` |
| `apps/web/components/quiz/quiz.tsx` | Modifier — passer `moduleId` à QuizInteractive |
| `apps/web/components/quiz/quiz-interactive.tsx` | Modifier — prop `moduleId?` + save action |
| `apps/web/components/quiz/final-quiz.tsx` | Modifier — save action on complete |
| `apps/web/app/(learner)/dashboard/page.tsx` | Modifier — fetch progress + affichage réel |

---

## 5. Dépendances

- **SPEC-008 requise** — tables `module_progress` et `quiz_results` en base
- **SPEC-009 requise** — `session.user.id` disponible (UUID réel, plus stub)
- `NEXT_PUBLIC_API_URL` — déjà dans `.env`
- **RGESN** : `cache: "no-store"` uniquement sur `/progress` (données personnelles temps réel) — les autres fetch peuvent être cachés
- **RGPD** : `GET /progress` expose des données personnelles de progression — accessible uniquement via l'userId de la session, jamais cross-user

---

## 6. Estimation Context Budget

| Fichier injecté | Tokens estimés |
|-----------------|---------------|
| AGENT-GUIDE (condensé) | ~500 |
| Cette SPEC | ~1 300 |
| `apps/web/middleware.ts` | ~100 |
| `apps/web/app/(learner)/dashboard/page.tsx` | ~200 |
| `apps/web/app/(learner)/modules/[slug]/page.tsx` | ~250 |
| `apps/web/components/quiz/quiz.tsx` | ~80 |
| `apps/web/components/quiz/quiz-interactive.tsx` | ~300 |
| `apps/web/components/quiz/final-quiz.tsx` | ~200 |
| `apps/api/schemas/user.py` (post SPEC-008) | ~150 |
| `apps/api/models/user.py` (post SPEC-008) | ~200 |
| **Total estimé** | ~3 280 × 1.7 = **~5 600 tokens** |

Budget raisonnable — surveiller la taille des fichiers générés en cours d'exécution.

---

## 7. Definition of Output Done (DoOD)

- [x] `GET /progress`, `POST /progress/module`, `POST /quiz/result` implémentés et testés (pytest)
- [x] `/evaluation-finale` protégée (middleware vérifié au code)
- [x] Visite module → ligne en DB (vérifiable en psql ou via `GET /progress`)
- [x] Complétion quiz module → `completed_at` non-null + ligne quiz_results (vérifiable)
- [x] Complétion quiz final → ligne quiz_results `quiz_type='final'` (vérifiable)
- [x] Dashboard affiche statut dynamique (non plus hardcodé "Non commencé")
- [x] Déconnexion/reconnexion → progression conservée (persistance DB réelle)
- [x] `ruff check` passing + `pnpm --filter web lint` passing
- [x] SPEC mise à jour (Drift Lock appliqué)
- [x] **RGPD** : `GET /progress` filtre par `user_id` — `test_get_progress_returns_only_own_data` valide l'isolation. Réserve : auth inter-service non implémentée (hors périmètre SPEC-010, documentée en Human Learning AGENT-GUIDE)
- [x] **RGESN** : `cache: "no-store"` uniquement sur `/progress` dans `dashboard/page.tsx`
