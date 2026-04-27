# SPEC-003-navigation-shell

**Intent parent** : INTENT-001-skeleton-navigation-modulaire
**Auteur** : Steeve Evers (PE)
**Date** : 2026-04-27
**Statut** : draft
**SQS** : À évaluer via /sdd-gate

---

## 1. Contexte

Cette SPEC construit le shell visuel de l'application : layout racine, navigation principale et page module shell. Le contenu des modules est absent (placeholder). La navigation est entièrement pilotée par le Module Registry (SPEC-002) — aucune liste de modules en dur dans le code. La conformité RGAA 4.1 est non-négociable et intégrée dès cette SPEC.

## 2. Comportement Attendu

### Input

- Tableau `ModuleMetadata[]` retourné par `getAllModules()` (SPEC-002)
- `pathname` courant (Next.js `usePathname` ou Server Component props)
- Variable d'environnement `NEXT_PUBLIC_APP_NAME` (ex: `"FormationsIA"`)

### Processing

1. **Root layout** (`apps/web/app/layout.tsx`) :
   - `<html lang="fr">` obligatoire
   - Inclure `globals.css` avec les classes RGAA (`.sr-only`, `:focus-visible`, `prefers-reduced-motion`)
   - Lien d'évitement `<a href="#main-content" className="sr-only focus:not-sr-only">` en premier élément focusable
   - Appel `getAllModules()` (Server Component) → passe le résultat à `<Sidebar>`

2. **Sidebar** (`apps/web/components/layout/sidebar.tsx`) :
   - `<nav aria-label="Navigation principale">`
   - Logo + nom de l'application en tête
   - Liste des modules : lien `<a href="/modules/[slug]">` avec `aria-current="page"` si actif
   - Ordre déterminé par `module.order`
   - Responsive : masquée sur mobile (burger menu), visible ≥ 768px
   - Indicateur visuel de progression future (placeholder : cercle vide, non fonctionnel)

3. **Page module shell** (`apps/web/app/(learner)/modules/[slug]/page.tsx`) :
   - `generateStaticParams()` depuis `getAllModules()` (SSG)
   - `notFound()` si `getModuleBySlug(slug)` retourne `null`
   - Affiche : titre du module, description, durée, badge(s) audience
   - Placeholder : `<p>Contenu à venir</p>` dans la zone principale
   - Navigation prev/next entre modules (liens basés sur `order`)

4. **Dashboard** (`apps/web/app/(learner)/dashboard/page.tsx`) :
   - Liste des modules sous forme de cards (titre, description, durée, audience)
   - État : "non commencé" (placeholder, aucune logique de progression à ce stade)
   - Lien vers chaque module

5. **Breadcrumb** (`apps/web/components/layout/breadcrumb.tsx`) :
   - `<nav aria-label="Fil d'Ariane">` distinct de la nav principale
   - Schéma : Accueil › Modules › [Titre du module]
   - Dernier élément : `aria-current="page"`, non cliquable

6. **Page d'accueil** (`apps/web/app/page.tsx`) :
   - Redirige vers `/dashboard` (pas de landing page pour le skeleton)

### Output

Application Next.js navigable avec :
- Sidebar listant les 6 modules auto-découverts
- Pages `/dashboard`, `/modules/[slug]` pour les 6 modules
- Navigation clavier complète, focus visible, contrastes conformes

### Cas limites

- 0 module dans le registry : sidebar affiche un message "Aucun module disponible" (pas de liste vide silencieuse)
- Slug inconnu (`/modules/inexistant`) : Next.js `notFound()` → page 404 accessible avec lien retour
- Navigation sans JS (SSR) : la sidebar et tous les liens fonctionnent sans JavaScript côté client
- Viewport < 320px : pas de défilement horizontal (overflow-x hidden sur body)
- `prefers-color-scheme: dark` : Tailwind dark mode class strategy, pas de flash au chargement

## 3. Critères d'Acceptation

- [ ] Accéder à `/modules/01-ai-engineering` affiche la page shell avec titre, description, durée
- [ ] Ajouter un 7e fichier MDX valide l'ajoute automatiquement dans la sidebar sans modifier de code
- [ ] Navigation au clavier (Tab) : skip link → nav principale → contenu principal, sans piège de focus
- [ ] `aria-current="page"` présent sur le lien actif en sidebar et dans le breadcrumb
- [ ] `<html lang="fr">` vérifié sur toutes les pages via test Playwright
- [ ] Lighthouse Accessibilité > 90 sur `/dashboard` et `/modules/[slug]`
- [ ] Aucun lien brisé (tous les slugs générés par `generateStaticParams` sont accessibles)
- [ ] Poids initial page : < 500 Ko (RGESN) — mesuré avec `next build` + analyse bundle
- [ ] Bundle JS gzippé : < 200 Ko (RGESN)

## 4. Interface / API

```typescript
// apps/web/components/layout/sidebar.tsx
interface SidebarProps {
  modules: ModuleMetadata[];
  currentPath: string;
}
export function Sidebar({ modules, currentPath }: SidebarProps): React.JSX.Element

// apps/web/components/layout/breadcrumb.tsx
interface BreadcrumbItem {
  label: string;
  href?: string; // absent sur le dernier item (aria-current="page")
}
interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
export function Breadcrumb({ items }: BreadcrumbProps): React.JSX.Element

// apps/web/app/(learner)/modules/[slug]/page.tsx
// Next.js page — generateStaticParams + default export
export async function generateStaticParams(): Promise<{ slug: string }[]>
export default async function ModulePage({
  params,
}: {
  params: { slug: string };
}): Promise<React.JSX.Element>
```

```css
/* apps/web/app/globals.css — classes RGAA obligatoires */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
           overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
:focus-visible { outline: 3px solid #005fcc; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important;
                            transition-duration: 0.01ms !important; }
}
```

## 5. Dépendances

- **SPEC-001** (monorepo bootstrap) — prérequis bloquant
- **SPEC-002** (module registry) — prérequis bloquant
- SPEC-004 (auth shell) — indépendante, mais les routes `/dashboard` et `/modules/[slug]` seront protégées une fois SPEC-004 mergée

## 6. Estimation Context Budget

**Contexte à injecter pour cette tâche :**
- AGENT-GUIDE (condensé) : ~200 tokens
- ARCHITECTURE.md §4 (structure) + §9 RGAA (contraintes accessibilité) : ~500 tokens
- Cette SPEC : ~500 tokens
- Fichiers source pertinents : `apps/web/lib/module-registry.ts`, `packages/shared-types/src/module.ts`
- **Total estimé** : ~1 400 tokens

## 7. Definition of Output Done (DoOD)

- [ ] Code implémenté (layout, sidebar, breadcrumb, pages) et lint passing (Biome)
- [ ] `pnpm --filter web typecheck` passing
- [ ] Tests Playwright : navigation clavier, `aria-current`, skip link, `lang="fr"`, page 404
- [ ] `next build` sans erreur — `generateStaticParams` génère les 6 routes
- [ ] Lighthouse Accessibilité > 90 (rapport en pièce jointe de la PR)
- [ ] Poids bundle vérifié < 500 Ko initial / < 200 Ko JS gzippé
- [ ] SPEC mise à jour si écart découvert (Drift Lock)
- [ ] Code review passée (1 approval minimum)
- [ ] Gouvernance RGAA : skip link, aria-label, aria-current, contraste, focus visible — checklist en commentaire de PR
- [ ] Gouvernance RGESN : analyse bundle jointe, score Ecoindex ≥ B
