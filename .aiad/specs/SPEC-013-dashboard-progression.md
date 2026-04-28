# SPEC-013 — Dashboard de progression (quiz par module + tentatives évaluation finale)

**Intent parent** : INTENT-005
**Auteur** : Steeve Evers
**Date** : 2026-04-28
**Statut** : validation
**SQS** : 4/5 ⚠️

---

## 1. Contexte

La page dashboard (`apps/web/app/(learner)/dashboard/page.tsx`) affiche une grille de modules avec un statut textuel basique ("Non commencé", "En cours", "Terminé · X/Y"). Les apprenants ayant complété des modules ne voient pas leur score en pourcentage, et l'historique des tentatives à l'évaluation finale est totalement absent. Cette SPEC enrichit le dashboard avec deux ajouts : taux de quiz module en % et section historique des tentatives finales.

---

## 2. Comportement Attendu

### Input

- Session Auth.js v5 : `session.user.id` (UUID string)
- `getAllModules()` — registry dynamique, source de vérité des modules disponibles
- `GET ${NEXT_PUBLIC_API_URL}/progress?user_id=${session.user.id}` — retourne :
  ```json
  {
    "module_progress": [{ "module_id": "string", "completed_at": "datetime|null" }],
    "quiz_results": [{ "quiz_type": "module|final", "module_id": "string|null", "score": 0, "max_score": 0, "answered_at": "datetime" }]
  }
  ```
  *(résultats ordonnés par `answered_at DESC` côté API)*

### Processing

1. **Taux de complétion par module** : pour chaque module dont `completed_at !== null`, chercher le résultat `quiz_type === "module" && module_id === slug` dans `quiz_results` (premier match = le plus récent). Calculer `Math.round((score / max_score) * 100)`. Afficher `Terminé · X/Y (Z%)`.
2. **Tentatives évaluation finale** : filtrer `quiz_results` pour `quiz_type === "final"` → `finalAttempts`. Toutes les tentatives sont conservées (pas de dédoublonnage). Pour chaque tentative, appeler `getCertificationLevel(score)` depuis `@formations-ia/shared-types` pour obtenir le niveau et l'emoji.
3. **Mise à jour de l'interface locale** `QuizResultItem` : ajouter le champ `answered_at: string` (manquant dans l'implémentation actuelle malgré sa présence dans la réponse API).
4. **Affichage conditionnel section finale** : si `finalAttempts.length === 0` → message "Pas encore de tentative à l'évaluation finale.". Sinon → liste ordonnée (déjà DESC par API) avec date, score, niveau.

### Output

**Section "Mes modules"** (existante, modifiée) :
- Module non commencé : badge "Non commencé" (inchangé)
- Module en cours : badge "En cours" (inchangé)
- Module terminé sans quiz result : badge "Terminé"
- Module terminé avec quiz result : badge "Terminé · X/Y (Z%)"

**Section "Évaluation finale"** (nouvelle, sous la grille modules) :
- Titre de section : "Évaluation finale"
- Si aucune tentative : `<p>Pas encore de tentative à l'évaluation finale.</p>`
- Sinon : liste `<ul>` avec une `<li>` par tentative :
  - Date formatée `toLocaleDateString('fr-FR', { dateStyle: 'medium' })`
  - Score : `score/max_score`
  - Niveau : `{emoji} {label}` (ex. `🟢 AI Engineer`)

### Cas limites

1. **Aucune tentative finale** : section affiche le message "Pas encore de tentative à l'évaluation finale." — pas d'erreur, pas de tableau vide
2. **Plusieurs tentatives finale** : toutes affichées, ordonnées par date DESC (l'API garantit déjà l'ordre — pas de tri côté client)
3. **Module terminé sans quiz result** : `moduleProgress.completed_at !== null` mais aucune entrée dans `quiz_results` → afficher "Terminé" sans score ni pourcentage (pas de crash sur `undefined`)
4. **`session.user.id` absent** : le bloc `if (session?.user?.id)` empêche tout appel API — tous les modules affichent "Non commencé", section finale vide avec message
5. **API indisponible** : le `catch` existant absorbe l'erreur → dégradation gracieuse, affichage sans données de progression

---

## 3. Critères d'Acceptation

- [ ] Un module terminé avec quiz result affiche le score sous la forme `Terminé · X/Y (Z%)`
- [ ] Un module terminé sans quiz result affiche uniquement `Terminé` (pas de crash)
- [ ] La section "Évaluation finale" est visible sous la grille modules
- [ ] Si 0 tentative finale, le message "Pas encore de tentative à l'évaluation finale." est affiché
- [ ] Si ≥ 1 tentative finale, chaque entrée affiche date, score et niveau de certification avec emoji
- [ ] L'ajout d'un nouveau module MDX dans `content/modules/` fait apparaître automatiquement ce module dans le dashboard sans modification du code (registry dynamique)
- [ ] `pnpm --filter web build` passe sans erreur TypeScript
- [ ] `pnpm --filter web lint` passe (Biome)
- [ ] La section "Évaluation finale" est accessible : titre de section `<h2>`, liste sémantique `<ul>/<li>`, contrastes RGAA suffisants

---

## 4. Interface / API

### Mise à jour de l'interface locale (dashboard/page.tsx)

```ts
interface QuizResultItem {
  quiz_type: string
  module_id: string | null
  score: number
  max_score: number
  answered_at: string  // ← ajout (présent dans la réponse API, manquant dans le type actuel)
}
```

### Fonction utilitaire `getModuleStatus` (enrichie)

```ts
function getModuleStatus(slug: string): { label: string; score?: string } {
  const progress = moduleProgress.find((p) => p.module_id === slug)
  if (!progress) return { label: "Non commencé" }
  if (progress.completed_at) {
    const result = quizResults.find((r) => r.quiz_type === "module" && r.module_id === slug)
    if (result) {
      const pct = Math.round((result.score / result.max_score) * 100)
      return { label: "Terminé", score: `${result.score}/${result.max_score} (${pct}%)` }
    }
    return { label: "Terminé" }
  }
  return { label: "En cours" }
}
```

### Calcul des tentatives finales

```ts
import { getCertificationLevel } from "@formations-ia/shared-types"

const finalAttempts = quizResults.filter((r) => r.quiz_type === "final")
```

### Rendu section "Évaluation finale"

```tsx
<section aria-labelledby="final-quiz-heading" className="mt-10">
  <h2
    id="final-quiz-heading"
    className="text-xl font-bold text-gray-900 dark:text-white mb-4"
  >
    Évaluation finale
  </h2>
  {finalAttempts.length === 0 ? (
    <p className="text-gray-500 dark:text-gray-400">
      Pas encore de tentative à l&apos;évaluation finale.
    </p>
  ) : (
    <ul className="space-y-2">
      {finalAttempts.map((attempt) => {
        const level = getCertificationLevel(attempt.score)
        const date = new Date(attempt.answered_at).toLocaleDateString("fr-FR", {
          dateStyle: "medium",
        })
        return (
          <li
            key={attempt.answered_at}
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[7rem]">
              {date}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {attempt.score}/{attempt.max_score}
            </span>
            <span className="text-sm">
              {level.emoji} {level.label}
            </span>
          </li>
        )
      })}
    </ul>
  )}
</section>
```

---

## 5. Dépendances

- `apps/web/app/(learner)/dashboard/page.tsx` — fichier existant, modification (interface + rendu)
- `@formations-ia/shared-types` — `getCertificationLevel` déjà exporté depuis `packages/shared-types/src/quiz.ts`
- `GET /progress` endpoint (SPEC-010) — déjà en production, aucune modification requise
- `getAllModules()` (SPEC-002) — registry dynamique déjà actif, aucune modification requise

---

## 6. Estimation Context Budget

| Fichier | Tokens estimés |
|---------|---------------|
| AGENT-GUIDE (condensé) | ~400 |
| SPEC-013 (ce fichier) | ~450 |
| `dashboard/page.tsx` (existant, 107 lignes) | ~200 |
| `packages/shared-types/src/quiz.ts` (getCertificationLevel) | ~120 |
| **Total estimé** | **~1 170** |
| **Total réel projeté (×1.7)** | **~1 990** |

---

## 7. Definition of Output Done (DoOD)

- [ ] Interface `QuizResultItem` mise à jour avec le champ `answered_at: string`
- [ ] `getModuleStatus` enrichi : affiche `X/Y (Z%)` quand quiz result disponible, `Terminé` seul sinon
- [ ] Section "Évaluation finale" ajoutée sous la grille modules
- [ ] Import `getCertificationLevel` depuis `@formations-ia/shared-types` fonctionnel
- [ ] `pnpm --filter web build` passe sans erreur TypeScript
- [ ] `pnpm --filter web lint` passe (Biome)
- [ ] Test Playwright : mock `GET /progress` via `page.route()` avec 1 module terminé (`quiz_type=module`, `score=8`, `max_score=10`) → badge du module contient `(80%)`
- [ ] Test Playwright : mock `GET /progress` avec `quiz_results=[]` → section "Évaluation finale" affiche "Pas encore de tentative à l'évaluation finale."
- [ ] Test Playwright : mock `GET /progress` avec 1 tentative finale (`score=14`, `max_score=18`) → liste affiche `14/18` et `🟠 AI Engineer Junior`
- [ ] Accessibilité : section `<section aria-labelledby>` + `<h2>` + liste sémantique (assertions Playwright `getByRole`)
- [ ] RGESN : 1 seul appel `GET /progress` par chargement de page (pas de refetch client)
- [ ] RGPD : seul `session.user.id` transmis à l'API (aucune donnée tiers)
- [ ] SPEC mise à jour si écart constaté (Drift Lock)
