# SPEC-011 — InstructorBadge component + migration MDX

**Intent parent** : INTENT-004
**Auteur** : Steeve Evers
**Date** : 2026-04-28
**Statut** : done
**SQS** : 4/5 ⚠️ — Gate ouverte avec réserve (testabilité : ajouter assertion Playwright `getByRole('img', { name: 'Steeve Evers' })` sur `/modules/ai-engineering`)

---

## 1. Contexte

Les 6 modules MDX utilisent le marqueur textuel `💼 **Steeve**` pour signaler la prise de parole d'un formateur. Les photos officielles des deux formateurs (Steeve Evers et Dr Lena Voss) sont disponibles. Cette SPEC remplace le marqueur texte par un composant visuel `InstructorBadge` — avatar photo + nom — enregistré dans `mdx-components.tsx` pour être utilisable directement dans les fichiers MDX.

---

## 2. Comportement Attendu

### Input

- Composant JSX `<InstructorBadge name="Steeve Evers" />` ou `<InstructorBadge name="Dr Lena Voss" />` dans un fichier MDX
- Images statiques dans `apps/web/public/instructors/` :
  - `steeve-evers.png` (copie de `~/Downloads/Gemini_Generated_Image_hq5e9hhq5e9hhq5e.png`)
  - `dr-lena-voss.png` (copie de `~/Downloads/Gemini_Generated_Image_nvo3zznvo3zznvo3.png`)

### Processing

1. Le composant reçoit `name` (union littérale typée)
2. Il résout les métadonnées du formateur via un mapping statique interne :
   ```
   "Steeve Evers"  → { src: "/instructors/steeve-evers.png",  role: "Formateur" }
   "Dr Lena Voss"  → { src: "/instructors/dr-lena-voss.png",  role: "Formatrice" }
   ```
3. Il rend un bloc inline : avatar rond (56×56 px) + nom en gras + rôle en sous-titre

### Output

HTML rendu :
```html
<div class="instructor-badge flex items-center gap-3 my-4 ...">
  <img src="/instructors/steeve-evers.png" alt="Steeve Evers" width="56" height="56" class="rounded-full object-cover" />
  <div>
    <p class="font-semibold text-sm">Steeve Evers</p>
    <p class="text-xs text-gray-500">Formateur</p>
  </div>
</div>
```

### Cas limites

1. **`name` inconnu** : TypeScript strict bloque à la compilation — pas de cas runtime possible (union littérale)
2. **Image absente côté serveur** : Next.js `<Image>` affiche l'`alt` ; aucun crash
3. **Mode sombre** : textes secondaires lisibles en `dark:text-gray-400` (contraste RGAA AA)
4. **Viewport mobile < 320px** : avatar reste fixe à 56px, texte wraps normalement — pas de débordement
5. **Rendu sans JavaScript** : Next.js `<Image>` fonctionne en SSR pur — composant visible même sans JS client

---

## 3. Critères d'Acceptation

- [x] `<InstructorBadge name="Steeve Evers" />` affiche la photo de Steeve Evers avec son nom
- [x] `<InstructorBadge name="Dr Lena Voss" />` affiche la photo de Dr Lena Voss avec son nom
- [x] Les 24 occurrences de `💼 **Steeve**` dans les 6 MDX sont remplacées par `<InstructorBadge name="Steeve Evers" />`
- [x] Le composant est enregistré dans `mdxComponents` (`apps/web/components/mdx/mdx-components.tsx`)
- [x] TypeScript compile sans erreur (`pnpm --filter web build` passe)
- [x] Lint Biome passe (`pnpm --filter web lint`)
- [x] L'image `alt` est le nom complet du formateur (RGAA 1.1)
- [x] Next.js `<Image>` est utilisé avec `width={56}` et `height={56}` déclarés (RGESN)

---

## 4. Interface / API

```tsx
// apps/web/components/mdx/instructor-badge.tsx

type InstructorName = "Steeve Evers" | "Dr Lena Voss"

interface InstructorBadgeProps {
  name: InstructorName
}

export function InstructorBadge({ name }: InstructorBadgeProps): React.JSX.Element
```

Mapping interne (non exporté) :
```tsx
const INSTRUCTORS: Record<InstructorName, { src: string; role: string }> = {
  "Steeve Evers": { src: "/instructors/steeve-evers.png", role: "Formateur" },
  "Dr Lena Voss": { src: "/instructors/dr-lena-voss.png", role: "Formatrice" },
}
```

Enregistrement dans `mdxComponents` :
```tsx
// apps/web/components/mdx/mdx-components.tsx
import { InstructorBadge } from "./instructor-badge"

export const mdxComponents = {
  InstructorBadge,
  // ... composants existants
}
```

---

## 5. Dépendances

- `next/image` (disponible via Next.js 15 — aucune installation requise)
- `apps/web/components/mdx/mdx-components.tsx` — fichier à modifier pour enregistrer le composant
- 6 fichiers MDX dans `apps/web/content/modules/` — à migrer (remplacement textuel)
- Répertoire `apps/web/public/instructors/` — à créer avec les 2 images

---

## 6. Estimation Context Budget

**Contexte à injecter pour cette tâche :**

| Fichier | Tokens estimés |
|---------|---------------|
| AGENT-GUIDE (condensé) | ~400 |
| SPEC-011 (ce fichier) | ~400 |
| `mdx-components.tsx` (84 lignes) | ~130 |
| `instructor-badge.tsx` (nouveau) | 0 |
| 6 fichiers MDX (diffs ciblés uniquement) | ~300 |
| **Total estimé** | **~1 230** |
| **Total réel projeté (×1.7)** | **~2 100** |

---

## 7. Definition of Output Done (DoOD)

- [x] `apps/web/public/instructors/steeve-evers.png` présent
- [x] `apps/web/public/instructors/dr-lena-voss.png` présent
- [x] `apps/web/components/mdx/instructor-badge.tsx` créé
- [x] `InstructorBadge` enregistré dans `mdxComponents`
- [x] 24 occurrences de `💼 **Steeve**` remplacées dans les 6 MDX (4 par fichier)
- [x] 6 occurrences de `🔬 **Dr. Lena Voss**` remplacées dans les 6 MDX (1 par fichier) — *omis dans le DoOD initial, corrigé post-livraison*
- [x] `pnpm --filter web build` passe sans erreur TypeScript
- [x] `pnpm --filter web lint` passe (Biome)
- [x] Vérification visuelle : badges Steeve Evers (×4) et Dr Lena Voss (×1) visibles sur `/modules/ai-engineering` en dev
- [x] Test Playwright : `getByRole('img', { name: 'Steeve Evers' })` ×4 et `getByRole('img', { name: 'Dr Lena Voss' })` ×1 sur `/modules/ai-engineering`
- [x] RGAA : `alt` = nom complet du formateur sur chaque `<Image>`
- [x] RGESN : `width`/`height` déclarés sur chaque `<Image>`, pas d'image en double résolution inutile
- [x] SPEC mise à jour (Drift Lock) — écart corrigé : marqueurs Dr Lena Voss omis dans le DoOD initial
