# SPEC-012 — Bouton logout (déconnexion Auth.js v5)

**Intent parent** : INTENT-005
**Auteur** : Steeve Evers
**Date** : 2026-04-28
**Statut** : done
**SQS** : 5/5 ✅

---

## 1. Contexte

Les apprenants authentifiés n'ont aucun moyen de se déconnecter de VecteurAcademy. La session Auth.js v5 reste ouverte indéfiniment. Cette SPEC ajoute un bouton "Se déconnecter" visible depuis la navigation principale (Sidebar desktop + MobileNav), implémenté via une Server Action Auth.js v5 et un composant Client dédié.

---

## 2. Comportement Attendu

### Input

- Un apprenant authentifié clique sur le bouton "Se déconnecter"
- Le clic soumet un `<form action={logoutAction}>` (pas de JS client requis)

### Processing

1. La Server Action `logoutAction` est invoquée
2. Elle appelle `signOut({ redirectTo: "/login" })` depuis `@/auth`
3. Auth.js v5 invalide le cookie de session JWT
4. Next.js redirige vers `/login` (via `NEXT_REDIRECT` — la Server Action doit `throw` cette exception, ne pas l'intercepter)

### Output

- La session est détruite (cookie invalidé)
- L'apprenant est redirigé vers `/login`
- Les routes protégées deviennent inaccessibles sans ré-authentification

### Cas limites

1. **JS désactivé** : le `<form>` natif avec `action={logoutAction}` fonctionne en SSR pur — la déconnexion reste opérationnelle (progressive enhancement)
2. **Double clic** : le second clic soumet un formulaire alors que la session est déjà invalide — Auth.js gère silencieusement, la redirection vers `/login` se produit dans les deux cas
3. **Session déjà expirée** : `signOut` sur une session invalide ne lève pas d'erreur — Auth.js nettoie le cookie et redirige normalement
4. **Viewport mobile** : le bouton doit être présent dans le panneau `MobileNav` (masqué en desktop) ET dans la `Sidebar` (masquée en mobile) — pas d'état partagé entre les deux

---

## 3. Critères d'Acceptation

- [ ] Un bouton "Se déconnecter" est visible en bas de la `Sidebar` (desktop, ≥ md)
- [ ] Un bouton "Se déconnecter" est visible en bas du panneau `MobileNav` (mobile, < md)
- [ ] Cliquer le bouton redirige vers `/login` et invalide la session
- [ ] Après déconnexion, naviguer vers `/dashboard` redirige vers `/login` (middleware actif)
- [ ] Le bouton est focusable au clavier et activable avec `Enter`/`Space` (RGAA 11.1)
- [ ] Le bouton a un `aria-label` ou un libellé textuel explicite (RGAA 1.1 / 11.2)
- [ ] `pnpm --filter web build` passe sans erreur TypeScript
- [ ] `pnpm --filter web lint` passe (Biome)

---

## 4. Interface / API

### Server Action (ajout dans `apps/web/app/(auth)/actions.ts`)

```ts
"use server"
import { signOut } from "@/auth"

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" })
  // signOut lance NEXT_REDIRECT — ne pas entourer de try/catch
}
```

### Composant Client (nouveau fichier)

```tsx
// apps/web/components/auth/logout-button.tsx
"use client"

import { logoutAction } from "@/app/(auth)/actions"

export function LogoutButton(): React.JSX.Element {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                   text-gray-700 dark:text-gray-300
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span aria-hidden="true">↩</span>
        <span>Se déconnecter</span>
      </button>
    </form>
  )
}
```

### Intégration Sidebar (bas de `<aside>`, après `<nav>`)

```tsx
// apps/web/components/layout/sidebar.tsx
import { LogoutButton } from "@/components/auth/logout-button"

// Après la balise </nav>, avant </aside> :
<div className="p-4 border-t border-gray-200 dark:border-gray-800">
  <LogoutButton />
</div>
```

### Intégration MobileNav (bas du panneau `#sidebar-nav`)

```tsx
// apps/web/components/layout/mobile-nav.tsx
import { LogoutButton } from "@/components/auth/logout-button"

// En bas de <nav aria-label="Navigation principale">, après le lien "Évaluation finale" :
<div className="border-t border-gray-200 dark:border-gray-800 pt-3">
  <LogoutButton />
</div>
```

---

## 5. Dépendances

- `@/auth` — `signOut` déjà disponible (Auth.js v5, installé en SPEC-009)
- `apps/web/app/(auth)/actions.ts` — fichier existant, ajout de `logoutAction`
- `apps/web/components/layout/sidebar.tsx` — modification (ajout `LogoutButton`)
- `apps/web/components/layout/mobile-nav.tsx` — modification (ajout `LogoutButton`)
- Middleware de protection des routes (SPEC-010) — déjà actif, aucune modification requise

---

## 6. Estimation Context Budget

| Fichier | Tokens estimés |
|---------|---------------|
| AGENT-GUIDE (condensé) | ~400 |
| SPEC-012 (ce fichier) | ~350 |
| `app/(auth)/actions.ts` (existant) | ~80 |
| `sidebar.tsx` (existant) | ~100 |
| `mobile-nav.tsx` (existant) | ~200 |
| `logout-button.tsx` (nouveau) | 0 |
| **Total estimé** | **~1 130** |
| **Total réel projeté (×1.7)** | **~1 920** |

---

## 7. Definition of Output Done (DoOD)

- [x] `apps/web/components/auth/logout-button.tsx` créé
- [x] `logoutAction` ajouté dans `apps/web/app/(auth)/actions.ts`
- [x] `LogoutButton` intégré en bas de `Sidebar` (desktop)
- [x] `LogoutButton` intégré en bas du panneau `MobileNav` (mobile)
- [x] `pnpm --filter web build` passe sans erreur TypeScript
- [x] `pnpm --filter web lint` passe (Biome)
- [x] Test Playwright : clic "Se déconnecter" → redirection `/login` vérifiée
- [x] Test Playwright : après déconnexion, `GET /dashboard` → redirection `/login`
- [x] RGAA : bouton focusable clavier, libellé textuel visible "Se déconnecter"
- [x] RGESN : pas de requête réseau superflue (1 seul appel Server Action par clic)
- [x] SPEC mise à jour si écart constaté (Drift Lock)

---

## 8. Notes de Drift Lock (2026-04-28)

### Écarts mineurs non fonctionnels

- **Commentaire absent** : `// signOut lance NEXT_REDIRECT — ne pas entourer de try/catch` prévu dans la SPEC §4, non produit par l'agent. Impact nul — comportement identique.
- **`test.describe.configure({ mode: "serial" })`** : ajout infra test non prévu dans la SPEC. Justification : les tests logout qui partagent un même token JWT causent une flakiness en exécution parallèle sur le serveur de dev Turbopack. La sérialisation du bloc parent résout le problème.

### Fichiers hors périmètre SPEC-012 inclus dans la PR

- `apps/web/auth.ts` — correctif `session.user.id = token.sub as string` : Auth.js v5 beta.31 ne propage pas automatiquement `token.sub` vers `session.user.id` lorsqu'un callback `session` personnalisé est défini. Découvert lors de l'exécution de SPEC-012 (le dashboard progression ne fonctionnait pas). Correctif minimal, aucun impact sur SPEC-012.
- `apps/web/lib/types/next-auth.d.ts` — ajout de `id: string` dans `Session.user` pour aligner les types TypeScript avec le comportement runtime.
