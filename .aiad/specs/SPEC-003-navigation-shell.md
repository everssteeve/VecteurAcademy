# SPEC-003-navigation-shell

**Intent parent** : INTENT-001-skeleton-navigation-modulaire
**Auteur** : Steeve Evers (PE)
**Date** : 2026-04-27
**Statut** : done
**SQS** : 5/5 ✅ (gate passée le 2026-04-27 après remédiation critère 4)

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
   - Appel `getAllModules()` (Server Component) → passe le résultat à `<AppShell>` (`components/layout/app-shell.tsx`, Client Component) qui orchestre `<Sidebar>` + `<MobileNav>` en résolvant le `pathname` courant via `usePathname()`

2. **Sidebar** (`apps/web/components/layout/sidebar.tsx`) :
   - `<nav aria-label="Navigation principale">`
   - Logo + nom de l'application en tête
   - Liste des modules : lien `<a href="/modules/[slug]">` avec `aria-current="page"` si actif
   - Ordre déterminé par `module.order`
   - Responsive : masquée sur mobile (< 768px), visible ≥ 768px
   - Burger menu mobile (`apps/web/components/layout/mobile-nav.tsx`, Client Component) :
     - Bouton déclencheur : `<button aria-expanded={isOpen} aria-controls="sidebar-nav" aria-label="Ouvrir la navigation">`
     - Panneau mobile : `<div id="sidebar-nav">` contenant `<nav aria-label="Navigation principale">` identique à la sidebar desktop — `id` sur le `<div>` contrôlé (correct ARIA : `aria-controls` pointe sur l'élément visible/masqué)
     - Fermeture : clic bouton, touche `Escape`, clic en dehors du panneau
     - Pas de piège de focus (focus retourne au bouton déclencheur à la fermeture)
     - Animation : `transition` CSS uniquement — désactivée si `prefers-reduced-motion`
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

7. **Page 404** (`apps/web/app/not-found.tsx`) :
   - Titre "Page introuvable"
   - Lien `<Link href="/dashboard">Retour au tableau de bord</Link>`
   - Hérite du root layout (sidebar présente, `lang="fr"` garanti)

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
- `prefers-color-scheme: dark` : Tailwind `darkMode: 'media'` (suivi automatique du système, **pas de toggle utilisateur dans cette SPEC**) — aucun flash possible puisque le mode est résolu côté système sans JS

## 3. Critères d'Acceptation

- [x] Accéder à `/modules/01-ai-engineering` affiche la page shell avec titre, description, durée
- [x] Ajouter un 7e fichier MDX valide l'ajoute automatiquement dans la sidebar sans modifier de code
- [x] Navigation au clavier (Tab) : skip link → nav principale → contenu principal, sans piège de focus
- [x] `aria-current="page"` présent sur le lien actif en sidebar et dans le breadcrumb
- [x] `<html lang="fr">` vérifié sur toutes les pages via test Playwright
- [x] Lighthouse Accessibilité > 90 sur `/dashboard` et `/modules/[slug]` — **96/100**
- [x] Aucun lien brisé (tous les slugs générés par `generateStaticParams` sont accessibles)
- [x] Poids initial page : < 500 Ko (RGESN) — 124 kB mesuré
- [x] Bundle JS gzippé : < 200 Ko (RGESN) — 124 kB

## 4. Interface / API

```typescript
// apps/web/components/layout/sidebar.tsx
interface SidebarProps {
  modules: ModuleMetadata[];
  currentPath: string;
}
export function Sidebar({ modules, currentPath }: SidebarProps): React.JSX.Element

// apps/web/components/layout/mobile-nav.tsx  (Client Component — 'use client')
interface MobileNavProps {
  modules: ModuleMetadata[];
  currentPath: string;
}
export function MobileNav({ modules, currentPath }: MobileNavProps): React.JSX.Element

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
  params: Promise<{ slug: string }>; // Next.js 15 — params est une Promise, await requis
}): Promise<React.JSX.Element>

// apps/web/components/layout/app-shell.tsx  (Client Component — 'use client')
// Composant orchestrateur introduit pour résoudre usePathname() dans un Server Component layout
interface AppShellProps {
  modules: ModuleMetadata[];
  children: React.ReactNode;
}
export function AppShell({ modules, children }: AppShellProps): React.JSX.Element
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

- [x] Code implémenté (layout, sidebar, breadcrumb, pages) et lint passing (Biome)
- [x] `pnpm --filter web typecheck` passing
- [x] Tests Playwright : navigation clavier, `aria-current`, skip link, `lang="fr"`, page 404 — 12/12
- [x] `next build` sans erreur — `generateStaticParams` génère les 6 routes
- [x] Lighthouse Accessibilité > 90 — **96/100** sur `/dashboard` et `/modules/[slug]`
- [x] Poids bundle vérifié < 500 Ko initial / < 200 Ko JS gzippé — **124 kB**
- [x] SPEC mise à jour (Drift Lock — 2026-04-27)
- [ ] Code review passée (1 approval minimum)
- [ ] Gouvernance RGAA : skip link, aria-label, aria-current, contraste, focus visible — checklist en commentaire de PR
- [ ] Gouvernance RGESN : analyse bundle jointe, score Ecoindex ≥ B
