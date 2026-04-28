# SPEC-007 — Quiz de fin de parcours (Certification)

**Intent parent** : INTENT-002
**Auteur** : Steeve Evers
**Date** : 2026-04-27
**Statut** : ready
**SQS** : 4/5 ⚠️ (réserve : mobile-nav ajouté au périmètre)

---

## 1. Contexte

L'évaluation finale couvre les 6 modules en 18 questions (3 par module), distinctes des quiz de fin de module. Elle attribue un niveau de certification parmi 4 paliers (AI Curious → AI Engineer). C'est une nouvelle feature absente de l'architecture actuelle. Elle est accessible via la sidebar et depuis le dashboard.

**Hors périmètre** : persistance du résultat de certification en base de données, envoi de certificat par email.

---

## 2. Comportement Attendu

### Input

- **Questions** : 18 QCM tirées de la section `# ÉVALUATION FINALE` de `.aiad/formationIA.md`
  - 3 questions par module (groupes : Q1-3, Q4-6, Q7-9, Q10-12, Q13-15, Q16-18)
  - Même format que `QuizQuestion` (SPEC-006) : question, 4 options A/B/C/D, correctAnswer, explanation
- **Niveaux de certification** (barème `formationIA.md`) :
  - 0–8 → 🔵 AI Curious
  - 9–13 → 🟡 AI Practitioner
  - 14–17 → 🟠 AI Engineer Junior
  - 18 → 🟢 AI Engineer

### Processing

**State machine :**
```typescript
type FinalQuizState =
  | { status: "answering"; currentQuestion: number; answers: string[] }
  | { status: "completed"; totalScore: number; answers: string[] }
```

**Flux UX :**
1. Page `/evaluation-finale` : en-tête avec titre + durée indicative (35 min) + bouton "Commencer"
2. État `answering` : une question à la fois, compteur "Question X / 18"
3. Navigation identique à SPEC-006 : Flèches ↑↓ entre options, Tab vers "Suivant" / "Terminer"
4. Après la 18ème réponse → état `completed`
5. État `completed` : affiche dans l'ordre —
   a. Score total (X / 18) + niveau de certification avec sa description
   b. Bilan par module : tableau 6 lignes (score X/3 par module + recommandation si < 2/3)
   c. Corrections détaillées : chaque question avec indicateur correct/incorrect + explication
6. Bouton "Recommencer" → réinitialise à l'état initial (page d'accueil de l'évaluation)

**Calcul bilan module :**
```
moduleScore[i] = answers[i*3..i*3+2].filter(correct).length  // 0, 1, 2 ou 3
```

### Output

- `apps/web/app/(learner)/evaluation-finale/page.tsx` — nouvelle page SSR (shell statique + composant client)
- `apps/web/components/quiz/final-quiz.tsx` — composant client (`"use client"`)
- `apps/web/components/layout/sidebar.tsx` — ajout du lien "Évaluation finale" en bas de la `<nav>`
- `apps/web/components/layout/mobile-nav.tsx` — même ajout (miroir structurel de `sidebar.tsx`)
- `packages/shared-types/src/quiz.ts` — ajout de `CertificationLevel`

### Cas limites

1. **Abandon en cours** : rechargement de page → état réinitialisé à l'accueil (pas de reprise — hors périmètre)
2. **Score 0/18** : affiche "AI Curious" normalement, aucun message bloquant
3. **Score 18/18** : message de succès "AI Engineer" avec description complète
4. **Sidebar sur la page évaluation** : le lien "Évaluation finale" affiche `aria-current="page"`
5. **`prefers-reduced-motion`** : aucune animation bloquante sur l'affichage du niveau certifié

---

## 3. Critères d'Acceptation

- [ ] La page `/evaluation-finale` est accessible depuis la sidebar (lien visible sur desktop) et depuis la mobile-nav (lien visible sur mobile)
- [ ] L'en-tête affiche le titre "Évaluation finale" et la durée "35 minutes"
- [ ] L'apprenant navigue question par question, le compteur affiche "Question X / 18"
- [ ] Le bouton "Suivant" / "Terminer" est désactivé si aucune option n'est sélectionnée
- [ ] Après la 18ème réponse, le score (X / 18) et le niveau de certification s'affichent
- [ ] Le bilan par module affiche un score X/3 pour chacun des 6 modules
- [ ] Le lien sidebar affiche `aria-current="page"` sur `/evaluation-finale`
- [ ] `pnpm lint` et `pnpm typecheck --filter web` passent sans erreur
- [ ] `pnpm test --filter web` passe (tests Vitest : calcul bilan module, attribution niveau)

---

## 4. Interface / API

```typescript
// packages/shared-types/src/quiz.ts — ajout
export interface CertificationLevel {
  label: string          // "AI Curious" | "AI Practitioner" | "AI Engineer Junior" | "AI Engineer"
  emoji: string          // "🔵" | "🟡" | "🟠" | "🟢"
  description: string
  minScore: number
  maxScore: number
}

// Fonction pure (testable en Vitest)
export function getCertificationLevel(score: number): CertificationLevel

// Bilan par module — calculé dans le composant
interface ModuleBilan {
  moduleTitle: string    // ex. "Module 1 — L'ère de l'AI Engineering"
  score: number          // 0–3
  retravaillerSi: string // recommandation si score < 2/3
}

// components/quiz/final-quiz.tsx
interface FinalQuizProps {
  questions: QuizQuestion[]  // 18 questions — même type que SPEC-006
}
export function FinalQuiz({ questions }: FinalQuizProps): React.JSX.Element
```

```tsx
// app/(learner)/evaluation-finale/page.tsx
// Les 18 questions sont inlinées comme données statiques dans ce fichier
// (même approche que les quiz de modules — pas d'import dynamique)
import { finalQuizQuestions } from "./questions"  // fichier co-localisé
import { FinalQuiz } from "@/components/quiz/final-quiz"

export default function EvaluationFinalePage() {
  return (
    <div>
      <h1>Évaluation finale — Certification AI Engineering ESN</h1>
      <FinalQuiz questions={finalQuizQuestions} />
    </div>
  )
}
```

> **Note** : les 18 questions sont dans un fichier co-localisé `questions.ts` (dans `app/(learner)/evaluation-finale/`) plutôt qu'inlinées dans le MDX — ce n'est pas une page MDX mais une page Next.js ordinaire.

---

## 5. Dépendances

- **SPEC-006** (prérequis) — fournit `QuizQuestion` dans shared-types (réutilisé sans modification)
- `packages/shared-types/src/quiz.ts` — ajout de `CertificationLevel` et `getCertificationLevel()`

---

## 6. Estimation Context Budget

| Source | Tokens estimés |
|--------|----------------|
| AGENT-GUIDE condensé | ~500 |
| SPEC-007 (ce fichier) | ~650 |
| `formationIA.md` section ÉVALUATION FINALE (18 questions + barème + bilan) | ~2 200 |
| `sidebar.tsx` (à modifier) | ~100 |
| `shared-types/src/quiz.ts` (existant, à étendre) | ~80 |
| **Total estimé** | **~3 530** |
| **Total ×1.7** | **~6 000 tokens** |

---

## 7. Definition of Output Done (DoOD)

- [ ] `packages/shared-types/src/quiz.ts` : `CertificationLevel` + `getCertificationLevel()` exportés
- [ ] `app/(learner)/evaluation-finale/questions.ts` créé avec les 18 questions
- [ ] `components/quiz/final-quiz.tsx` implémenté (`"use client"`, state machine 2 états)
- [ ] `app/(learner)/evaluation-finale/page.tsx` créé et accessible
- [ ] `components/layout/sidebar.tsx` : lien "Évaluation finale" ajouté sous la liste des modules
- [ ] `components/layout/mobile-nav.tsx` : même lien ajouté (avec `onClick={() => setIsOpen(false)}` pour fermer le panneau mobile)
- [ ] Tests Vitest : `getCertificationLevel` (0→AI Curious, 9→AI Practitioner, 14→AI Engineer Junior, 18→AI Engineer), calcul `moduleScore` par groupe de 3
- [ ] `pnpm lint` passing
- [ ] `pnpm typecheck --filter web` passing
- [ ] `pnpm test --filter web` passing
- [ ] SPEC mise à jour si écart durant l'implémentation (Drift Lock)
- [ ] Gouvernance RGAA vérifiée : `<h1>` unique, navigation clavier radio native (Flèches ↑↓), `role="status"` sur le niveau certifié, `aria-current="page"` sur lien sidebar actif
- [ ] Gouvernance RGESN vérifiée : page SSR statique, aucune dépendance externe ajoutée
