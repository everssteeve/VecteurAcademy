---
id: INTENT-002
name: Contenu modules + quiz de fin de parcours
description: Peupler les 6 modules MDX avec le contenu formationIA.md, ajouter les quiz de fin de module, et créer un quiz de fin de parcours complet.
type: project
status: livré
---

# INTENT-002 — Contenu modules + quiz de fin de parcours

**Auteur** : Steeve Evers
**Date** : 2026-04-27
**Statut** : validé

---

## POURQUOI MAINTENANT

Le marché ESN bascule vers l'IA — consultants et commerciaux n'ont pas les bases pour répondre aux demandes clients sur ce sujet. Les 6 modules MDX existent structurellement dans la plateforme mais sont tous vides (`{/* contenu à venir */}`). La formation ne peut pas être utilisée tant que le contenu n'est pas en place.

## POUR QUI

Consultants (tous niveaux) et staff commercial des ESN — en particulier les commerciaux qui doivent qualifier et accompagner des projets IA chez leurs clients.

## OBJECTIF

Les 6 modules MDX contiennent le contenu pédagogique complet issu de `formationIA.md` (sans ajout ni invention) + un quiz de fin de module chacun, **et** un quiz de fin de parcours complet existe en tant que nouvelle fonctionnalité.

**Métrique de succès** : un apprenant ayant lu un module doit pouvoir répondre correctement à ≥ 70 % des questions du quiz correspondant. Le quiz de fin de parcours couvre l'ensemble des 6 modules.

## CONTRAINTES

- **Contenu** : strictement celui de `.aiad/formationIA.md` — aucun ajout, aucune invention
- **Stack** : Next.js 15 + MDX 3 + TypeScript strict (pas de nouvelle dépendance sans justification)
- **Quiz de fin de module** : intégré dans les fichiers MDX existants (composant interactif client)
- **Quiz de fin de parcours** : nouvelle feature à concevoir et implémenter — non existante dans l'architecture actuelle
- **Accessibilité** : RGAA 4.1 obligatoire sur tous les composants de quiz (Tier 1 CLAUDE-RGAA)

## CRITÈRE DE DRIFT

L'implémentation a dérivé si :
- Un apprenant ayant lu un module ne peut pas réussir le quiz de fin de ce module (score < 70 %)
- Le quiz de fin de parcours n'existe pas ou ne couvre pas les 6 modules
- Le contenu d'un module ne correspond pas fidèlement à la section correspondante dans `formationIA.md`

---

## SPECs liées

- [x] SPEC-005 — Contenu MDX + Rendu modules (source : `formationIA.md`) → draft
- [x] SPEC-006 — Composant Quiz de fin de module (MDX interactif) → draft
- [x] SPEC-007 — Quiz de fin de parcours complet (nouvelle feature) → draft
