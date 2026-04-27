# SPEC-002-module-registry

**Intent parent** : INTENT-001-skeleton-navigation-modulaire
**Auteur** : Steeve Evers (PE)
**Date** : 2026-04-27
**Statut** : draft
**SQS** : À évaluer via /sdd-gate

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

- Fichier MDX sans frontmatter : Zod lève une erreur avec le nom du fichier concerné (`ZodError: missing field "title" in 01-ai-engineering.mdx`)
- Fichier MDX avec `order` dupliqué : log warning en dev, tri stable par filename en fallback
- Dossier `content/modules/` vide : `getAllModules()` retourne `[]` sans erreur (la nav affichera un état vide)
- Fichier non-MDX dans le dossier (ex: `.DS_Store`) : ignoré silencieusement (filtre sur extension `.mdx`)
- Slug inexistant dans `getModuleBySlug` : retourne `null` (pas d'exception), la page Next.js appelle `notFound()`

## 3. Critères d'Acceptation

- [ ] `getAllModules()` retourne les 6 modules triés par `order` dans un Server Component
- [ ] Ajouter un 7e fichier MDX avec frontmatter valide suffit à le faire apparaître dans le résultat sans modifier `module-registry.ts`
- [ ] Un frontmatter invalide (champ requis manquant) provoque une erreur Zod explicite au build (`next build`)
- [ ] `getModuleBySlug('inexistant')` retourne `null`
- [ ] Le type `ModuleMetadata` est importable depuis `@formationsIA/shared-types`
- [ ] `pnpm --filter web typecheck` passing avec les types du registry

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

## 6. Estimation Context Budget

**Contexte à injecter pour cette tâche :**
- AGENT-GUIDE (condensé) : ~200 tokens
- ARCHITECTURE.md §4 (structure projet) : ~200 tokens
- Cette SPEC : ~400 tokens
- Fichiers source pertinents : `packages/shared-types/index.ts` (vide à ce stade)
- **Total estimé** : ~800 tokens

## 7. Definition of Output Done (DoOD)

- [ ] Code implémenté (`module-registry.ts` + types) et lint passing
- [ ] 6 fichiers MDX placeholder créés avec frontmatter complet et valide
- [ ] Test unitaire Vitest sur `getAllModules()` : tri, filtre extension, retour vide
- [ ] Test unitaire Vitest sur `getModuleBySlug()` : trouvé, non trouvé
- [ ] SPEC mise à jour si écart découvert (Drift Lock)
- [ ] Code review passée (1 approval minimum)
- [ ] Gouvernance RGESN : `gray-matter` + `zod` sont des dépendances légères sans impact bundle (server-only)
