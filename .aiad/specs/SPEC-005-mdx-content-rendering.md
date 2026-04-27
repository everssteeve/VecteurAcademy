# SPEC-005 — Contenu MDX + Rendu modules

**Intent parent** : INTENT-002
**Auteur** : Steeve Evers
**Date** : 2026-04-27
**Statut** : done
**SQS** : 5/5 ✅

---

## 1. Contexte

Les 6 modules MDX de VecteurAcademy (`content/modules/0x-*.mdx`) existent mais sont vides (`{/* contenu à venir */}`). La page `/modules/[slug]` affiche un placeholder statique — elle ne rend pas le contenu MDX. Le contenu pédagogique complet est dans `.aiad/formationIA.md` (sections 1-4 et 6 de chaque module). Cette SPEC couvre : (a) l'infrastructure de rendu MDX dans la page module, et (b) la transposition fidèle du contenu prose dans les 6 fichiers MDX.

**Hors périmètre** : le composant Quiz interactif (section 5 de chaque module) → SPEC-006.

---

## 2. Comportement Attendu

### Input

- **Source de contenu** : `.aiad/formationIA.md` — sections par module :
  - `## 1. ACCROCHE` → accroche narrative
  - `## 2. CONCEPTS CLÉS` → 5-6 concepts (Définition / Exemple ESN / Ce qu'il ne faut PAS croire)
  - `## 3. SOUS LE CAPOT 🔬` → explication technique approfondie
  - `## 4. CAS PRATIQUE` → scénario ESN narratif + analyse
  - `## 6. MÉMO FLASH` → liste synthétique
  - `## 5. QUIZ` → **non inclus** dans cette SPEC (placeholder uniquement)
- **Frontmatter existant** : ne pas modifier (id, slug, title, description, order, duration, audience, tags)

### Processing

**Étape A — Infrastructure de rendu MDX**

1. Installer `next-mdx-remote` dans `apps/web/`
2. Mettre à jour `lib/module-registry.ts` :
   - `getModuleBySlug(slug)` retourne `ModuleWithContent` : `{ ...ModuleMetadata, rawContent: string }`
   - `rawContent` = corps du fichier MDX après parsing `gray-matter` (champ `content`)
   - `getAllModules()` reste inchangé (retourne `ModuleMetadata[]` sans contenu)
3. Ajouter le type `ModuleWithContent` dans `packages/shared-types/src/module.ts` (à la suite de `ModuleMetadata` déjà défini dans ce fichier) et l'exporter depuis `packages/shared-types/index.ts`
4. Créer `components/mdx/mdx-components.tsx` — exports des composants MDX custom :
   - Mappings de base : `h1`, `h2`, `h3`, `p`, `ul`, `ol`, `li`, `strong`, `em`, `blockquote`, `hr`, `code`
   - Pas de composant custom : les encadrés "Ce qu'il ne faut PAS croire" sont rendus comme des `blockquote` natifs — stylisés automatiquement par `@tailwindcss/typography`
5. Mettre à jour `app/(learner)/modules/[slug]/page.tsx` :
   - Remplacer le div placeholder par `<MDXRemote source={module.rawContent} components={mdxComponents} />`
   - Importer `MDXRemote` depuis `next-mdx-remote/rsc`
   - Wrapper dans `<article>` avec classe Tailwind prose pour la lisibilité

**Étape B — Transposition du contenu (6 fichiers MDX)**

Pour chaque module, remplacer `{/* contenu à venir */}` par le contenu transposé depuis `formationIA.md` :

Structure MDX cible par module :
```mdx
## Accroche

[texte narratif section 1]

---

## Concepts clés

### [Nom du concept 1]

**Définition**
[...]

**Exemple ESN**
[...]

> **Ce qu'il ne faut pas croire**
> [...]

[répéter pour chaque concept]

---

## Sous le capot

[contenu technique section 3]

---

## Cas pratique

### Scénario : [titre]

[contenu section 4]

---

## Mémo flash

[liste section 6]

---

{/* SPEC-006 : composant Quiz ici */}
```

Règles de transposition :
- Conserver le sens et la structure exacte de `formationIA.md`
- Adapter la syntaxe Markdown vers MDX valide (pas de HTML brut non échappé)
- Les emojis (💼, 🔬) sont conservés dans le texte — ne pas les mettre en balises JSX
- Les italiques (`*...*`) et gras (`**...**`) conservés tels quels
- Les `{}` littéraux dans le texte doivent être échappés : `\{...\}`

### Output

- 6 fichiers MDX mis à jour dans `apps/web/content/modules/`
- `apps/web/lib/module-registry.ts` mis à jour
- `apps/web/components/mdx/mdx-components.tsx` créé
- `packages/shared-types/` mis à jour avec `ModuleWithContent`
- `apps/web/app/(learner)/modules/[slug]/page.tsx` mis à jour

### Cas limites

1. **Accolades dans le texte source** : `formationIA.md` contient des expressions comme `{/* contenu */}` — les accolades doivent être échappées en MDX pour éviter les erreurs de parsing JSX
2. **Retours à la ligne multiples** : certaines sections ont des sauts de ligne triple ou plus — les normaliser à double saut (= nouveau paragraphe MDX)
3. **Caractères spéciaux** : les `<` et `>` non-JSX dans le texte (ex : `<h1>`, explications techniques) doivent être échappés en `&lt;` / `&gt;`
4. **Module manquant** : `getModuleBySlug` retourne `null` si le slug n'existe pas — la page appelle `notFound()` (comportement existant à préserver)
5. **Build Turbopack** : `next-mdx-remote` doit être compatible avec Turbopack (`next dev --turbopack`) — vérifier à l'installation ; si incompatible, utiliser `next-mdx-remote/rsc` uniquement sans plugin next.config

---

## 3. Critères d'Acceptation

- [ ] Les 6 URL `/modules/{slug}` affichent leur contenu pédagogique (sections 1-4, 6) sans erreur
- [ ] Le rendu MDX affiche correctement : titres hiérarchisés, listes, gras, italique, citations blockquote
- [ ] La page `/modules/{slug}` ne contient aucun composant interactif de quiz (absence de `[data-testid="quiz"]` dans le DOM)
- [ ] La navigation prev/next entre modules est fonctionnelle et non régressée
- [ ] `pnpm lint` et `pnpm typecheck --filter web` passent sans erreur
- [ ] `pnpm test --filter web` passe (les tests module-registry existants ne sont pas cassés)
- [ ] Le titre `<h1>` visible dans le module provient du frontmatter (déjà rendu dans `page.tsx`), pas dupliqué depuis le MDX
---

## 4. Interface / API

```typescript
// packages/shared-types/src/module.ts
export interface ModuleWithContent extends ModuleMetadata {
  rawContent: string  // corps MDX brut (sans frontmatter)
}

// lib/module-registry.ts — nouvelle signature
export async function getModuleBySlug(slug: string): Promise<ModuleWithContent | null>

// components/mdx/mdx-components.tsx
export const mdxComponents: MDXComponents  // passé à <MDXRemote components={...} />
```

```tsx
// app/(learner)/modules/[slug]/page.tsx — usage
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/mdx/mdx-components"

// Dans le JSX :
<article className="prose prose-gray dark:prose-invert max-w-none">
  <MDXRemote source={module.rawContent} components={mdxComponents} />
</article>
```

---

## 5. Dépendances

- `next-mdx-remote` — à installer dans `apps/web/` (`pnpm --filter web add next-mdx-remote`)
- `@tailwindcss/typography` — compatible Tailwind v4 via `@plugin`.
  Installation : `pnpm --filter web add -D @tailwindcss/typography`
  Configuration : ajouter `@plugin "@tailwindcss/typography";` dans `apps/web/app/globals.css` après `@import "tailwindcss";`
- `packages/shared-types` — ajout de `ModuleWithContent`
- **SPEC-006** — fournira le composant `<Quiz>` qui remplacera le placeholder dans les MDX

---

## 6. Estimation Context Budget

**Contexte à injecter pour cette tâche :**

| Source | Contenu | Tokens estimés |
|--------|---------|----------------|
| AGENT-GUIDE condensé | Stack, conventions, patterns | ~500 |
| SPEC-005 (ce fichier) | Spécification complète | ~700 |
| `formationIA.md` sections prose (6 modules × 4 sections) | Contenu source | ~15 000 |
| `module-registry.ts` | Fichier à modifier | ~200 |
| `[slug]/page.tsx` | Fichier à modifier | ~150 |
| `shared-types` package | Types existants | ~100 |
| **Total estimé** | | **~16 650 tokens** |
| **Total ×1.7 (facteur correctif)** | | **~28 300 tokens** |

Budget sous le seuil de context rot (50K). Session unique possible.

---

## 7. Definition of Output Done (DoOD)

- [x] `pnpm --filter web add next-mdx-remote` exécuté et `package.json` mis à jour
- [x] `packages/shared-types/` exporte `ModuleWithContent`
- [x] `lib/module-registry.ts` — `getModuleBySlug` retourne `ModuleWithContent | null`
- [x] `components/mdx/mdx-components.tsx` créé avec mappings de base
- [x] `app/(learner)/modules/[slug]/page.tsx` rend le MDX via `<MDXRemote>`
- [x] 6 fichiers MDX peuplés avec les sections 1-4 et 6 depuis `formationIA.md`
- [x] Placeholder quiz (`{/* SPEC-006 : composant Quiz ici */}`) présent dans chaque MDX
- [x] `pnpm lint` passing
- [x] `pnpm typecheck --filter web` passing
- [x] `pnpm test --filter web` passing
- [x] SPEC mise à jour si écart durant l'implémentation (Drift Lock)
- [x] Gouvernance RGAA vérifiée : `<article>` avec structure de titres valide, pas de saut de niveau h1→h3
- [x] Gouvernance RGESN vérifiée : contenu MDX statique (SSR) — zéro JS additionnel côté client pour le rendu du texte
- [x] Gouvernance RGPD vérifiée : aucune donnée personnelle ni secret dans les fichiers MDX

---

## 8. Notes de Drift (Drift Lock)

**Date de Drift Lock** : 2026-04-27
**Statut** : 3 drifts intentionnels documentés — aucun drift problématique

### Drift A — `mdxComponents` non typé `MDXComponents`

**SPEC §4** : `export const mdxComponents: MDXComponents`
**Réel** : `export const mdxComponents = { ... }` (type inféré par TypeScript)
**Raison** : `mdx/types` n'est pas disponible avec `next-mdx-remote@6` sans installer séparément `@types/mdx`. L'ajout d'une dépendance dev pour un simple alias de type est disproportionné — TypeScript infère le type correctement, le build passe.
**Impact** : Nul en runtime. Amélioration possible future : ajouter `@types/mdx` si le besoin de typage explicite devient nécessaire.

### Drift B — Imports relatifs au lieu de `@/` aliases

**SPEC §4** : exemples avec `@/components/mdx/...`
**Réel** : imports relatifs `../../../../components/mdx/...`
**Raison** : L'alias `@/` n'est pas configuré dans `tsconfig.json` paths du projet. Tous les imports existants dans `page.tsx` utilisent déjà des chemins relatifs — la cohérence du codebase prime.
**Impact** : Nul. Pattern cohérent avec le reste du projet.

### Drift C — Composant `pre` ajouté (hors liste SPEC)

**SPEC §2** : liste des mappings : h1, h2, h3, p, ul, ol, li, strong, em, blockquote, hr, code
**Réel** : mappings ci-dessus + `pre`
**Raison** : Sans mapping `pre`, les blocs de code MDX (` ``` `) rendraient sans fond stylisé. Le `pre` est nécessaire pour une présentation correcte des exemples techniques dans le contenu.
**Impact** : Additif uniquement. Amélioration du rendu visuel.
