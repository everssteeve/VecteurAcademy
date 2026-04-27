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
