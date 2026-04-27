# SPEC-002-module-registry

**Intent parent** : INTENT-001-skeleton-navigation-modulaire
**Auteur** : Steeve Evers (PE)
**Date** : 2026-04-27
**Statut** : done
**SQS** : 4/5 ⚠️ (non-ambiguïté — voir corrections Gate 2026-04-27)

---

## 1. Contexte

La contrainte de modularité de l'Intent est : **ajouter un module = créer un fichier MDX, zéro modification du code existant**. Cette SPEC définit le mécanisme de découverte automatique des modules depuis le filesystem et le schéma de métadonnées partagé. C'est la pièce centrale qui rend la navigation de SPEC-003 data-driven.

## 2. Comportement Attendu

### Input

Fichiers MDX dans `apps/web/content/modules/` respectant la convention de nommage `NN-slug.mdx` (ex: `01-ai-engineering.mdx`). Chaque fichier contient un frontmatter YAML.

### Processing

1. Définir le schéma `ModuleMetadata` dans `packages/shared-types/src/module.ts`
2. Créer la fonction `getAllModules(): Promise<ModuleMetadata[]>` dans `apps/web/lib/module-registry.ts` :
   - Scanne `content/modules/` via `fs.readdir` (Node.js server-side uniquement)
   - Parse le frontmatter de chaque `.mdx` avec `gray-matter`
   - Valide le frontmatter via Zod (crash explicite si champ requis manquant)
   - Trie par champ `order` (fallback : ordre alphabétique du filename)
   - Retourne le tableau trié
3. Créer `getModuleBySlug(slug: string): Promise<ModuleMetadata | null>` dans le même fichier
4. Créer 6 fichiers MDX placeholder dans `apps/web/content/modules/` avec frontmatter complet mais body vide (contenu = `{/* contenu à venir */}`)
5. Exporter les types depuis `packages/shared-types/index.ts` pour consommation par l'API FastAPI (via génération OpenAPI future)

### Output

- Type `ModuleMetadata` exporté depuis `packages/shared-types`
- Fonctions `getAllModules()` et `getModuleBySlug()` utilisables dans les Server Components Next.js
- 6 fichiers MDX placeholder validés par le registry

### Cas limites

- Fichier MDX sans frontmatter ou frontmatter invalide : Zod lève une erreur explicite (`ZodError: invalid frontmatter in 01-ai-engineering.mdx: <message Zod>`)
- Fichier MDX avec `order` dupliqué : log warning en dev, tri stable par filename en fallback
- Dossier `content/modules/` vide ou inexistant : `getAllModules()` retourne `[]` sans erreur (la nav affichera un état vide)
- Fichier non-MDX dans le dossier (ex: `.DS_Store`) : ignoré silencieusement (filtre sur extension `.mdx`)
- Slug inexistant dans `getModuleBySlug` : retourne `null` (pas d'exception), la page Next.js appelle `notFound()`

## 3. Critères d'Acceptation

- [x] `getAllModules()` retourne les 6 modules triés par `order` dans un Server Component
- [x] Ajouter un 7e fichier MDX avec frontmatter valide suffit à le faire apparaître dans le résultat sans modifier `module-registry.ts`
- [x] Un frontmatter invalide (champ requis manquant) provoque une erreur Zod explicite au build (`next build`)
- [x] `getModuleBySlug('inexistant')` retourne `null`
- [x] Le type `ModuleMetadata` est importable depuis `@formations-ia/shared-types`
- [x] `pnpm --filter web typecheck` passing avec les types du registry

## 4. Interface / API

```typescript
// packages/shared-types/src/module.ts
export interface ModuleMetadata {
  id: string;           // ex: "01"
  slug: string;         // ex: "ai-engineering"
  title: string;        // ex: "Introduction à l'AI Engineering"
  description: string;  // 1-2 phrases pour la nav/cards
  order: number;        // 1-based, détermine l'ordre dans la nav
  duration: number;     // durée estimée en minutes
  audience: ('consultant' | 'commercial')[]; // publics cibles
  tags?: string[];      // facultatif
}

// apps/web/lib/module-registry.ts
export async function getAllModules(): Promise<ModuleMetadata[]>
export async function getModuleBySlug(slug: string): Promise<ModuleMetadata | null>
```

```yaml
# Exemple frontmatter MDX — apps/web/content/modules/01-ai-engineering.mdx
---
id: "01"
slug: "ai-engineering"
title: "Introduction à l'AI Engineering"
description: "Comprendre ce qu'est un AI Engineer et pourquoi ce rôle émerge dans les ESN."
order: 1
duration: 45
audience:
  - consultant
  - commercial
tags:
  - fondamentaux
---
```

## 5. Dépendances

- **SPEC-001** (monorepo bootstrap) — prérequis bloquant
- Packages à ajouter : `gray-matter`, `zod` (frontend)
- Requis par : SPEC-003 (navigation shell)

## 6. Context Budget (réel)

**Contexte injecté lors de l'exécution :**
- AGENT-GUIDE : ~400 tokens
- ARCHITECTURE.md §3-5 : ~500 tokens
- Cette SPEC : ~600 tokens
- Fichiers source inspectés : `shared-types/index.ts` (déjà peuplé), `apps/web/package.json` : ~300 tokens
- **Total réel** : ~1 800 tokens (estimation initiale : ~800 tokens — écart dû au contenu déjà présent dans shared-types)
- Marge : largement sous le seuil 50K ✅

## 7. Definition of Output Done (DoOD)

- [x] Code implémenté (`module-registry.ts` + types) et lint passing
- [x] 6 fichiers MDX placeholder créés avec frontmatter complet et valide
- [x] Configurer Vitest dans `apps/web` : `vitest.config.ts`, script `"test": "vitest run"` dans `package.json`
- [x] Test unitaire Vitest sur `getAllModules()` : tri par `order`, filtre extension `.mdx`, retour `[]` si dossier vide
- [x] Test unitaire Vitest sur `getModuleBySlug()` : slug trouvé, slug inexistant → `null`
- [x] SPEC mise à jour (Drift Lock 2026-04-27)
- [ ] Code review passée (1 approval minimum) — en attente de PR
- [x] Gouvernance RGESN : `gray-matter` + `zod` sont des dépendances légères sans impact bundle (server-only)

## 8. Notes de Drift Check (2026-04-27)

**Drifts documentés :**
- Message ZodError : format réel `ZodError: invalid frontmatter in <file>: <message>` (plus complet que la SPEC initiale) — SPEC mise à jour
- Gestion `ENOENT` : le dossier inexistant retourne `[]` (non prévu, amélioration) — SPEC mise à jour
- Context Budget réel : ~1 800 tokens vs ~800 tokens estimés (shared-types déjà peuplé)

**Verdict** : Aucun drift bloquant. Code et SPEC synchronisés. ✅
