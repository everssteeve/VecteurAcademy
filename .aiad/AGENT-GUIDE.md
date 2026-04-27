# AGENT-GUIDE — VecteurAcademy

> Ce fichier est le **contexte permanent** de l'agent IA.
> Il est injecté dans CHAQUE session de développement.
> Le maintenir à jour est une responsabilité de l'Agents Engineer (AE).
> Framework : AIAD SDD Mode v1.3

---

## IDENTITÉ DU PROJET

**Nom** : VecteurAcademy
**Description** : Plateforme de formation AI Engineering pour consultants ESN — 6 modules thématiques, quiz interactifs, assistant RAG et suivi de progression.
**Domaine métier** : EdTech B2B — formation professionnelle continue
**Mission** : Former des consultants ESN capables de cadrer, concevoir et livrer un système IA en production.

---

## DOCUMENTATION DE RÉFÉRENCE

| Document | Chemin | Mode d'injection |
|----------|--------|-----------------|
| PRD | @.aiad/PRD.md | Cadrage uniquement |
| Architecture | @.aiad/ARCHITECTURE.md | Condensé permanent |
| SPEC active | @.aiad/specs/[SPEC-XXX].md | Par tâche uniquement |
| Index SPECs | @.aiad/specs/_index.md | Planification |
| Gouvernance | @.aiad/gouvernance/ | Permanent (Tier 1, veto) |

---

## STACK TECHNIQUE (Référence Rapide)

[Résumé de la stack — 10 lignes max. Reprend les éléments clés de ARCHITECTURE.md.]

---

## RÈGLES ABSOLUES

### TOUJOURS
- Valider les entrées avant tout traitement
- Synchroniser SPEC + code dans la même PR (Drift Lock)
- Ajouter un test pour chaque bug fix
- Vérifier le Human Authorship avant toute automatisation
- Mettre à jour les Lessons Learned en fin d'itération

### JAMAIS
- Committer sans lint passing
- Modifier le schéma DB sans migration versionnée
- Pusher des secrets dans git
- Merger sans code review (minimum 1 approval)
- Livrer sans mettre à jour la SPEC correspondante

---

## CONVENTIONS DE CODE

### Nommage
[Exemples concrets selon la stack du projet]

### Structure des composants
```
[Template d'un composant standard]
```

### Gestion des erreurs
```
[Pattern standard de gestion d'erreur]
```

---

## VOCABULAIRE MÉTIER

| Terme métier | Définition | Terme à éviter |
|--------------|------------|----------------|
| [Terme 1] | [Définition] | [Terme incorrect] |

---

## PATTERNS DE DÉVELOPPEMENT

### Pattern 1 — [Nom]
[Description + exemple de code]

### Pattern 2 — [Nom]
[Description + exemple de code]

---

## ANTI-PATTERNS

| Anti-pattern | Pourquoi éviter | Alternative |
|--------------|-----------------|-------------|
| [Anti-pattern 1] | [Raison] | [Solution] |

---

## LESSONS LEARNED

> Section mise à jour à chaque fin d'itération (commande `/aiad-retro`).
> Documentez ici les erreurs récurrentes de l'agent ET les corrections appliquées.

| Date | Erreur agent | Correction | Impact |
|------|-------------|------------|--------|
| 2026-04-27 | Playwright setup : `fileURLToPath(import.meta.url)` → `exports is not defined in ES module scope` | Utiliser un chemin relatif simple `"e2e/.auth/user.json"` dans le setup Playwright — pas de `__dirname` nécessaire | Bloquant E2E |
| 2026-04-27 | Sélecteur `page.locator('[role="alert"]')` — violation strict mode Playwright : Next.js ajoute son propre `__next-route-announcer__` avec `role="alert"` | Toujours filtrer : `page.getByRole("alert").filter({ hasText: "..." })` | Test faux-négatif → 1 itération corrective |
| 2026-04-27 | Build Turbopack + `next start` sur ancienne instance → chunks manquants (500) | Toujours `rm -rf .next` avant de relancer si un serveur existant tourne sur le même port | Bloquant serveur |

---

## HUMAN LEARNINGS

> Section v1.1 — Documentez ici les écarts entre l'intention humaine et la livraison.
> Ces learnings ne sont PAS des erreurs de l'agent — ce sont des défaillances de l'expression humaine.

| Date | Intention exprimée | Résultat obtenu | Apprentissage |
|------|--------------------|-----------------|---------------|
| 2026-04-27 | Page login sans JS requis pour la soumission (progressive enhancement) | `useActionState` (React 19) exige JS — la soumission ne fonctionne pas sans JS | Spécifier "sans JS" impose une architecture Server Component pur avec `<form action={serverAction}>` natif. Incompatible avec validation Zod client en même composant. Choisir explicitement entre progressive enhancement et DX React. |
| 2026-04-27 | `NEXTAUTH_URL` suffisant pour Auth.js v5 | Auth.js v5 requiert aussi `AUTH_URL` + `AUTH_TRUST_HOST=true` pour les environnements non-HTTPS | Auth.js v5 (next-auth@beta) a changé ses env vars : `AUTH_URL` remplace `NEXTAUTH_URL` (compat shim conservé). `AUTH_TRUST_HOST=true` obligatoire en développement local. À documenter dans .env.example dès l'installation. |
| 2026-04-27 | "Tests jest-axe" dans DoOD | Projet utilise Vitest + Playwright — jest-axe non installé, assertions équivalentes via Playwright | Aligner le DoOD avec le stack de test réel du projet. Si jest-axe est voulu, l'ajouter explicitement dans la SPEC des deps. Sinon, écrire "assertions d'accessibilité (Playwright ou jest-axe)". |
| 2026-04-27 | Sections AGENT-GUIDE (stack technique, nommage, patterns) peuplées avec des placeholders sur 4 SPECs | L'agent a dû aller chercher ARCHITECTURE.md à chaque session faute de condensé dans AGENT-GUIDE | L'AGENT-GUIDE est le contrat de contexte permanent — le peupler est un prérequis avant la première SPEC, pas une tâche optionnelle. Action : peupler avant l'itération 2. |
| 2026-04-27 | Estimations Context Budget systématiquement basses (~40% de l'estimé réel) | SPEC-002 : ~800 tokens estimés / ~1 800 réels. SPEC-004 : ~1 050 / ~1 700. | Appliquer un facteur multiplicatif ×1.7 sur les estimations initiales. Le budget réel dépasse toujours l'estimé car les fichiers source existants ne sont pas comptés en Gate. |
