# ARCHITECTURE — VecteurAcademy

> Ce fichier est le contexte technique permanent. Un résumé condensé (max 500 tokens) est injecté dans chaque session agent.
> Mainteneur : Steeve

---

## 1. Principes Architecturaux

1. **Content-as-code** : le contenu des modules est versionné en MDX dans git — source de vérité unique, déployable sans base de données de contenu.
2. **Découplage strict** : frontend (Next.js), API (FastAPI), IA (LLM gateway) sont des services indépendants communicant via HTTP — chaque couche est remplaçable.
3. **AI layer extractible** : le composant LLM (assistant d'apprentissage) est isolé derrière une gateway — changer de modèle ne touche pas le reste du code.
4. **Progressive enhancement** : la plateforme fonctionne sans IA (contenu statique + quiz) ; l'assistant IA est un enrichissement facultatif, jamais un chemin critique.
5. **Opérabilité dès le jour 1** : monitoring, logs structurés et alertes sont intégrés avant le premier déploiement en production — pas ajoutés après un incident.

---

## 2. Vue d'Ensemble

```
Apprenant (navigateur)
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 15)                  │
│  ┌──────────────┐  ┌───────────┐  ┌───────────────────┐ │
│  │ Module viewer│  │Quiz engine│  │Dashboard progrès  │ │
│  │   (MDX SSR)  │  │(client)   │  │(server component) │ │
│  └──────────────┘  └─────┬─────┘  └────────┬──────────┘ │
└────────────────────────────┼───────────────┼────────────┘
                             │ REST/JSON      │
                             ▼               ▼
┌─────────────────────────────────────────────────────────┐
│                   API (FastAPI / Python)                 │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │ Auth / Users │  │  Progress  │  │  Quiz scoring    │ │
│  │  (JWT)       │  │  (CRUD)    │  │  + history       │ │
│  └──────────────┘  └────────────┘  └──────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │               AI Service                         │  │
│  │  ┌─────────────┐   ┌──────────────────────────┐  │  │
│  │  │  RAG Engine │   │  LiteLLM Gateway         │  │  │
│  │  │  (pgvector) │──▶│  (Claude / Mistral / ...)│  │  │
│  │  └─────────────┘   └──────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   PostgreSQL 16 + pgvector               │
│   users · sessions · progress · quiz_results · chunks   │
└─────────────────────────────────────────────────────────┘

Contenu (git)
┌──────────────────────────┐
│  /content/modules/       │
│    01-ai-engineering.mdx │
│    02-foundation-...mdx  │
│    ...                   │
└──────────────────────────┘
```

---

## 3. Stack Technique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Frontend runtime** | Next.js 15 (App Router) | Server Components pour le rendu MDX, streaming natif, déployable sur Vercel |
| **Language frontend** | TypeScript strict | Détection d'erreurs à la compilation, cohérence sur le long terme |
| **Style** | Tailwind CSS v4 | Productivité, dark mode natif, zéro runtime CSS |
| **Linter/formatter** | Biome | Remplace ESLint + Prettier en une seule dépendance, rapide |
| **Package manager** | pnpm | Monorepo-ready, hoisting contrôlé |
| **Backend runtime** | Python 3.12 + uv | Cohérence avec les outils IA (LangChain, etc.), uv pour la gestion de deps |
| **Backend framework** | FastAPI | Async natif, OpenAPI auto-généré, performant |
| **Auth** | Auth.js (NextAuth v5) | JWT côté frontend, session verifiable par l'API via un shared secret |
| **Base de données** | PostgreSQL 16 + pgvector | Données relationnelles (users, progress) + embeddings (RAG) dans la même instance |
| **ORM** | SQLAlchemy 2 + Alembic | Migrations versionnées, typage natif Python |
| **LLM Gateway** | LiteLLM | Abstraction multi-provider (Claude, Mistral, OpenAI), routing et fallback |
| **Embeddings** | text-embedding-3-small (OpenAI) ou mistral-embed | Petit, peu coûteux, suffisant pour la taille du corpus |
| **Content** | MDX 3 | Markdown + composants React — formateurs peuvent éditer sans toucher au code |
| **Tests frontend** | Vitest + Playwright | Unitaires rapides + E2E sur les parcours critiques (quiz, progression) |
| **Tests backend** | pytest + httpx | Tests async natifs FastAPI |
| **Monitoring** | Langfuse (open source) | Traces LLM, coûts, qualité — déployable self-hosted |
| **Infra dev** | Docker Compose | PostgreSQL + API + Langfuse en local sans dépendance cloud |
| **Infra prod** | Vercel (frontend) + Railway (API + DB) | Déploiement simple, pricing adapté à un volume de formation |

---

## 4. Structure du Projet

```
.
├── .aiad/                        ← Artefacts SDD (PRD, specs, intents)
├── .claude/commands/             ← Commandes slash AIAD
├── apps/
│   ├── web/                      ← Next.js 15 frontend
│   │   ├── app/
│   │   │   ├── (auth)/           ← Login / register
│   │   │   ├── (learner)/
│   │   │   │   ├── dashboard/    ← Progression globale
│   │   │   │   ├── modules/
│   │   │   │   │   └── [slug]/   ← Rendu MDX + navigation
│   │   │   │   └── quiz/
│   │   │   │       └── [moduleId]/ ← Engine quiz
│   │   │   └── api/              ← Route handlers (proxy vers API ou Auth.js)
│   │   ├── components/
│   │   │   ├── mdx/              ← Composants injectés dans les MDX
│   │   │   ├── quiz/             ← QuizCard, QuizResult, QuizHistory
│   │   │   └── layout/
│   │   └── content/
│   │       └── modules/          ← Fichiers MDX versionnés (source de vérité contenu)
│   │           ├── 01-ai-engineering.mdx
│   │           ├── 02-foundation-models.mdx
│   │           ├── 03-model-selection.mdx
│   │           ├── 04-prompt-engineering.mdx
│   │           ├── 05-rag-agents.mdx
│   │           └── 06-production-architecture.mdx
│   └── api/                      ← FastAPI backend
│       ├── routers/
│       │   ├── auth.py
│       │   ├── progress.py
│       │   ├── quiz.py
│       │   └── assistant.py      ← RAG + LLM
│       ├── services/
│       │   ├── rag.py            ← Indexation + retrieval
│       │   └── llm_gateway.py    ← LiteLLM wrapper
│       ├── models/               ← SQLAlchemy models
│       ├── schemas/              ← Pydantic schemas
│       └── migrations/           ← Alembic
├── packages/
│   └── shared-types/             ← Types TypeScript partagés (web ↔ api contracts)
├── docker-compose.yml
└── .env.example
```

---

## 5. Conventions de Code

### Nommage
- **Variables Python** : `snake_case` — ex : `quiz_result`, `module_progress`
- **Variables TS/React** : `camelCase` — ex : `quizResult`, `moduleProgress`
- **Composants React** : `PascalCase` — ex : `QuizCard`, `ModuleViewer`
- **Fichiers frontend** : `kebab-case` — ex : `quiz-card.tsx`, `module-viewer.tsx`
- **Fichiers backend** : `snake_case` — ex : `quiz_service.py`, `progress_router.py`
- **Tables DB** : `snake_case` pluriel — ex : `quiz_results`, `module_progresses`
- **Variables d'env** : `UPPER_SNAKE_CASE` — ex : `DATABASE_URL`, `ANTHROPIC_API_KEY`

### Formatting
- **Python** : black (line-length 88) + ruff (linting)
- **TypeScript** : Biome (indent 2 espaces, line-length 100)
- **MDX** : pas de formatter automatique — conventions éditoriales manuelles

### Imports Python
```python
# 1. stdlib
import os
from typing import Optional

# 2. third-party
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

# 3. internal
from app.models.user import User
from app.services.rag import retrieve_chunks
```

---

## 6. Patterns Utilisés

### Quiz Engine — state machine côté client
```typescript
// Trois états : answering → reviewing → completed
type QuizState =
  | { status: "answering"; currentQuestion: number; answers: Answer[] }
  | { status: "reviewing"; answers: Answer[]; corrections: Correction[] }
  | { status: "completed"; score: number; passedAt: Date };
```

### RAG — retrieval hybride (dense + sparse)
```python
async def retrieve(query: str, module_id: str, k: int = 4) -> list[Chunk]:
    dense = await vector_search(query, module_id, k=k * 2)   # pgvector cosine
    sparse = await bm25_search(query, module_id, k=k * 2)    # pg full-text
    return reciprocal_rank_fusion(dense, sparse)[:k]
```

### LLM call — tracé via Langfuse
```python
async def complete(prompt: str, session_id: str) -> str:
    with langfuse.trace(name="assistant", session_id=session_id) as trace:
        response = await litellm.acompletion(
            model=settings.DEFAULT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=512,
            temperature=0.2,
        )
        trace.generation(input=prompt, output=response.choices[0].message.content)
    return response.choices[0].message.content
```

---

## 7. Gestion des Erreurs

```python
# Pattern standard API — erreurs métier explicites, pas d'exceptions nues
class AppError(Exception):
    def __init__(self, code: str, message: str, status: int = 400):
        self.code = code
        self.message = message
        self.status = status

# Handler global FastAPI
@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status,
        content={"error": exc.code, "message": exc.message},
    )

# Erreurs LLM — fallback silencieux, jamais de crash utilisateur
async def safe_complete(prompt: str) -> str | None:
    try:
        return await complete(prompt)
    except litellm.APIError:
        logger.warning("LLM unavailable — degraded mode")
        return None
```

---

## 8. Sécurité

- **Authentification** : JWT signé (Auth.js v5) côté frontend — le token est vérifié par l'API FastAPI via `python-jose` avec un `JWT_SECRET` partagé
- **Autorisation** : rôles `learner` / `trainer` / `admin` stockés dans le JWT — les routes `/admin` et `/trainer` vérifient le claim `role`
- **Secrets** : `.env` local + Railway environment variables en production — jamais dans le code ni dans git (`.env.example` fourni)
- **Input validation** : Pydantic v2 sur tous les schémas d'entrée API — validation stricte avec `model_config = ConfigDict(strict=True)`
- **Prompt injection** : les questions utilisateur envoyées à l'assistant sont passées en `user` message, jamais interpolées dans le system prompt
- **Rate limiting** : `slowapi` (FastAPI) sur les endpoints `/assistant` — 10 req/min par utilisateur pour limiter les coûts LLM

---

## 9. Gouvernance Réglementaire

> Ces contraintes sont dérivées des 4 agents de gouvernance Tier 1. Droit de veto en cas de conflit avec une SPEC.

### RGAA 4.1 — Accessibilité (obligatoire, droit de veto)

- Lien d'évitement `<a href="#main-content">` en premier élément focusable de chaque page
- `<html lang="fr">` sur le document racine ; `lang="en"` sur les extraits de code anglais
- Un seul `<h1>` par page, hiérarchie de titres sans saut de niveau
- `aria-current="page"` sur le lien actif dans la navigation
- `<nav aria-label="Navigation principale">` et `<nav aria-label="Fil d'Ariane">` distincts
- Ratio de contraste ≥ 4.5:1 (texte normal), ≥ 3:1 (texte large ≥ 18px, composants UI)
- Focus visible sur tous les éléments interactifs (`:focus-visible` — jamais `outline: none` sans alternative)
- Tous les éléments interactifs atteignables au clavier
- `aria-live="polite"` pour tout changement dynamique de contenu (résultats quiz, progression)
- Classe `.sr-only` disponible globalement ; `prefers-reduced-motion` respecté
- **CI** : `jest-axe` sur tous les composants. Score Lighthouse Accessibilité cible : > 90.

```css
/* globals.css — obligatoire */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
:focus-visible { outline: 3px solid #005fcc; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
```

### RGESN v2 — Écoconception (obligatoire, droit de veto)

| Métrique | Cible |
|----------|-------|
| Poids page (initial load) | < 500 Ko |
| Bundle JS gzippé | < 200 Ko |
| Requêtes HTTP (initial) | < 30 |
| Score Ecoindex | ≥ B (60+) |
| Lighthouse Performance | > 80 |
| LCP | < 2.5s |

Règles techniques :
- Images : format WebP/AVIF, `loading="lazy"` hors viewport, `srcset` + `sizes`, dimensions explicites
- Polices : sous-ensemble limité + `font-display: swap`, préférence polices système
- Icônes : SVG inline uniquement (pas d'icon font complète)
- Pas de librairie entière pour une seule fonction (tree shaking obligatoire)
- Pas de ressources tierces non essentielles chargées de façon synchrone au premier rendu

### RGPD — Protection des données personnelles (obligatoire, droit de veto)

Base légale documentée dans le code pour chaque traitement :

| Donnée | Finalité | Base légale | Conservation |
|--------|----------|-------------|-------------|
| Email | Authentification | Contrat Art. 6.1.b | Durée compte + 3 ans |
| Progression modules | Personnalisation | Contrat Art. 6.1.b | Durée compte |
| Logs connexion | Sécurité | Intérêt légitime Art. 6.1.f | 6 mois |

Règles techniques :
- Mots de passe : bcrypt cost factor ≥ 12 — JAMAIS MD5/SHA1
- Données personnelles jamais dans les logs applicatifs (pseudonymiser)
- Données de prod jamais en dev/staging sans pseudonymisation
- Cookies analytics : consentement explicite requis — préférer Plausible EU (privacy-first, hébergé UE)
- Endpoints RGPD obligatoires si authentification : `/api/gdpr/export`, `/api/gdpr/erase`, `/api/gdpr/rectify`

Sous-traitants cibles :

| Service | Localisation | Mécanisme |
|---------|-------------|-----------|
| Vercel (fra1) ou Railway (EU) | UE | Pas de transfert hors UE |
| Langfuse self-hosted | UE | Pas de transfert hors UE |

### EU AI Act — Qualification des composants IA

**Version skeleton / navigation** : Risque Minimal — application CRUD sans composant IA décisionnel. Aucune obligation spécifique AI Act.

Évolutions futures — qualification à réaliser à chaque SPEC introduisant un composant IA :

| Composant | Classification | Obligations |
|-----------|---------------|-------------|
| Quiz adaptatif (génération LLM) | Risque Limité Art. 50 | Divulgation IA obligatoire en début de session |
| Recommandation de parcours | Risque Limité Art. 50 | Divulgation IA obligatoire |
| Évaluation automatique apprenants | Haut Risque Annexe III — Éducation | Docs complètes, supervision humaine, logs décisions |

Règle transversale : tout composant IA doit exposer son niveau de confiance, permettre un override humain et ne jamais affirmer être humain si directement interrogé.

---

## 10. Performance (Budgets)

| Métrique | Budget | Monitoring |
|----------|--------|-----------|
| **Response time p95 — pages modules** | < 800 ms | Vercel Analytics |
| **Response time p95 — quiz submit** | < 300 ms | Railway metrics |
| **Response time p95 — assistant (TTFT)** | < 1 500 ms | Langfuse |
| **Coût LLM mensuel** | < 50 € (early) | Langfuse cost tracking |
| **Error rate API** | < 0,5 % | Railway logs + Sentry |
| **Taux de feedback négatif assistant** | < 20 % | Langfuse scores |

---

## 11. ADRs (Architecture Decision Records)

> Les ADRs sont stockés dans `.aiad/adrs/` au format :
> `ADR-NNN-[titre].md`

**ADR-001** — Content-as-code (MDX dans git) plutôt que CMS headless
- *Décision* : les modules sont des fichiers MDX versionnés dans le dépôt, pas dans un CMS externe (Contentful, Sanity, etc.)
- *Raison* : les formateurs sont techniques (Steeve est dev), le contenu évolue en tandem avec le code, et un CMS ajoute une dépendance externe payante pour un corpus stable de 6 modules.
- *Coût* : les formateurs non-techniques ne peuvent pas éditer sans pull request — acceptable à ce stade, à réévaluer si d'autres formateurs rejoignent.

**ADR-002** — pgvector plutôt qu'une base vectorielle dédiée (Pinecone, Qdrant)
- *Décision* : les embeddings du RAG sont stockés dans PostgreSQL via l'extension pgvector.
- *Raison* : le corpus est petit (6 modules ≈ 2 000 chunks maximum), une base vectorielle dédiée est un surcoût opérationnel injustifié à ce volume.
- *Coût* : si le corpus dépasse 100k chunks ou si les performances de retrieval deviennent un bottleneck, migrer vers Qdrant self-hosted.

**ADR-003** — LiteLLM comme gateway LLM plutôt qu'appel direct à l'API Anthropic
- *Décision* : tous les appels LLM passent par LiteLLM.
- *Raison* : abstraction multi-provider (Claude aujourd'hui, Mistral ou Llama demain si les coûts le justifient), fallback automatique, format unifié — cohérent avec ce qu'on enseigne dans le Module 6.
- *Coût* : une dépendance supplémentaire — marginale, LiteLLM est stable et maintenu activement.
