# SPEC-001-monorepo-bootstrap

**Intent parent** : INTENT-001-skeleton-navigation-modulaire
**Auteur** : Steeve Evers (PE)
**Date** : 2026-04-27
**Statut** : done
**SQS** : 4/5 (Gate ouverte avec réserve — point faible : Dockerfile apps/api et YAML CI non spécifiés)

---

## 1. Contexte

L'application de formation en IA engineering n'a pas encore de base de code. Cette SPEC établit le monorepo pnpm avec les deux applications (Next.js frontend + FastAPI backend), la configuration des outils (Biome, uv, Ruff/Black), et l'environnement local Docker Compose. C'est le prérequis bloquant pour toutes les SPECs suivantes.

## 2. Comportement Attendu

### Input

Aucun — création ex nihilo à la racine du dépôt `formationsIA/`.

### Processing

1. Initialiser `pnpm-workspace.yaml` avec les workspaces `apps/*` et `packages/*`
2. Créer `apps/web/` — Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, Biome
3. Créer `apps/api/` — FastAPI + Python 3.12, uv, Ruff + Black, structure de répertoires (`routers/`, `services/`, `models/`, `schemas/`, `migrations/`)
4. Créer `packages/shared-types/` — package TypeScript vide (index.ts + package.json) destiné aux types partagés frontend ↔ API
5. Créer `docker-compose.yml` — services : `db` (PostgreSQL 16 + pgvector), `api` (FastAPI), `langfuse` (optionnel, commenté)
6. Créer `.env.example` avec toutes les variables requises (cf. section Interface)
7. Configurer `biome.json` à la racine avec les règles TypeScript strict
8. Configurer `pyproject.toml` dans `apps/api/` avec uv + Ruff (line-length 88) + Black
9. Créer le squelette GitHub Actions CI (`.github/workflows/ci.yml`) : lint + typecheck frontend, lint backend — pas de tests (aucun à ce stade)

### Output

Structure de fichiers conforme à ARCHITECTURE.md §4, commandes opérationnelles :
- `pnpm dev` → Next.js sur `:3000`
- `docker compose up` → PostgreSQL sur `:5432`, API FastAPI sur `:8000`
- `pnpm --filter web typecheck` → 0 erreur
- `pnpm --filter web lint` → 0 erreur Biome

### Cas limites

- Si `pgvector` n'est pas disponible dans l'image PostgreSQL standard : utiliser `pgvector/pgvector:pg16` (image Docker officielle)
- Si `pnpm` < 9 sur la machine : forcer `packageManager` dans le `package.json` racine
- Si le port 5432 est occupé en local : le `docker-compose.yml` expose sur `5433:5432` par défaut avec note dans le README
- Si Next.js 15 génère des warnings de dépréciation Tailwind v4 : documenter dans CHANGELOG-ARTEFACTS.md

## 3. Critères d'Acceptation

- [x] `pnpm install` depuis la racine installe toutes les dépendances sans erreur
- [ ] `pnpm --filter web dev` démarre Next.js sur `:3000` avec page d'accueil par défaut (no-crash) — à valider manuellement
- [ ] `docker compose up -d` démarre PostgreSQL + API sans erreur ; `docker compose ps` montre tous les services `healthy` — à valider manuellement
- [x] `pnpm --filter web typecheck` retourne 0 erreur TypeScript
- [x] `pnpm --filter web lint` retourne 0 erreur Biome
- [x] `cd apps/api && uv run ruff check .` retourne 0 erreur
- [x] `.env.example` documente toutes les variables ; `.env` est dans `.gitignore`
- [ ] La CI GitHub Actions passe (lint + typecheck) sur une PR vide — nécessite un dépôt GitHub

## 4. Interface / API

```
# .env.example — variables requises
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/formationsIA
JWT_SECRET=changeme-in-production
ANTHROPIC_API_KEY=sk-ant-...
LITELLM_DEFAULT_MODEL=claude-sonnet-4-6
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```yaml
# docker-compose.yml — services minimum
services:
  db:
    image: pgvector/pgvector:pg16
    ports: ["5433:5432"]
    environment:
      POSTGRES_DB: formationsIA
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: ./apps/api
    ports: ["8000:8000"]
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
```

## 5. Dépendances

- Aucune SPEC parente — c'est la fondation
- Requis par : SPEC-002, SPEC-003, SPEC-004

## 6. Estimation Context Budget

**Contexte à injecter pour cette tâche :**
- AGENT-GUIDE (condensé) : ~200 tokens
- ARCHITECTURE.md §3 (stack) + §4 (structure) : ~400 tokens
- Cette SPEC : ~350 tokens
- Fichiers source pertinents : aucun (création ex nihilo)
- **Total estimé** : ~950 tokens

## 7. Definition of Output Done (DoOD)

- [x] Code implémenté et lint passing (Biome + Ruff)
- [x] `pnpm typecheck` passing
- [ ] Docker Compose opérationnel en local — à valider manuellement
- [x] SPEC mise à jour si écart découvert (Drift Lock)
- [ ] Code review passée (1 approval minimum)
- [x] Gouvernance RGESN : bundle JS First Load 119 kB (~40-50 kB gzippé, sous le seuil 200 kB) ✅

## 8. Notes de Validation (2026-04-27)

### Corrections post-exécution (gouvernance RGAA)
- `lang="en"` → `lang="fr"` dans `apps/web/app/layout.tsx`
- Ajout des règles obligatoires ARCHITECTURE §9 dans `globals.css` : `.sr-only`, `:focus-visible`, `prefers-reduced-motion`
- Titre/description Next.js mis à jour (suppression placeholder "Create Next App")

### Drift documenté (Drift Check 2026-04-27)
- SPEC mentionne "Ruff + Black" → implémenté avec `ruff format` uniquement (remplace black, approche moderne, conforme ARCHITECTURE §5 Conventions) — **drift positif**
- Dockerfile `apps/api/` créé (réserve SQS levée) — **drift positif**
- `packages/shared-types/index.ts` : SPEC dit "vide" mais contient types initiaux `User`, `ModuleProgress`, `QuizResult` alignés sur ARCHITECTURE — **drift positif, anticipe SPEC-002/003**
- `pnpm.onlyBuiltDependencies` ajouté dans `package.json` racine (requis par pnpm 10 pour @biomejs/biome) — **technique interne, non visible utilisateur**
- `.gitignore` enrichi : `tsconfig.tsbuildinfo` (artefact de build tsc) — **correction nécessaire**
- `apps/api/migrations/.gitkeep` ajouté — **correction nécessaire pour git tracking**

### Critères en attente de validation manuelle
- `pnpm --filter web dev` → page sur `:3000`
- `docker compose up -d` → services healthy
- CI GitHub Actions → nécessite un dépôt GitHub remote
