# INTENT-006 — Durcissement sécurité pré-production

**Auteur** : Steeve Evers
**Date** : 2026-04-29
**Statut** : draft

---

## POURQUOI MAINTENANT

L'audit Express du 2026-04-29 a révélé 10 vulnérabilités, dont 3 🔴 critiques bloquantes pour la production : IDOR total sur `/progress` et `/quiz/result` (CVSS ~9.1), absence de vérification JWT côté API (CVSS ~8.8), secrets et configuration Auth.js par défaut dangereux. Avant d'ouvrir la plateforme à la première cohorte d'apprenants ESN, il faut fermer ces failles — sinon les données de progression et quiz de tout apprenant sont lecture/écriture ouvertes via simple POST.

## POUR QUI

- **Apprenants ESN** (premiers utilisateurs cible) — leurs résultats au quiz final, progression et identité doivent être isolés entre comptes.
- **Steeve** (formateur, responsable RGPD du traitement) — exposition juridique en cas de fuite.
- **Directeurs commerciaux ESN** (prospects PRD §3) — exigent des garanties de sécurité avant d'envoyer leurs consultants.

## OBJECTIF

- **100% des findings 🔴 (#1, #2, #3) du rapport audit clos** avant tout déploiement Railway en production.
- **0 endpoint API non authentifié** (hors `/health`).
- **0 paramètre `user_id` accepté en query/body** sur les routes protégées (déduit du JWT).
- **10/10 findings totaux résolus** (l'intégralité du rapport audit Express) avant la première cohorte.
- **Test E2E Playwright** couvrant un scénario d'escalation horizontale (utilisateur A tente de lire/écrire les données de B → 403).

## CONTRAINTES

- **Stack figée** : rester sur Auth.js v5 + JWT shared secret (pas de bascule OAuth/Keycloak).
- **Solo + Claude Code** : pas de budget tiers (Auth0, Sentry payant), HaveIBeenPwned API uniquement si gratuite.
- **Gouvernance Tier 1 obligatoire** : `CLAUDE-RGPD.md` (données apprenants) + `CLAUDE-RGESN.md` (impact ressources rate limiting/CSP).
- **Pas de breaking change** sur les Server Actions Next existantes : les apprenants déjà inscrits doivent continuer à fonctionner après le fix.
- **Drift Lock** : chaque SPEC issue de cet Intent met à jour le code ET les tests E2E sécurité dans la même PR.

## CRITÈRE DE DRIFT

L'implémentation a dérivé si **au moins un** des signaux suivants apparaît :

1. Un endpoint API (hors `/health`) accepte une requête sans en-tête `Authorization` valide → 200 au lieu de 401.
2. Un schéma Pydantic d'une route protégée contient encore un champ `user_id` lu depuis le body/query.
3. Un déploiement passe avec `JWT_SECRET=changeme...` ou `AUTH_TRUST_HOST=true`.
4. Le score d'un quiz peut être positionné à une valeur arbitraire par le client (recalcul serveur absent).
5. Aucun test E2E ne tente une escalation horizontale (user A → données user B) — ou ce test passe en répondant 200.
6. La configuration CORS contient `*` quand `allow_credentials=True`.

---

## SPECs liées

- [x] [SPEC-014](../specs/SPEC-014-jwt-auth-api.md) — Authentification JWT côté API (fixes #1 + #2 couplés) — draft
- [ ] SPEC-015 — Hardening Auth.js + secrets + CORS (fixes #3 + #4)
- [ ] SPEC-016 — Rate limiting + password policy (fixes #5 + #7)
- [ ] SPEC-017 — Headers de sécurité Next.js / CSP (fix #6)
- [ ] SPEC-018 — Recalcul serveur des scores quiz (fix #8) — *dépend de SPEC-014*
- [ ] SPEC-019 — Observabilité Server Actions + hardening Docker (fixes #9 + #10)
