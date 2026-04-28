# INTENT-003-auth-user-management

**Auteur** : Steeve Evers
**Date** : 2026-04-28
**Statut** : livré

---

## POURQUOI MAINTENANT

Le contenu de la plateforme VecteurAcademy est actuellement accessible sans authentification réelle. Les consultants ESN n'ont pas de compte — il est donc impossible de persister leur progression, d'identifier qui a suivi quoi, et d'associer les résultats de quiz à une personne.

## POUR QUI

Les **consultants ESN apprenants** : professionnels de l'IT en ESN (Entreprise de Services du Numérique) qui suivent les 6 modules de formation AI Engineering. Chaque utilisateur est rattaché à une ESN identifiée lors de la création de compte.

## OBJECTIF

Permettre à un consultant ESN de créer un compte (email, mot de passe, nom de l'ESN), de s'authentifier, et de retrouver sa progression entre sessions — incluant l'avancement par module et les résultats des quiz de fin de module et du quiz de parcours final.

**Métriques de succès :**
- Un utilisateur peut s'inscrire et se connecter en moins de 2 minutes
- La progression (modules consultés + scores de quiz) est persistée et restituée à chaque reconnexion
- Zéro accès au contenu sans session valide

## CONTRAINTES

- **Technique** : Auth.js v5 (`next-auth@beta`) déjà en stack — utiliser ce mécanisme, pas en ajouter un autre
- **Base de données** : PostgreSQL 16 existant — les tables `User`, `Session`, `Account` d'Auth.js s'y ajoutent via migration Alembic ou adaptateur Prisma selon l'implémentation retenue
- **Réglementaire** : données personnelles collectées (email, nom ESN) → agents CLAUDE-RGPD et CLAUDE-RGAA obligatoires avant implémentation
- **Périmètre** : authentification credentials (email + mot de passe) uniquement — pas de SSO, pas d'OAuth tiers dans ce périmètre

## CRITÈRE DE DRIFT

L'implémentation a dérivé si :
- La progression d'un apprenant n'est pas liée à son compte utilisateur (stockée localement ou en session anonyme)
- Les résultats des quiz de fin de module ou du quiz de parcours final ne sont pas persistés en base associés à l'utilisateur
- Le contenu reste accessible sans session valide (pas de protection des routes)
- Des fonctionnalités hors périmètre sont implémentées (rôles admin, SSO, gestion d'équipe ESN)

---

## SPECs liées

- [x] SPEC-008 — Schéma DB utilisateur + migrations (User, progression, quiz_results)
- [x] SPEC-009 — Auth.js v5 credentials provider (inscription, connexion, sessions)
- [x] SPEC-010 — Protection des routes + persistance progression/quiz
