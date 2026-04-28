---
id: INTENT-004
nom: instructor-avatar
auteur: Steeve Evers
date: 2026-04-28
statut: livré
---

# INTENT-004 — Avatars formateurs dans les modules

**Auteur** : Steeve Evers
**Date** : 2026-04-28
**Statut** : livré

---

## POURQUOI MAINTENANT

Les modules MDX utilisent actuellement `💼 **Steeve**` comme attribution textuelle de prise de parole. Les photos officielles des deux formateurs sont disponibles. Ajouter les avatars maintenant, avant d'introduire davantage de contenu multi-formateurs, évite une refonte plus coûteuse plus tard et renforce immédiatement la dimension humaine de la plateforme.

## POUR QUI

Les apprenants (consultants ESN) qui suivent les modules dans VecteurAcademy — ils verront qui leur parle à chaque changement de formateur dans un chapitre.

## OBJECTIF

Chaque section de module affichant `<InstructorBadge name="Steeve Evers" />` montre la photo de Steeve Evers ; chaque section affichant `<InstructorBadge name="Dr Lena Voss" />` montre la photo de la Dr Lena Voss — **signal visuel immédiat de qui prend la parole**, sans modifier le schéma de données.

- **Formateur 1** : Steeve Evers — photo `Gemini_Generated_Image_hq5e9hhq5e9hhq5e.png` (présentation des concepts métier)
- **Formatrice 2** : Dr Lena Voss — photo `Gemini_Generated_Image_nvo3zznvo3zznvo3.png` (chapitres techniques)

Métrique : 100 % des marqueurs `💼 **Steeve**` dans les 6 modules existants remplacés par `<InstructorBadge name="Steeve Evers" />` avec photo visible.

## CONTRAINTES

- Photos sources : `~/Downloads/Gemini_Generated_Image_hq5e9hhq5e9hhq5e.png` (Steeve Evers) et `~/Downloads/Gemini_Generated_Image_nvo3zznvo3zznvo3.png` (Dr Lena Voss)
- Images à copier dans `apps/web/public/instructors/` pour être servies statiquement par Next.js
- Stack : Next.js 15 + `next-mdx-remote/rsc` + `mdx-components.tsx`
- Pas de modification du schéma DB ni du frontmatter MDX
- Respect RGAA 4.1 : images avec `alt` descriptif, badge accessible au clavier
- Respect RGESN : Next.js `<Image>` avec `width`/`height` déclarés, taille affichée ≤ 64px

## CRITÈRE DE DRIFT

L'implémentation a dérivé si :
- La photo du mauvais formateur s'affiche pour une section (Steeve ↔ Dr Lena Voss inversés)
- Un marqueur `💼 **Steeve**` reste en texte brut sans composant visuel
- Le composant `InstructorBadge` s'affiche sur des éléments qui ne sont pas des attributions formateur
- Les images sont manquantes ou cassées (alt visible à la place)

---

## SPECs liées
- [x] [SPEC-011](../specs/SPEC-011-instructor-badge.md) — InstructorBadge component + migration MDX (24 marqueurs)
