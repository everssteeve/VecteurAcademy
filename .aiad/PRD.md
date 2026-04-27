# PRD : Formation AI Engineering pour Consultants ESN

> Ce fichier est la source de vérité produit. Il est injecté en contexte agent lors des phases de cadrage uniquement.
> Mainteneur : Steeve (formateur principal)

## 1. Contexte et Problème

**Situation actuelle** : Les ESN (entreprises de services numériques) sont confrontées depuis 2023 à une demande croissante de leurs clients pour des projets d'IA générative — assistants métier, RAG, agents autonomes. Leurs consultants (développeurs, chefs de projet, architectes) n'ont pas les repères conceptuels ni les réflexes opérationnels pour cadrer, concevoir et livrer ces projets.

**Qui ressent le problème** : Les consultants ESN (junior à senior) qui se retrouvent face à des briefs IA sans formation structurée. Les directeurs commerciaux ESN qui perdent des appels d'offres face à des concurrents mieux positionnés. Les clients ESN qui subissent des projets IA mal cadrés, sur-promis et sous-livrés.

**Impact business** : Marchés capturés par des équipes de 3 personnes maîtrisant l'AI Engineering. Projets IA qui échouent non pas sur la technologie mais sur le flou de l'objectif. Consultants incapables de répondre à la question "votre IA peut-elle être raciste ?" devant un client.

---

## 2. North Star / Product Goal

Former des consultants ESN capables de cadrer, concevoir et livrer un système IA en production — de la sélection de modèle au monitoring — avec la posture d'un AI Engineer senior, pas d'un intégrateur qui branche des APIs.

---

## 3. Personas et Use Cases

| Persona | Besoin | Résultat attendu |
|---------|--------|------------------|
| Consultant senior ESN | Comprendre la discipline AI Engineering pour la vendre et la livrer | Cadrer un brief IA, choisir le bon profil, parler le langage du DSI |
| Développeur full-stack ESN | Passer de l'intégration superficielle à l'AI Engineering rigoureux | Concevoir un RAG, versionner les prompts, monitorer en production |
| Consultant junior ESN | Acquérir les bases pour ne pas être dépassé sur les missions IA | Distinguer Foundation Model / ML classique / LLM, structurer un prompt |
| Directeur commercial ESN | Différencier l'offre IA de l'ESN sur les appels d'offres | Proposer un pipeline d'évaluation de modèles, argumenter sur la souveraineté |

---

## 4. Outcome Criteria (Mesurables)

| Critère | Baseline | Cible | Méthode |
|---------|----------|-------|---------|
| Score quiz modules | — | ≥ 80 % de réussite par module | QCM 5 questions par module |
| Capacité à cadrer un brief | Niveau junior (accepte le brief sans priorisation) | Niveau senior (propose atelier de priorisation, identifie le bon profil) | Évaluation des cas pratiques |
| Maîtrise du vocabulaire AI Engineering | — | Utilisation correcte dans les contextes pratiques | Évaluation finale |
| Autonomie sur les 6 modules | Dépendance au formateur | Production d'un système IA minimal documenté | Projet final |

---

## 5. Périmètre

### In Scope
- 6 modules thématiques complets (AI Engineering, Foundation Models, Sélection de modèle, Prompt Engineering, RAG & Agents, Architecture & Production)
- Évaluation finale (projet intégrateur)
- Format double-formateur : Steeve (pédagogie & terrain) + Dr. Lena Voss (technique & fondamentaux)
- Structure pédagogique par module : Accroche narrative ESN → Concepts clés → Sous le capot → Cas pratique (option junior vs senior) → Quiz QCM 5 questions → Mémo flash
- Contexte ESN exclusif : tous les exemples sont ancrés dans des missions de conseil et d'intégration

### Out of Scope
- Formation ML Engineering (entraînement de modèles, PyTorch, MLOps)
- Formation Data Science (feature engineering, statistiques, datasets)
- Formation DevOps/Cloud (infrastructure GPU, Kubernetes)
- Formation grand public ou académique (pas de cas d'usage research)
- Certification officielle (pas de titre RNCP prévu à ce stade)

---

## 6. User Stories (Prioritaires)

```
US-001 | MUST   | Consultant ESN peut distinguer AI Engineering / ML Engineering / Full-Stack IA
                  pour orienter le recrutement et le staffing client → Outcome : 0 proposition hors profil

US-002 | MUST   | Consultant ESN peut expliquer les hallucinations et proposer une mitigation architecturale
                  pour crédibiliser l'ESN face à un incident client → Outcome : réponse structurée en moins de 3 min

US-003 | MUST   | AI Engineer ESN peut construire un pipeline d'évaluation de modèle sur un use case réel
                  pour gagner des appels d'offres techniques → Outcome : tableau comparatif documenté livrable au client

US-004 | MUST   | AI Engineer ESN peut concevoir un prompt de production (6 pratiques + versioning)
                  pour réduire les incidents en production → Outcome : prompt versionné, testé, documenté

US-005 | MUST   | AI Engineer ESN peut concevoir une architecture RAG adaptée au use case
                  pour ancrer les réponses dans les données client → Outcome : choix de chunking et stratégie de retrieval justifiés

US-006 | MUST   | AI Engineer ESN peut mettre en place un monitoring minimal en 48h
                  pour détecter les dérives qualitatives avant qu'elles deviennent des incidents → Outcome : 4 alertes actives

US-007 | SHOULD | Consultant ESN peut naviguer les contraintes de souveraineté (RGPD, hébergement UE)
                  pour ne pas créer de risques juridiques chez le client → Outcome : critère souveraineté dans tout workflow de sélection

US-008 | SHOULD | AI Engineer ESN peut concevoir un Human-in-the-loop sur les actions irréversibles d'un agent
                  pour déployer des systèmes agents en production dans des secteurs sensibles → Outcome : pattern de validation explicite

US-009 | COULD  | Consultant ESN peut présenter les enjeux de l'EU AI Act et du RGPD dans un contexte projet
                  pour anticiper les questions de gouvernance → Outcome : slide de risques réglementaires dans l'avant-vente
```

---

## 7. Contenu des 6 Modules

> **Source de vérité du contenu** : `formationIA.md` (racine du projet) contient l'intégralité des textes, concepts, cas pratiques, questions QCM et mémos flash pour les 6 modules et l'évaluation finale. Ce fichier est la référence exhaustive — le PRD n'en donne qu'un résumé de cadrage.

### Module 1 — L'ère de l'AI Engineering
Discipline AI Engineering, Foundation Models vs ML classique vs LLMs, 5 familles de cas d'usage ESN, 3 couches du stack IA, positionnement AI Engineer / ML Engineer / Full-Stack.

### Module 2 — Comprendre les Foundation Models
Données d'entraînement et biais, architecture Transformer et mécanisme d'attention, SFT et RLHF, température et sampling, outputs structurés, nature probabiliste et hallucinations.

### Module 3 — Évaluer et Choisir un Modèle
5 critères d'évaluation, workflow de sélection en 4 étapes, Build vs Buy vs Open Source, benchmarks publics et leurs limites, pipeline d'évaluation maison (evals).

### Module 4 — Prompt Engineering
Zero-shot vs few-shot, system prompt vs user prompt, gestion du contexte, 6 bonnes pratiques, prompt injection et jailbreaking, versioning et évaluation des prompts.

### Module 5 — RAG et Agents
Retrieval dense vs sparse vs hybride, chunking, architecture agent (LLM + outils + planification), failure modes des agents, Human-in-the-loop sur les actions irréversibles.

### Module 6 — Architecture & Mise en Production
Enrichissement de contexte, guardrails input/output, model router et AI gateway, réduction de latence (cache sémantique, streaming, optimisation contexte), monitoring et observabilité, collecte de feedback utilisateur.

---

## 8. Trade-offs et Décisions Clés

| Décision | Raison | Coût / Bénéfice |
|----------|--------|-----------------|
| Double-formateur Steeve + Dr. Lena Voss | Complémentarité pédagogie terrain (Steeve) et rigueur technique fondamentale (Lena) | Plus complexe à coordonner — mais couverture complète du spectre junior/senior et technique/business |
| Exemples exclusivement ESN | Les consultants apprennent mieux sur des situations qu'ils reconnaissent | Portée limitée aux ESN — pas réutilisable tel quel pour les équipes produit ou les start-ups |
| Format QCM 5 questions par module | Évaluation formative rapide, auto-corrective, applicable en synchrone | Ne mesure pas la capacité à concevoir (couverte par les cas pratiques) |
| Option junior vs option senior dans les cas pratiques | Montrer explicitement la progression de posture, pas seulement de compétence | Risque de caricaturer le junior — à doser avec soin |
| 6 modules sans formation ML Engineering | L'AI Engineering est une discipline distincte ; éviter la confusion de périmètre | Les apprenants qui veulent aller vers le finetuning ou le MLOps devront se former ailleurs |

---

## 9. Dépendances et Risques

**Dépendances externes** : Disponibilité de Dr. Lena Voss pour les sections "Sous le capot" de chaque module. Accès à des APIs LLM pour les ateliers pratiques (OpenAI, Anthropic, Mistral). Environnements de développement des apprenants.

**Risques** :
- Obsolescence rapide — les modèles et outils cités (GPT-4o, Claude, Mistral, LangChain) évoluent vite → Mitigation : utiliser les noms de modèles comme exemples de famille, pas comme références figées
- Hétérogénéité du niveau technique des apprenants → Mitigation : la structure junior/senior des cas pratiques permet de s'adapter en session
- Résistance au changement dans les ESN ("on fait de l'IA depuis 10 ans") → Mitigation : l'accroche narrative de chaque module ancre le besoin dans une situation de perte de marché concrète

---

## 10. Évolution Prévue (v2)

- Ateliers hands-on sur environnement réel (notebooks, APIs, déploiement)
- Module 7 : Gouvernance et conformité (EU AI Act, RGAA, RGESN, RGPD) — actuellement couvert en survol dans le module 6
- Certification interne ESN (validation des acquis par un projet client fictif complet)
- Version e-learning asynchrone (vidéos + quiz interactifs) pour les cohortes distribuées
