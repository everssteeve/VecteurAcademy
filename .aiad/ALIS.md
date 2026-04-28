# ALIS — Amélioration du Logiciel et de l'Infrastructure SDD

> Ce fichier recense les anomalies et améliorations identifiées sur le framework SDD Mode / AIAD.
> Il n'est pas un backlog de fonctionnalités produit — il concerne **le cycle de développement lui-même**.
> Les entrées sont résolues en modifiant les skills, l'AGENT-GUIDE, ou la documentation AIAD.

## Format

```
### ALIS-NNN — [Titre court]

**Détecté le** : [Date]
**Par** : [Auteur]
**Sévérité** : critique | majeur | mineur
**Statut** : ouvert | en-cours | résolu

**Constat** : [Description de l'anomalie ou de l'amélioration souhaitée]
**Impact** : [Ce qui se passe sans la correction]
**Action proposée** : [Ce qu'il faut modifier dans le framework]
**Résolution** : [Quand résolu — lien vers commit ou artefact modifié]
```

---

<!-- Les plus récentes en haut -->

### ALIS-003 — Persistance des logs d'échanges des commandes AIAD rituelles

**Détecté le** : 2026-04-28
**Par** : Steeve Evers
**Sévérité** : majeur
**Statut** : ouvert

**Constat** : Les échanges et décisions produits lors des commandes AIAD rituelles (`/aiad-retro`, `/sdd-gate`, `/sdd-drift-check`, `/aiad-intention`, etc.) ne sont pas persistés. Chaque invocation repart de zéro sans historique des décisions prises lors des cycles précédents.

**Impact** : Perte du log décisionnel entre les itérations. Impossible de retracer pourquoi une décision a été prise lors d'une rétro ou d'un gate sans fouiller l'historique git. La mémoire du processus dépend de la mémoire humaine.

**Action proposée** :
- Créer un répertoire `.aiad/logs/` pour stocker les comptes-rendus structurés des rituels AIAD.
- Modifier chaque skill rituel (retro, gate, drift-check, intention) pour produire un fichier log horodaté au format `YYYY-MM-DD-[commande]-[ref].md` à la fin de chaque invocation.
- Ces logs ne sont pas des artefacts SDD (pas dans les index) — ce sont des traces d'audit du processus.

---

### ALIS-002 — AGENT-GUIDE doit être peuplé en phase de cadrage, au même titre que PRD et ARCHITECTURE

**Détecté le** : 2026-04-28
**Par** : Steeve Evers
**Sévérité** : majeur
**Statut** : ouvert

**Constat** : Le skill `/sdd-init` génère PRD, ARCHITECTURE et AGENT-GUIDE, mais l'AGENT-GUIDE est livré avec des placeholders (stack, nommage, patterns) alors que PRD et ARCHITECTURE sont immédiatement opérationnels. En pratique, l'AGENT-GUIDE n'est peuplé qu'après les premières SPECs, une fois que la stack technique est connue.

**Impact** : L'agent n'a pas de contexte permanent dès la première session. Il doit aller chercher ARCHITECTURE.md à chaque itération faute de condensé dans l'AGENT-GUIDE, ce qui augmente le budget de contexte inutilement. Ce problème a été observé sur les SPEC-001 à SPEC-004 de VecteurAcademy (Human Learning 2026-04-27).

**Action proposée** :
- Modifier le skill `/sdd-init` pour produire un AGENT-GUIDE pré-peuplé dès le cadrage, en extrayant les éléments clés de l'ARCHITECTURE (stack, nommage, patterns, anti-patterns) sous forme condensée.
- Ajouter une étape explicite "peupler l'AGENT-GUIDE" dans la checklist de cadrage de `/sdd-init`, bloquante avant la première SPEC.
- Documenter la règle dans CLAUDE.md / AGENT-GUIDE : "L'AGENT-GUIDE est un prérequis avant la première SPEC, pas une tâche optionnelle en cours d'itération."

---

### ALIS-001 — Archivage automatique des Intent Statements au statut `livré`

**Détecté le** : 2026-04-28
**Par** : Steeve Evers
**Sévérité** : mineur
**Statut** : ouvert

**Constat** : Lorsqu'un Intent Statement passe au statut `livré` (toutes ses SPECs liées sont `done`), il n'est pas automatiquement déplacé dans le répertoire `intents/archive/`. Le statut "archivé" existe dans l'index mais aucun mécanisme ni aucune commande du cycle SDD ne déclenche l'archivage.

**Impact** : Les intents livrés restent dans le répertoire actif, polluant le contexte de travail et rendant difficile la distinction entre intents en cours et intents clos. L'archivage est laissé à l'initiative manuelle du PE.

**Action proposée** : 
- Modifier le skill `/sdd-drift-check` (ou créer une étape dédiée) pour détecter les intents dont toutes les SPECs liées sont `done` et proposer leur archivage automatique.
- Alternativement, ajouter cette vérification dans le skill `/aiad-health` comme anomalie reportée.
- Documenter dans AGENT-GUIDE.md la règle : "tout intent `livré` doit être déplacé dans `intents/archive/` lors du Drift Lock de la dernière SPEC liée".
