# SPEC-004-auth-shell

**Intent parent** : INTENT-001-skeleton-navigation-modulaire
**Auteur** : Steeve Evers (PE)
**Date** : 2026-04-27
**Statut** : done
**SQS** : 5/5 ✅ (Execution Gate passée le 2026-04-27)

---

## 1. Contexte

Les routes `/dashboard` et `/modules/[slug]` doivent être protégées. Cette SPEC installe Auth.js v5 (NextAuth), configure le JWT partagé avec l'API FastAPI, et crée les pages `/login` et `/register` — sans logique de persistance utilisateur en base à ce stade (la table `users` et les endpoints backend seront l'objet d'une SPEC ultérieure). L'objectif est d'avoir un périmètre d'authentification fonctionnel côté frontend.

## 2. Comportement Attendu

### Input

- Credentials : email (string, format email) + mot de passe (string, min 8 chars) soumis via formulaire
- Variable d'environnement `JWT_SECRET` (string, min 32 chars)
- Variable d'environnement `AUTH_URL` (ex: `http://localhost:3000`) — Auth.js v5 (alias `NEXTAUTH_URL` conservé pour compat)
- Variable d'environnement `AUTH_TRUST_HOST=true` — requis pour environnements non-HTTPS (dev local, Railway)

### Processing

1. **Installation Auth.js v5** (`apps/web/`) :
   - Installer `next-auth@beta`
   - Créer `apps/web/auth.ts` — configuration Auth.js avec provider `Credentials`
   - Créer `apps/web/app/api/auth/[...nextauth]/route.ts` — handler Auth.js

2. **Provider Credentials (stub)** :
   - `authorize()` accepte tout email/password valide côté format pour le skeleton (pas d'appel API backend)
   - Retourne un objet `User` minimaliste `{ id, email, role: 'learner' }`
   - La validation réelle contre la base sera implémentée dans une SPEC ultérieure (auth backend)
   - JWT encode `{ sub: user.id, email, role }` avec `JWT_SECRET`

3. **Middleware de protection** (`apps/web/middleware.ts`) :
   - Protect : `/dashboard`, `/modules/:path*`
   - Public : `/login`, `/register`, `/`, `/api/auth/:path*`
   - Redirect non authentifié → `/login?callbackUrl=<url>`
   - Redirect authentifié accédant `/login` → `/dashboard`

4. **Page `/login`** (`apps/web/app/(auth)/login/page.tsx`) :
   - Formulaire : champ email (type email, autocomplete="email"), champ password (type password, autocomplete="current-password"), bouton "Se connecter"
   - Validation client Zod via `useActionState` + `onSubmit` (React 19) — nécessite JS
   - Affichage d'erreur accessible : `role="alert"` sur le message d'erreur, `aria-invalid="true"` sur le champ concerné
   - Server action `loginAction` dans `app/(auth)/actions.ts` — `signIn("credentials", { redirectTo: callbackUrl })`
   - Note : progressive enhancement "sans JS" non implémenté — voir Human Learning AGENT-GUIDE 2026-04-27

5. **Page `/register`** (`apps/web/app/(auth)/register/page.tsx`) :
   - Page stub uniquement — aucun formulaire (formulaire non pertinent sans backend)
   - Affiche le message "Inscription temporairement indisponible — fonctionnalité à venir" avec `role="alert"` + `aria-live="polite"`
   - Lien retour vers `/login`

6. **Session côté client** :
   - `SessionProvider` dans le layout `(auth)` ou root layout
   - Hook `useSession()` disponible pour les composants client (ex: affichage email dans la sidebar)

### Output

- Routes protégées : un utilisateur non connecté accédant à `/dashboard` est redirigé vers `/login`
- Après connexion avec credentials valides (format), redirection vers `callbackUrl` ou `/dashboard`
- JWT disponible dans les Server Components via `auth()` (Auth.js v5 API)

### Cas limites

- Email invalide (format) soumis : message d'erreur inline sur le champ, pas de soumission
- Password < 8 chars : message d'erreur inline, pas de soumission
- JWT_SECRET absent : `next build` échoue avec erreur explicite (vérification au démarrage via `env.mjs` ou assertion)
- Session expirée : middleware redirige vers `/login` avec `callbackUrl` préservé
- Accès direct à `/api/auth/session` sans credentials : retourne `null` (comportement Auth.js standard)
- `callbackUrl` contenant un domaine externe (open redirect) : Auth.js valide les callbackUrl relatives uniquement

## 3. Critères d'Acceptation

- [x] Accéder à `/dashboard` sans session → redirigé vers `/login`
- [x] Connexion avec email valide + password ≥ 8 chars → session créée, redirection vers `/dashboard`
- [x] JWT décodable dans un Server Component via `auth()` avec `{ sub, email, role }`
- [x] Page `/login` navigable au clavier sans piège de focus
- [x] Message d'erreur de validation affiché avec `role="alert"` (testé via Playwright)
- [x] Page `/register` affiche le message stub "fonctionnalité à venir" visible
- [x] `pnpm --filter web typecheck` passing avec les types Auth.js v5
- [x] `JWT_SECRET` absent → erreur explicite au démarrage (`throw Error`)

## 4. Interface / API

```typescript
// apps/web/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // Stub : validation format uniquement (backend dans SPEC ultérieure)
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        return { id: "stub-id", email: parsed.data.email, role: "learner" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role: string }).role;
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: { signIn: "/login" },
});

// apps/web/middleware.ts — pattern custom (gère protect + redirect depuis /login)
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user
  const { pathname } = req.nextUrl
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/modules")

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search)
    return Response.redirect(loginUrl)
  }
  if (pathname === "/login" && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/modules/:path*", "/login"],
}
```

```typescript
// Schéma Zod partagé — apps/web/lib/schemas/auth.ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(8),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});
```

## 5. Dépendances

- **SPEC-001** (monorepo bootstrap) — prérequis bloquant
- **SPEC-003** (navigation shell) — indépendante en développement, mais le middleware protège les routes créées en SPEC-003
- Packages à ajouter : `next-auth@beta`, `zod` (déjà présent via SPEC-002)
- SPEC ultérieure (auth backend) : implémentera `authorize()` avec appel API FastAPI + validation en base

## 6. Estimation Context Budget

**Contexte à injecter pour cette tâche :**
- AGENT-GUIDE (condensé) : ~200 tokens
- ARCHITECTURE.md §8 (sécurité) : ~200 tokens
- ARCHITECTURE.md §9 RGAA (formulaires accessibles) : ~200 tokens
- Cette SPEC : ~450 tokens
- Fichiers source pertinents : `apps/web/middleware.ts` (à créer), `apps/web/auth.ts` (à créer)
- **Total estimé** : ~1 050 tokens

## 7. Definition of Output Done (DoOD)

- [x] Code implémenté (`auth.ts`, `middleware.ts`, pages login/register) et lint passing
- [x] `pnpm --filter web typecheck` passing
- [x] Tests Playwright : redirect non-auth, connexion stub, session persistée, page register stub — 27/27 ✅
- [x] Tests accessibilité Playwright (aria-invalid, role="alert", labels associés) — jest-axe remplacé par Playwright (Human Learning #3)
- [x] SPEC mise à jour (écarts documentés)
- [ ] Code review passée (1 approval minimum) — en attente
- [x] Gouvernance RGPD : aucune donnée personnelle persistée en base à ce stade (stub) — confirmé
- [x] Gouvernance RGAA : formulaires avec labels explicites, erreurs accessibles, focus visible — confirmé

## 8. Notes de Drift Check (2026-04-27)

### Drifts intentionnels documentés

**Drift A — Middleware pattern**
- Spécifié : `export { auth as middleware }` avec matcher 2 routes
- Implémenté : `auth((req) => {...})` avec matcher 3 routes (+ `/login`)
- Raison : le pattern custom est nécessaire pour couvrir les 2 comportements (protect + redirect depuis /login). Le snippet Interface §4 a été mis à jour.

**Drift B — Page `/register` sans formulaire**
- Spécifié : "Formulaire : email, password, confirmation password" + message stub
- Implémenté : message stub uniquement, pas de formulaire
- Raison : un formulaire sans backend n'apporte rien et induirait l'utilisateur en erreur. Le message stub satisfait l'intention.

**Drift C — Variables d'environnement Auth.js v5**
- Spécifié : `JWT_SECRET` + `NEXTAUTH_URL`
- Implémenté : + `AUTH_URL` + `AUTH_TRUST_HOST=true` (requis par next-auth@beta)
- Raison : Auth.js v5 a changé ses variables d'environnement. `.env.example` et Input §2 mis à jour.

**Drift D — Layout refactor (non prévu)**
- `apps/web/app/layout.tsx` : AppShell retiré → AuthSessionProvider ajouté
- `apps/web/app/(learner)/layout.tsx` : nouveau fichier portant l'AppShell
- Raison : nécessaire pour que les pages `/login` et `/register` s'affichent sans sidebar.
