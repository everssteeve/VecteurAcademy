# SPEC-006 — Composant Quiz de fin de module

**Intent parent** : INTENT-002
**Auteur** : Steeve Evers
**Date** : 2026-04-27
**Statut** : done
**SQS** : 4/5 ⚠️ (réserve : navigation clavier radio corrigée)

---

## 1. Contexte

Chaque module MDX se termine par 5 questions QCM tirées de `formationIA.md`. SPEC-005 laisse un placeholder `{/* SPEC-006 : composant Quiz ici */}` dans chaque fichier MDX. Cette SPEC couvre : (a) le type `QuizQuestion` en shared-types, (b) le composant React interactif `<Quiz>`, (c) son intégration dans `mdx-components.tsx`, et (d) le remplacement du placeholder par `<Quiz questions={[...]} />` avec les données réelles dans les 6 MDX.

**Hors périmètre** : persistance du score en base de données (API FastAPI) — le composant est purement client-side pour cette SPEC.

---

## 2. Comportement Attendu

### Input

- **Quiz data** : prop `questions: QuizQuestion[]` — 5 questions par module, données inlinées dans le MDX
- **Format source** : section `## 5. QUIZ` de chaque module dans `.aiad/formationIA.md`
  - Question text, 4 options (A/B/C/D), réponse correcte (lettre), explication

### Processing

**State machine** (2 états, conforme ARCHITECTURE.md) :

```typescript
type QuizState =
  | { status: "answering"; currentQuestion: number; answers: string[] }
  | { status: "completed"; score: number; answers: string[] }
```

**Flux UX** :
1. État initial : `answering`, `currentQuestion: 0`, `answers: []`
2. L'apprenant sélectionne une option via radio button → stockée dans `answers`
3. Clic "Suivant" (questions 1-4) ou "Terminer le quiz" (question 5) → avance
4. Après la 5ème réponse → transition vers `completed`
5. État `completed` : affiche score (X/5), puis chaque question avec correction couleur + explication
6. Bouton "Recommencer" → réinitialise à l'état initial

**Règles** :
- Le bouton "Suivant" / "Terminer" est désactivé (`disabled`) tant qu'aucune option n'est sélectionnée pour la question courante
- Une fois l'état `completed` atteint, les réponses ne sont plus modifiables

### Output

- `apps/web/components/quiz/quiz.tsx` — composant React client (`"use client"`)
- `packages/shared-types/src/quiz.ts` — type `QuizQuestion`
- `packages/shared-types/index.ts` — export du nouveau type
- `apps/web/components/mdx/mdx-components.tsx` — ajout de `Quiz` dans le map
- `apps/web/content/modules/*.mdx` (6 fichiers) — placeholder remplacé par `<Quiz questions={[...]} />`

### Cas limites

1. **Aucune réponse sélectionnée** : le bouton "Suivant" reste `disabled` — l'apprenant ne peut pas avancer sans avoir répondu
2. **Score 0/5** : affiché normalement, pas de message d'erreur bloquant — encouragement neutre
3. **Score 5/5** : message de succès distinct (ex. "Parfait !")
4. **Rechargement de page** : l'état est réinitialisé (pas de persistance localStorage dans cette SPEC)
5. **`prefers-reduced-motion`** : aucune transition ni animation ne bloque l'accès au contenu

---

## 3. Critères d'Acceptation

- [ ] Le composant `<Quiz>` est visible sur chaque page `/modules/{slug}` après la section Mémo flash
- [ ] L'apprenant peut naviguer question par question et voir sa progression (ex. "Question 2 / 5")
- [ ] Le bouton "Suivant" / "Terminer" est désactivé si aucune option n'est sélectionnée (`[disabled]` dans le DOM)
- [ ] Après la 5ème réponse, le score s'affiche (X/5) avec les corrections et explications pour chaque question
- [ ] Le bouton "Recommencer" réinitialise le quiz à la question 1
- [ ] Navigation clavier complète : Tab pour entrer dans le groupe radio, Flèches ↑↓ pour naviguer entre les options, Tab pour atteindre "Suivant" (comportement natif `<input type="radio">` dans `<fieldset>`)
- [ ] `pnpm lint` et `pnpm typecheck --filter web` passent sans erreur
- [ ] `pnpm test --filter web` passe (tests Vitest sur la logique de score)

---

## 4. Interface / API

```typescript
// packages/shared-types/src/quiz.ts
export interface QuizQuestion {
  id: string
  question: string
  options: { label: string; text: string }[]  // label = "A" | "B" | "C" | "D"
  correctAnswer: string
  explanation: string
}

// components/quiz/quiz.tsx
interface QuizProps {
  questions: QuizQuestion[]
}
export function Quiz({ questions }: QuizProps): React.JSX.Element
```

```tsx
// Usage dans les fichiers MDX (exemple module 01)
<Quiz
  questions={[
    {
      id: "q1",
      question: "Un AI Engineer travaille principalement sur :",
      options: [
        { label: "A", text: "L'entraînement de modèles de machine learning à partir de données brutes" },
        { label: "B", text: "L'orchestration de modèles pré-entraînés pour répondre à des besoins métier" },
        { label: "C", text: "Le développement d'interfaces utilisateur connectées à des APIs tierces" },
        { label: "D", text: "La conception d'architectures cloud pour héberger des modèles IA" }
      ],
      correctAnswer: "B",
      explanation: "L'AI Engineering se distingue du ML Engineering précisément parce qu'il ne part pas de la donnée brute pour créer un modèle — il part du modèle existant pour créer un système."
    }
  ]}
/>
```

**Structure HTML cible (état answering) :**
```html
<section data-testid="quiz" aria-label="Quiz de fin de module">
  <p aria-live="polite">Question 1 / 5</p>
  <fieldset>
    <legend>[texte de la question]</legend>
    <label><input type="radio" name="q1" value="A" /> [texte A]</label>
    <label><input type="radio" name="q1" value="B" /> [texte B]</label>
    ...
  </fieldset>
  <button type="button" disabled>Suivant</button>
</section>
```

**Structure HTML cible (état completed) :**
```html
<section data-testid="quiz" aria-label="Quiz de fin de module">
  <p role="status">Score : 3 / 5</p>
  <div aria-live="polite">
    <!-- Pour chaque question : indicateur correct/incorrect + explication -->
  </div>
  <button type="button">Recommencer</button>
</section>
```

---

## 5. Dépendances

- **SPEC-005** (prérequis) — fournit `mdx-components.tsx` où `Quiz` sera ajouté + les 6 MDX avec le placeholder
- `packages/shared-types` — ajout de `QuizQuestion` (ne pas confondre avec `QuizResult` déjà existant pour l'API)

---

## 6. Estimation Context Budget

| Source | Tokens estimés |
|--------|----------------|
| AGENT-GUIDE condensé | ~500 |
| SPEC-006 (ce fichier) | ~600 |
| `mdx-components.tsx` (SPEC-005, à modifier) | ~100 |
| `shared-types/index.ts` + `src/quiz.ts` | ~80 |
| `formationIA.md` sections quiz (6 × section 5) | ~3 000 |
| **Total estimé** | **~4 280** |
| **Total ×1.7** | **~7 300 tokens** |

Budget très sous le seuil. Session unique courte.

---

## 7. Definition of Output Done (DoOD)

- [x] `packages/shared-types/src/quiz.ts` créé avec `QuizQuestion`
- [x] `packages/shared-types/index.ts` exporte `QuizQuestion`
- [x] `components/quiz/quiz.tsx` implémenté (`"use client"`, state machine 2 états)
- [x] `components/mdx/mdx-components.tsx` contient `Quiz` dans le map de composants
- [x] 6 fichiers MDX : placeholder remplacé par `<Quiz questions={[...]} />` avec données réelles
- [x] Tests Vitest : calcul du score (0/5, 3/5, 5/5), état disabled sur bouton sans sélection — 21/21
- [x] `pnpm lint` passing
- [x] `pnpm typecheck --filter web` passing
- [x] `pnpm test --filter web` passing
- [x] SPEC mise à jour si écart durant l'implémentation (Drift Lock)
- [x] Gouvernance RGAA vérifiée : `fieldset`+`legend` par question, `<output aria-live="polite">` sur le score, navigation clavier radio native (Tab pour entrer, Flèches ↑↓ entre options, Tab vers bouton), assertions d'accessibilité Playwright (`getByRole`, `toHaveAttribute`, `aria-*`)
- [x] Gouvernance RGESN vérifiée : aucune dépendance externe ajoutée — composant React pur

---

## 8. Notes de Drift Lock (2026-04-28)

**Statut** : aucun drift — implémentation conforme à la SPEC
