# Changelog des Artefacts AIAD

> Ce fichier trace les mises à jour significatives des artefacts SDD Mode.
> Il permet de vérifier la synchronisation artefacts/code lors du Drift Check.

## Format

```
## [Date] — [Artefact] — [Type de changement]

**Auteur** : [Qui]
**Raison** : [Pourquoi cette mise à jour]
**Impact** : [SPECs ou code affectés]
```

---

<!-- Ajoutez vos entrées ci-dessous, les plus récentes en haut -->

## 2026-04-28 — SPEC-007 — Drift Lock ✅ (statut `done`) + INTENT-002 → `livré`

**Auteur** : Steeve Evers (PE) via Claude Code
**Raison** : Validation QA complète + Drift Lock SPEC-007 — Quiz de fin de parcours (Certification)
**Impact** : SPEC-007 → statut `done` ; INTENT-002 → statut `livré` (toutes les SPECs 005/006/007 livrées)

### Résultats validation

- Lint (biome) : ✅ PASS
- Typecheck (tsc) : ✅ PASS
- Tests (vitest) : ✅ 34/34 (13 nouveaux tests SPEC-007)
- Build (next build) : ✅ PASS — `/evaluation-finale` statique (○), 2.81 kB
- RGAA : `<h1>` unique, `<fieldset>/<legend>`, `<output aria-live="polite">`, `aria-current="page"` — conforme
- RGESN : page SSR statique, zéro dépendance externe ajoutée, bundle < 200 kB gzippé

### Fichiers produits (code)

- `packages/shared-types/src/quiz.ts` — `CertificationLevel` + `getCertificationLevel()` ajoutés
- `packages/shared-types/index.ts` — exports mis à jour
- `apps/web/app/(learner)/evaluation-finale/page.tsx` — nouvelle page SSR statique
- `apps/web/app/(learner)/evaluation-finale/questions.ts` — 18 questions issues de `formationIA.md`
- `apps/web/components/quiz/final-quiz.tsx` — composant `"use client"`, state machine 3 états
- `apps/web/components/quiz/__tests__/final-quiz.test.ts` — 13 tests Vitest
- `apps/web/components/layout/sidebar.tsx` — lien "Évaluation finale" + `aria-current`
- `apps/web/components/layout/mobile-nav.tsx` — même lien + `onClick={() => setIsOpen(false)}`

### Drifts documentés (intentionnels)

- **Drift A** — État `intro` ajouté à la state machine (SPEC : 2 états, code : 3 états) — implémentation du flux UX "Commencer/Recommencer" décrit §2 mais absent du type TypeScript
- **Drift B** — `<output>` au lieu de `<div role="status">` — règle Biome `lint/a11y/useSemanticElements`, amélioration RGAA

### Artefacts AIAD mis à jour

- `specs/SPEC-007-quiz-parcours-final.md` → statut `done`, DoOD coché, §8 Notes de Drift ajouté
- `specs/_index.md` → statut `done`, PR `commit SPEC-007`
- `intents/INTENT-002-contenu-modules-quiz.md` → statut `livré`
- `intents/_index.md` → statut `livré`
- `CHANGELOG-ARTEFACTS.md` (cette entrée)

---

## 2026-04-28 — SPEC-006 — Drift Lock ✅ (statut `done`)

**Auteur** : Steeve Evers (PE) via Claude Code
**Raison** : Validation QA complète + Drift Lock SPEC-006
**Impact** : SPEC-006 → statut `done` ; 21/21 tests vitest, lint clean, browser validated (Playwright)

### Résultats validation

- Lint (biome) : ✅ PASS
- Typecheck (tsc) : ✅ PASS
- Tests (vitest) : ✅ 21/21
- Browser : Quiz Q1→Q5, résultats, restart — tous fonctionnels
- RGAA : fieldset+legend, aria-live, `<output>`, `aria-label` — conforme
- RGESN : zéro dépendance externe ajoutée

---

## 2026-04-28 — SPEC-006 — Exécution agent + statut `validation`

**Auteur** : Steeve Evers (PE) via Claude Code
**Raison** : Implémentation du composant Quiz de fin de module (INTENT-002)
**Impact** : SPEC-006 → statut `validation` ; composant `<Quiz>` opérationnel dans les 6 modules MDX

### Fichiers produits (code)

- `packages/shared-types/src/quiz.ts` — Type `QuizQuestion` créé
- `packages/shared-types/index.ts` — Export `QuizQuestion` ajouté
- `apps/web/components/quiz/quiz.tsx` — Composant React client, state machine 2 états, RGAA conforme
- `apps/web/components/quiz/__tests__/quiz.test.ts` — 5 tests Vitest (score 0/5, partiel, 5/5, disabled logic)
- `apps/web/components/mdx/mdx-components.tsx` — `Quiz` enregistré dans le map MDX
- `apps/web/content/modules/01-ai-engineering.mdx` — Placeholder remplacé par `<Quiz questions={[...]} />`
- `apps/web/content/modules/02-foundation-models.mdx` — idem
- `apps/web/content/modules/03-model-selection.mdx` — idem
- `apps/web/content/modules/04-prompt-engineering.mdx` — idem
- `apps/web/content/modules/05-rag-agents.mdx` — idem
- `apps/web/content/modules/06-production-architecture.mdx` — idem

---

## 2026-04-27 — SPEC-005 — Drift Check + Drift Lock

**Auteur** : Steeve Evers (PE) via Claude Code
**Raison** : Clôture de SPEC-005-mdx-content-rendering après exécution agent, validation technique et drift check
**Impact** : SPEC-005 → statut `done` ; Infrastructure MDX opérationnelle, 6 modules peuplés avec contenu pédagogique complet

### Fichiers produits (code)

- `apps/web/components/mdx/mdx-components.tsx` — Mappings MDX : h1-h3, p, ul, ol, li, strong, em, blockquote (amber), hr, code, pre
- `apps/web/app/globals.css` — `@plugin "@tailwindcss/typography";` ajouté
- `apps/web/content/modules/01-ai-engineering.mdx` — Contenu complet (sections 1-4, 6 depuis `formationIA.md`)
- `apps/web/content/modules/02-llm-fundamentals.mdx` — Contenu complet
- `apps/web/content/modules/03-prompt-engineering.mdx` — Contenu complet
- `apps/web/content/modules/04-rag-systems.mdx` — Contenu complet
- `apps/web/content/modules/05-agents-automation.mdx` — Contenu complet
- `apps/web/content/modules/06-production-architecture.mdx` — Contenu complet

### Fichiers modifiés

- `packages/shared-types/src/module.ts` — Ajout interface `ModuleWithContent`
- `packages/shared-types/index.ts` — Export `ModuleWithContent`
- `apps/web/lib/module-registry.ts` — `parseModule()` retourne `rawContent`, `getModuleBySlug()` retourne `ModuleWithContent | null`
- `apps/web/app/(learner)/modules/[slug]/page.tsx` — `<MDXRemote>` + `mdxComponents` + `<article>` prose
- `apps/web/package.json` + `pnpm-lock.yaml` — Ajout `next-mdx-remote`, `@tailwindcss/typography`

### Métriques

- Tests unitaires Vitest : **8/8** PASS (module-registry, aucune régression)
- TypeCheck : **PASS** (`pnpm typecheck --filter web`)
- Lint : **PASS** (`pnpm lint --filter web`)
- 6 modules × 5 sections (Accroche, Concepts clés, Sous le capot, Cas pratique, Mémo flash) — ~15 000 tokens de contenu transposé

### Drifts documentés (intentionnels)

- **Drift A** — `mdxComponents` non typé `MDXComponents` — `mdx/types` non disponible sans `@types/mdx` ; type inféré par TS correctement
- **Drift B** — Imports relatifs (`../../../../`) au lieu de `@/` — alias non configuré dans tsconfig, cohérence codebase
- **Drift C** — Composant `pre` ajouté (hors liste SPEC) — nécessaire pour les blocs de code MDX stylisés

### Artefacts AIAD mis à jour

- `specs/SPEC-005-mdx-content-rendering.md` → statut `done`, DoOD coché, §8 Notes de Drift ajouté
- `specs/_index.md` → statut `done`
- `CHANGELOG-ARTEFACTS.md` (cette entrée)

---

## 2026-04-27 — SPEC-004 — Drift Check + Drift Lock

**Auteur** : Steeve Evers (PE) via Claude Code
**Raison** : Clôture de SPEC-004-auth-shell après exécution agent, validation (27/27 E2E, 16/16 unitaires) et drift check
**Impact** : SPEC-004 → statut `done` ; Auth Shell prêt, périmètre d'authentification frontend opérationnel

### Fichiers produits (code)
- `apps/web/auth.ts` — NextAuth v5 config : provider Credentials stub, JWT+session callbacks, `JWT_SECRET` check
- `apps/web/middleware.ts` — Protection `/dashboard`, `/modules/:path*` + redirect `/login`→`/dashboard` si authentifié
- `apps/web/app/api/auth/[...nextauth]/route.ts` — Handler Auth.js (GET + POST)
- `apps/web/lib/schemas/auth.ts` — `loginSchema` + `registerSchema` (Zod 4)
- `apps/web/lib/types/next-auth.d.ts` — Augmentation TypeScript : User/Session/JWT avec `role`
- `apps/web/components/providers/session-provider.tsx` — Client wrapper `<SessionProvider>`
- `apps/web/app/(auth)/layout.tsx` — Layout centré pour pages auth (sans sidebar)
- `apps/web/app/(auth)/actions.ts` — Server action `loginAction` avec protection open-redirect
- `apps/web/app/(auth)/login/page.tsx` — Page login Server Component (Next.js 15 async searchParams)
- `apps/web/app/(auth)/login/login-form.tsx` — Form client : Zod, useActionState, aria-invalid, role=alert
- `apps/web/app/(auth)/register/page.tsx` — Page stub avec message accessible (role=alert, aria-live=polite)
- `apps/web/app/(learner)/layout.tsx` — Layout learner avec AppShell (extrait du root layout)
- `apps/web/e2e/auth.spec.ts` — 15 tests Playwright SPEC-004
- `apps/web/e2e/global.setup.ts` — Setup auth state Playwright (login + storageState)
- `apps/web/lib/__tests__/auth-schemas.test.ts` — 16 tests Vitest schémas Zod

### Fichiers modifiés
- `apps/web/app/layout.tsx` — AppShell → AuthSessionProvider (layout refactor)
- `apps/web/playwright.config.ts` — Projets setup + storageState auth
- `.env.example` — Ajout `AUTH_URL`, `AUTH_TRUST_HOST`, `NEXTAUTH_URL`
- `apps/web/.gitignore` — Ajout `e2e/.auth`
- `apps/web/package.json` + `pnpm-lock.yaml` — Ajout `next-auth@5.0.0-beta.31`

### Métriques
- Tests E2E Playwright : **27/27** PASS (15 auth SPEC-004 + 12 navigation SPEC-003 — aucune régression)
- Tests unitaires Vitest : **16/16** PASS
- Bundle JS login first load : **185 kB** (< 200 kB RGESN ✅)
- Middleware bundle : **155 kB** (Edge Runtime)

### Drifts documentés (intentionnels)
- **Drift A** — Middleware `auth((req) => {...})` au lieu de `export { auth as middleware }` — pattern plus complet
- **Drift B** — Page `/register` stub pur sans formulaire — formulaire non pertinent sans backend
- **Drift C** — `AUTH_URL` + `AUTH_TRUST_HOST` requis par Auth.js v5 beta — ajoutés au `.env.example`
- **Drift D** — Layout refactor : AppShell déplacé de root layout → `(learner)/layout.tsx`

### Artefacts AIAD mis à jour
- `specs/SPEC-004-auth-shell.md` → statut `done`, critères cochés, Interface §4 corrigée, §8 Notes de Drift
- `specs/_index.md` → statut mis à jour
- `AGENT-GUIDE.md` → 3 Human Learnings ajoutés
- `CHANGELOG-ARTEFACTS.md` (cette entrée)

## 2026-04-27 — SPEC-003 — Drift Check + Drift Lock

**Auteur** : Steeve Evers (PE) via Claude Code
**Raison** : Clôture de SPEC-003-navigation-shell après exécution agent, validation (Lighthouse 96/100, 12/12 E2E) et drift check
**Impact** : SPEC-003 → statut `done` ; Navigation Shell prête, dépendance SPEC-004 (Auth Shell) débloquée

### Fichiers produits (code)
- `apps/web/app/layout.tsx` — Root layout avec skip link, `lang="fr"`, `getAllModules()` → AppShell
- `apps/web/app/page.tsx` — Redirect `/` → `/dashboard`
- `apps/web/app/globals.css` — Ajout `overflow-x: hidden`
- `apps/web/app/not-found.tsx` — Page 404 accessible avec lien retour `/dashboard`
- `apps/web/app/(learner)/dashboard/page.tsx` — Cards modules, liens, placeholder "non commencé"
- `apps/web/app/(learner)/modules/[slug]/page.tsx` — Shell module, `generateStaticParams`, `notFound()`, prev/next
- `apps/web/components/layout/app-shell.tsx` — Client Component orchestrateur (usePathname)
- `apps/web/components/layout/sidebar.tsx` — Nav desktop ≥ 768px, `aria-current`, 0-module guard
- `apps/web/components/layout/mobile-nav.tsx` — Burger menu, `aria-expanded`, Escape, clic extérieur
- `apps/web/components/layout/breadcrumb.tsx` — `aria-label="Fil d'Ariane"`, `aria-current="page"`
- `apps/web/e2e/navigation.spec.ts` — 12 tests Playwright (tous passent)
- `apps/web/playwright.config.ts` — Config Playwright Chromium
- `apps/web/package.json` + `pnpm-lock.yaml` — Ajout `@playwright/test`
- `apps/web/vitest.config.ts` — Exclusion `e2e/` (correction découverte en validation)

### Métriques
- Lighthouse Accessibilité : **96/100** sur `/dashboard` et `/modules/ai-engineering`
- Bundle JS First Load : **124 kB** (< 200 Ko RGESN)
- Tests E2E : **12/12** PASS
- Tests unitaires : **8/8** PASS

### Drifts documentés (intentionnels)
- `AppShell` (Client Component) introduit — nécessaire pour `usePathname()` dans un root layout Server Component
- `id="sidebar-nav"` sur `<div>` wrapper plutôt que `<nav>` — correction ARIA (`aria-controls` pointe sur l'élément contrôlé)
- `params: Promise<{ slug: string }>` dans `ModulePage` — adaptation Next.js 15 (type async sur params)
- `not-found.tsx` ajouté (non listé dans §2 Processing initial) — satisfait le cas limite "page 404 accessible avec lien retour"

### Artefacts AIAD mis à jour
- `specs/SPEC-003-navigation-shell.md` → statut `done`, critères cochés, drifts documentés, `AppShell` ajouté §4
- `specs/_index.md` → statut mis à jour
- `CHANGELOG-ARTEFACTS.md` (cette entrée)

---

## 2026-04-27 — SPEC-002 — Drift Check + Drift Lock

**Auteur** : Steeve Evers (PE) via Claude Code
**Raison** : Clôture de SPEC-002-module-registry après exécution agent, validation et drift check
**Impact** : SPEC-002 → statut `done` ; Module Registry prêt pour consommation par SPEC-003 (Navigation Shell)

### Fichiers produits (code)
- `packages/shared-types/src/module.ts` — interface `ModuleMetadata`
- `packages/shared-types/index.ts` — re-export `ModuleMetadata`
- `apps/web/lib/module-registry.ts` — `getAllModules()` + `getModuleBySlug()` + Zod schema
- `apps/web/lib/__tests__/module-registry.test.ts` — 8 tests Vitest
- `apps/web/vitest.config.ts` — configuration Vitest
- `apps/web/content/modules/01-ai-engineering.mdx` à `06-production-architecture.mdx` — 6 placeholders
- `apps/web/package.json` — ajout `gray-matter`, `zod`, `vitest`, `@formations-ia/shared-types`

### Drifts documentés
- Message ZodError plus complet que prévu : `ZodError: invalid frontmatter in <file>: <message Zod>` (amélioration)
- Gestion `ENOENT` ajoutée : dossier inexistant retourne `[]` au lieu de lancer une exception (amélioration)
- Context Budget réel ~1 800 tokens vs ~800 estimés (`shared-types/index.ts` déjà peuplé)

### Artefacts AIAD mis à jour
- `specs/SPEC-002-module-registry.md` → statut `done`, critères cochés, §8 Notes de Drift Check
- `specs/_index.md` → statut mis à jour
- `CHANGELOG-ARTEFACTS.md` (cette entrée)

---

## 2026-04-27 — SPEC-002 — Gate (SQS 4/5)

**Auteur** : Steeve Evers (PE) via Claude Code
**Raison** : Execution Gate SPEC-002 — corrections des deux incohérences (nom package, Vitest)
**Impact** : SPEC-002 → statut `ready` ; deux corrections appliquées avant lancement agent

---

## 2026-04-27 — SPEC-001 — Drift Check + Drift Lock

**Auteur** : Steeve Evers (PE) via Claude Code
**Raison** : Clôture de SPEC-001-monorepo-bootstrap après exécution agent, validation et drift check
**Impact** : SPEC-001 → statut `done` ; fondation monorepo prête pour SPEC-002/003/004

### Fichiers produits (code)
- `pnpm-workspace.yaml`, `package.json`, `pnpm-lock.yaml`, `.gitignore`, `biome.json`
- `apps/web/` — Next.js 15, Tailwind v4, Biome, TypeScript strict
- `apps/api/` — FastAPI, uv, Ruff, structure routers/services/models/schemas/migrations
- `packages/shared-types/` — types initiaux alignés ARCHITECTURE
- `docker-compose.yml`, `.env.example`, `.github/workflows/ci.yml`

### Drifts documentés
- `ruff format` remplace Black (approche moderne, conforme)
- `packages/shared-types/index.ts` contient types initiaux (non vide — amélioration)
- Corrections RGAA : `lang="fr"`, `.sr-only`, `:focus-visible`, `prefers-reduced-motion`
- `tsconfig.tsbuildinfo` ajouté au `.gitignore`
- `.gitkeep` dans `apps/api/migrations/`

### Artefacts AIAD mis à jour
- `specs/SPEC-001-monorepo-bootstrap.md` → statut `done` + §8 Notes de Validation
- `specs/_index.md` → statut mis à jour
- `CHANGELOG-ARTEFACTS.md` (cette entrée)

---

## 2026-04-27 — SPEC-001 — Création (Gate)

**Auteur** : Steeve Evers (PE)
**Raison** : Rédaction et validation de SPEC-001 (SQS 4/5 — Gate ouverte)
**Impact** : Prérequis bloquant pour SPEC-002, SPEC-003, SPEC-004
