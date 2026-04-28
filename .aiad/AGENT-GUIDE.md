# AGENT-GUIDE — VecteurAcademy

> Ce fichier est le **contexte permanent** de l'agent IA.
> Il est injecté dans CHAQUE session de développement.
> Le maintenir à jour est une responsabilité de l'Agents Engineer (AE).
> Framework : AIAD SDD Mode v1.3

---

## IDENTITÉ DU PROJET

**Nom** : VecteurAcademy
**Description** : Plateforme de formation AI Engineering pour consultants ESN — 6 modules thématiques, quiz interactifs, assistant RAG et suivi de progression.
**Domaine métier** : EdTech B2B — formation professionnelle continue
**Mission** : Former des consultants ESN capables de cadrer, concevoir et livrer un système IA en production.

---

## DOCUMENTATION DE RÉFÉRENCE

| Document | Chemin | Mode d'injection |
|----------|--------|-----------------|
| PRD | @.aiad/PRD.md | Cadrage uniquement |
| Architecture | @.aiad/ARCHITECTURE.md | Condensé permanent |
| SPEC active | @.aiad/specs/[SPEC-XXX].md | Par tâche uniquement |
| Index SPECs | @.aiad/specs/_index.md | Planification |
| Gouvernance | @.aiad/gouvernance/ | Permanent (Tier 1, veto) |

---

## STACK TECHNIQUE (Référence Rapide)

| Couche | Technologie | Notes |
|--------|------------|-------|
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript strict | Server Components par défaut |
| Style | Tailwind CSS v4 | Pas de runtime CSS, dark mode via `prefers-color-scheme` |
| Linter | Biome 1.9 | Remplace ESLint + Prettier — `pnpm lint` |
| Package manager | pnpm (workspace monorepo) | `pnpm --filter web <cmd>` pour le frontend |
| Auth | Auth.js v5 (`next-auth@beta`) | JWT signé `JWT_SECRET` partagé avec FastAPI |
| Backend | FastAPI + Python 3.12 + uv | `apps/api/` — async natif |
| DB | PostgreSQL 16 + pgvector | ORM : SQLAlchemy 2 + Alembic (migrations versionnées) |
| Contenu | MDX 3 dans `apps/web/content/modules/` | Fichier = module, frontmatter validé par Zod |
| Tests frontend | Vitest (unitaires) + Playwright (E2E) | `pnpm test` / `pnpm e2e` |
| Tests backend | pytest + httpx | `uv run pytest` dans `apps/api/` |

---

## RÈGLES ABSOLUES

### TOUJOURS
- Valider les entrées avant tout traitement
- Synchroniser SPEC + code dans la même PR (Drift Lock)
- Ajouter un test pour chaque bug fix
- Vérifier le Human Authorship avant toute automatisation
- Mettre à jour les Lessons Learned en fin d'itération
- Multiplier les estimations Context Budget par ×1.7 en phase Gate (le réel dépasse systématiquement l'estimé)

### JAMAIS
- Committer sans lint passing
- Modifier le schéma DB sans migration versionnée
- Pusher des secrets dans git
- Merger sans code review (minimum 1 approval)
- Livrer sans mettre à jour la SPEC correspondante
- Mentionner jest-axe dans un DoOD si ce n'est pas dans les deps — écrire "assertions d'accessibilité Playwright (`getByRole`, `toHaveAttribute`, `aria-*`)"

---

## CONVENTIONS DE CODE

### Nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Composants React | PascalCase | `AppShell`, `LoginForm`, `MobileNav` |
| Fichiers composants | kebab-case | `app-shell.tsx`, `login-form.tsx`, `mobile-nav.tsx` |
| Fonctions utilitaires | camelCase | `getAllModules()`, `getModuleBySlug()` |
| Server actions | camelCase suffixe `Action` | `loginAction()` |
| Schémas Zod | camelCase suffixe `Schema` | `loginSchema`, `registerSchema` |
| Route groups Next.js | parenthèses | `(auth)/`, `(learner)/` |
| Variables d'env | SCREAMING_SNAKE_CASE | `JWT_SECRET`, `AUTH_URL` |
| Imports Node.js | protocole `node:` obligatoire | `import path from "node:path"` |

### Structure des composants

**Server Component (données + rendu) :**
```tsx
// apps/web/app/(learner)/layout.tsx
import { getAllModules } from "@/lib/module-registry"
import { AppShell } from "@/components/layout/app-shell"

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const modules = await getAllModules()
  return <AppShell modules={modules}>{children}</AppShell>
}
```

**Client Component (interactivité) :**
```tsx
// apps/web/components/layout/app-shell.tsx
"use client"

import type { ModuleMetadata } from "@formations-ia/shared-types"

interface AppShellProps {
  modules: ModuleMetadata[]
  children: React.ReactNode
}

export function AppShell({ modules, children }: AppShellProps): React.JSX.Element {
  // hooks ici (usePathname, useState, etc.)
  return (/* JSX */)
}
```

**Client Component avec Server Action (formulaires) :**
```tsx
// apps/web/app/(auth)/login/login-form.tsx
"use client"

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [serverState, formAction, isPending] = useActionState(loginAction, null)
  // validation client Zod via onSubmit, server action via action={formAction}
}
```

### Gestion des erreurs

**Erreur attendue (retourner, ne pas lancer) :**
```ts
// apps/web/app/(auth)/actions.ts
try {
  await signIn("credentials", { ... })
} catch (error) {
  if (error instanceof AuthError) {
    return { error: "Identifiants invalides." }  // retour de données, pas throw
  }
  throw error  // NEXT_REDIRECT et erreurs inattendues : toujours re-lancer
}
```

**Erreur de parsing/IO (dégradation gracieuse) :**
```ts
// apps/web/lib/module-registry.ts
try {
  entries = await readdir(MODULES_DIR)
} catch {
  return []  // dossier absent → liste vide, pas d'exception
}
```

---

## VOCABULAIRE MÉTIER

| Terme métier | Définition | Terme à éviter |
|--------------|------------|----------------|
| Module | Unité de contenu autonome (fichier MDX + frontmatter validé) correspondant à un thème de formation | Cours, leçon, chapitre |
| Apprenant | Utilisateur consultant ESN en formation (rôle `learner`) | Élève, étudiant, utilisateur |
| Formateur | Rôle administrateur capable de créer/modifier des modules (rôle `instructor`) — non implémenté en itération 1 | Admin, auteur |
| Slug | Identifiant URL d'un module (`"ai-engineering"`) — dérivé du frontmatter, pas du nom de fichier | ID, code, nom |
| Progression | Avancement d'un apprenant sur un module (0–100 %) — persisté en DB, calculé côté serveur | Score, avancement, statut |
| Quiz | Évaluation interactive intégrée à un module MDX — pas une page séparée | Test, examen, QCM |
| Registry | Service (`module-registry.ts`) qui découvre et valide les modules depuis le filesystem | Store, catalogue, liste |
| Shell | Layout applicatif (navigation + zone contenu) — ex: Auth Shell, Navigation Shell | Wrapper, container, frame |

---

## PATTERNS DE DÉVELOPPEMENT

### Pattern 1 — Server Component avec fetch de données

Les pages et layouts qui ont besoin de données sont des Server Components async. Ils appellent directement les fonctions du registry ou de la DB — pas de `useEffect`, pas de `fetch` client.

```tsx
// Page : données + rendu, pas de logique client
export default async function DashboardPage() {
  const modules = await getAllModules()
  return <ModuleGrid modules={modules} />
}

// Layout : données partagées transmises via props, pas via Context
export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const modules = await getAllModules()
  return <AppShell modules={modules}>{children}</AppShell>
}
```

### Pattern 2 — Server Action + useActionState (formulaires)

Les formulaires mutants utilisent le tandem Server Action (validation serveur + effet) + `useActionState` (état UI). La validation Zod client se fait via `onSubmit` pour le feedback immédiat ; la Server Action est la source de vérité.

```ts
// actions.ts — "use server"
export async function myAction(_prevState: State | null, formData: FormData): Promise<State | null> {
  try {
    await doSomething(formData)
  } catch (error) {
    if (error instanceof KnownError) return { error: "Message utilisateur" }
    throw error  // re-lancer pour que Next.js gère NEXT_REDIRECT et erreurs fatales
  }
  return null
}
```

```tsx
// form.tsx — "use client"
const [state, formAction, isPending] = useActionState(myAction, null)
// aria-invalid + role="alert" sur les champs en erreur (RGAA)
```

### Pattern 3 — Playwright avec état d'authentification

Les tests E2E qui testent des pages protégées réutilisent un `storageState` créé une seule fois par le projet `setup`. Ne jamais authentifier dans chaque test — c'est lent et fragile.

```ts
// global.setup.ts
await page.fill('[name="email"]', "test@example.com")
await page.fill('[name="password"]', "password123")
await page.click('[type="submit"]')
await page.context().storageState({ path: "e2e/.auth/user.json" })

// playwright.config.ts
projects: [
  { name: "setup", testMatch: /global\.setup\.ts/ },
  { name: "chromium", use: { storageState: "e2e/.auth/user.json" }, dependencies: ["setup"] },
]
```

Filtrer toujours les `role="alert"` par texte : `page.getByRole("alert").filter({ hasText: "..." })` — Next.js injecte son propre `role="alert"` pour le routeur.

---

## ANTI-PATTERNS

| Anti-pattern | Pourquoi éviter | Alternative |
|--------------|-----------------|-------------|
| `export { auth as middleware }` sans callback | Ne permet pas de gérer protect + redirect-from-login dans le même middleware | `export default auth((req) => { ... })` avec callback explicite |
| `page.locator('[role="alert"]')` sans filtre | Next.js injecte `<div role="alert" id="__next-route-announcer__">` → strict mode Playwright explose | `page.getByRole("alert").filter({ hasText: "..." })` |
| `import.meta.url` ou `__dirname` dans les fichiers Playwright | Les fichiers de config/setup Playwright ne s'exécutent pas en ESM pur → `exports is not defined` | Utiliser des chemins relatifs simples : `"e2e/.auth/user.json"` |
| `getAllModules()` dans un Client Component | `fs/promises` n'est pas disponible côté client, l'appel échoue silencieusement ou lève une erreur | Appeler `getAllModules()` dans un Server Component parent et passer les données via props |
| Server Action qui ne re-lance pas les erreurs inconnues | `NEXT_REDIRECT` (lancé par `redirect()`) est intercepté et traité comme une erreur applicative | Toujours `throw error` dans le `catch` après avoir géré les cas connus (`AuthError`, etc.) |

---

## LESSONS LEARNED

> Section mise à jour à chaque fin d'itération (commande `/aiad-retro`).
> Documentez ici les erreurs récurrentes de l'agent ET les corrections appliquées.

| Date | Erreur agent | Correction | Impact |
|------|-------------|------------|--------|
| 2026-04-27 | Playwright setup : `fileURLToPath(import.meta.url)` → `exports is not defined in ES module scope` | Utiliser un chemin relatif simple `"e2e/.auth/user.json"` dans le setup Playwright — pas de `__dirname` nécessaire | Bloquant E2E |
| 2026-04-27 | Sélecteur `page.locator('[role="alert"]')` — violation strict mode Playwright : Next.js ajoute son propre `__next-route-announcer__` avec `role="alert"` | Toujours filtrer : `page.getByRole("alert").filter({ hasText: "..." })` | Test faux-négatif → 1 itération corrective |
| 2026-04-27 | Build Turbopack + `next start` sur ancienne instance → chunks manquants (500) | Toujours `rm -rf .next` avant de relancer si un serveur existant tourne sur le même port | Bloquant serveur |
| 2026-04-28 | Corrections agent sur SPEC-005/006/007 non commitées atomiquement — itérations correctives effacées de l'historique git | Chaque correction agent, même minime, doit faire l'objet d'un commit atomique avec référence SPEC dans le message (`fix(spec-006): ...`). Sans trace git, le taux de premier passage réel est non mesurable en rétro. | Métriques de rétro incomplètes |
| 2026-04-28 | Tests asyncpg avec `create_async_engine` sans `NullPool` → `InterfaceError: cannot perform operation: another operation is in progress` après un `IntegrityError` dans un test précédent (asyncpg réutilise la connexion du pool) | Toujours utiliser `NullPool` sur l'engine de test : `create_async_engine(url, poolclass=NullPool)` — une connexion neuve par test, jamais de réutilisation | 3 tests sur 4 en erreur, détecté au premier run |
| 2026-04-28 | Tests Playwright E2E échouent sur `getByRole('img', ...)` après ajout d'un nouveau `.tsx` — erreur Turbopack : "Module factory is not available" (500 sur la page) | Après ajout de tout nouveau fichier `.tsx` au projet, redémarrer le serveur de dev Turbopack (`kill $(lsof -ti :3003) && PORT=3003 pnpm dev`) avant de lancer les tests E2E | Bloquant E2E — 3 tests SPEC-011 en échec jusqu'au redémarrage |

---

## HUMAN LEARNINGS

> Section v1.1 — Documentez ici les écarts entre l'intention humaine et la livraison.
> Ces learnings ne sont PAS des erreurs de l'agent — ce sont des défaillances de l'expression humaine.

| Date | Intention exprimée | Résultat obtenu | Apprentissage |
|------|--------------------|-----------------|---------------|
| 2026-04-27 | Page login sans JS requis pour la soumission (progressive enhancement) | `useActionState` (React 19) exige JS — la soumission ne fonctionne pas sans JS | Spécifier "sans JS" impose une architecture Server Component pur avec `<form action={serverAction}>` natif. Incompatible avec validation Zod client en même composant. Choisir explicitement entre progressive enhancement et DX React. |
| 2026-04-27 | `NEXTAUTH_URL` suffisant pour Auth.js v5 | Auth.js v5 requiert aussi `AUTH_URL` + `AUTH_TRUST_HOST=true` pour les environnements non-HTTPS | Auth.js v5 (next-auth@beta) a changé ses env vars : `AUTH_URL` remplace `NEXTAUTH_URL` (compat shim conservé). `AUTH_TRUST_HOST=true` obligatoire en développement local. À documenter dans .env.example dès l'installation. |
| 2026-04-27 | "Tests jest-axe" dans DoOD | Projet utilise Vitest + Playwright — jest-axe non installé, assertions équivalentes via Playwright | Aligner le DoOD avec le stack de test réel du projet. Si jest-axe est voulu, l'ajouter explicitement dans la SPEC des deps. Sinon, écrire "assertions d'accessibilité (Playwright ou jest-axe)". |
| 2026-04-27 | Sections AGENT-GUIDE (stack technique, nommage, patterns) peuplées avec des placeholders sur 4 SPECs | L'agent a dû aller chercher ARCHITECTURE.md à chaque session faute de condensé dans AGENT-GUIDE | L'AGENT-GUIDE est le contrat de contexte permanent — le peupler est un prérequis avant la première SPEC, pas une tâche optionnelle. Action : peupler avant l'itération 2. |
| 2026-04-27 | Estimations Context Budget systématiquement basses (~40% de l'estimé réel) | SPEC-002 : ~800 tokens estimés / ~1 800 réels. SPEC-004 : ~1 050 / ~1 700. | Appliquer un facteur multiplicatif ×1.7 sur les estimations initiales. Le budget réel dépasse toujours l'estimé car les fichiers source existants ne sont pas comptés en Gate. |
| 2026-04-28 | API FastAPI sans auth inter-service (SPEC-010) — `GET /progress` | `GET /progress?user_id=` accessible sans token — tout appelant avec un UUID valide peut lire la progression d'un autre utilisateur | L'auth est déléguée à Auth.js/Next.js (Server Component = seul appelant prévu). Acceptable en dev avec API interne. Avant exposition publique : ajouter un shared secret ou JWT inter-service entre Next.js et FastAPI (header `X-Internal-Token`). |
| 2026-04-28 | SPEC-011 — remplacer les marqueurs formateurs dans les 6 MDX | La SPEC a documenté uniquement les 24 marqueurs `💼 **Steeve**` dans le DoOD, omettant les 6 marqueurs `🔬 **Dr. Lena Voss**` (1 par fichier) — découverts lors du test manuel post-livraison | Lors de la rédaction d'une SPEC de migration textuelle, inventorier TOUS les patterns de marqueurs présents dans les fichiers cibles avant de rédiger le DoOD. Un `grep` exhaustif sur le corpus MDX en phase Gate aurait révélé les deux familles de marqueurs (`💼` et `🔬`). |
