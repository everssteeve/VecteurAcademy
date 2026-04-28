# INTENT-005-dashboard-progression-logout

**Auteur** : Steeve Evers
**Date** : 2026-04-28
**Statut** : validé

---

## POURQUOI MAINTENANT

Les apprenants n'ont actuellement aucun moyen de se déconnecter de la plateforme, et aucune interface ne leur permet de consulter leurs résultats aux quiz de module ni leurs tentatives à l'évaluation finale. Ces deux manques bloquent l'expérience apprenant complète : la session reste ouverte indéfiniment et le suivi de progression est invisible.

## POUR QUI

Les apprenants (consultants ESN) authentifiés sur VecteurAcademy — en particulier ceux qui ont déjà complété un ou plusieurs modules et passé des tentatives d'évaluation finale.

## OBJECTIF

- 100 % des apprenants authentifiés peuvent se déconnecter via un bouton accessible depuis l'interface principale.
- Un dashboard de progression affiche, pour chaque apprenant connecté : le taux de complétion des quiz par module (0–100 %) et l'historique des tentatives à l'évaluation finale (score, niveau de certification obtenu, date).
- La complétion d'un nouveau module ajouté à postériori apparaît automatiquement dans le dashboard sans modification du code du dashboard.

## CONTRAINTES

- Stack technique définie dans `.aiad/ARCHITECTURE.md` (Next.js 15 App Router, Auth.js v5, FastAPI, PostgreSQL/pgvector, Tailwind CSS v4).
- Règles absolues de l'AGENT-GUIDE : pas de secret en git, migration DB versionnée obligatoire si nouveau schéma, lint passing avant commit.
- Agents de gouvernance Tier 1 : RGPD (données de progression = données personnelles), RGAA (interface utilisateur accessible), RGESN (pas de requête superflue), AI Act (hors périmètre ici).
- Périmètre itération : lecture seule sur la progression (pas de modification/reset depuis le dashboard). Le logout est global (pas de gestion multi-session).

## CRITÈRE DE DRIFT

Un module ajouté après ce développement n'apparaît pas dans le dashboard (ou son résultat de quiz est absent) sans modification manuelle du code du dashboard — signal que le dashboard est couplé à une liste statique de modules plutôt qu'au registry dynamique.

---

## SPECs liées

- [ ] SPEC-012 — Bouton logout (déconnexion Auth.js v5)
- [ ] SPEC-013 — Dashboard de progression (quiz par module + tentatives évaluation finale)
