# INTENT-001-skeleton-navigation-modulaire

**Auteur** : Steeve Evers (AIAD)
**Date** : 2026-04-27
**Statut** : livré

---

## POURQUOI MAINTENANT
Les consultants ESN doivent maîtriser les bases de l'IA engineering sans avoir deux jours à y consacrer. Les ESN ont des budgets formation contraints et ne peuvent pas former tout le monde. Les commerciaux ESN, faute de niveau technique suffisant, promettent des projets IA irréalisables à leurs clients.

## POUR QUI
- **Consultants ESN** (profils techniques) : montée en compétence rapide sur les fondamentaux de l'IA engineering
- **Commerciaux ESN** : socle de connaissances pour calibrer leurs promesses client

## OBJECTIF
Construire le skeleton de l'application de formation en IA engineering — navigation complète, sans contenu — avec une **architecture modulaire telle qu'un nouveau module peut être ajouté en moins d'une heure** sans modifier le code existant.

## CONTRAINTES
- Expérience d'apprentissage compatible avec des sessions courtes (pas de bloc de 2 jours)
- Budget ESN contraint : solution économique à maintenir et à déployer
- Conformité obligatoire aux 4 agents de gouvernance Tier 1 : RGAA 4.1, RGESN v2, RGPD, EU AI Act
- Hébergement préférentiel en Europe (RGPD — minimiser les transferts hors UE)

## CRITÈRE DE DRIFT
L'implémentation a dérivé si **l'ajout d'un nouveau module impose de modifier des fichiers hors du dossier du module lui-même**. Couplage fort = dérive de la modularité.

---

## SPECs liées

- [x] [SPEC-001 — Monorepo Bootstrap](../specs/SPEC-001-monorepo-bootstrap.md)
- [x] [SPEC-002 — Module Registry](../specs/SPEC-002-module-registry.md)
- [x] [SPEC-003 — Navigation Shell](../specs/SPEC-003-navigation-shell.md)
- [x] [SPEC-004 — Auth Shell](../specs/SPEC-004-auth-shell.md)
