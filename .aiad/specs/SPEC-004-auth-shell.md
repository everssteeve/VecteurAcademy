# SPEC-004-auth-shell

**Intent parent** : INTENT-001-skeleton-navigation-modulaire
**Auteur** : Steeve Evers (PE)
**Date** : 2026-04-27
**Statut** : draft
**SQS** : À évaluer via /sdd-gate

---

## 1. Contexte

Les routes `/dashboard` et `/modules/[slug]` doivent être protégées. Cette SPEC installe Auth.js v5 (NextAuth), configure le JWT partagé avec l'API FastAPI, et crée les pages `/login` et `/register` — sans logique de persistance utilisateur en base à ce stade (la table `users` et les endpoints backend seront l'objet d'une SPEC ultérieure). L'objectif est d'avoir un périmètre d'authentification fonctionnel côté frontend.

## 2. Comportement Attendu

### Input

- Credentials : email (string, format email) + mot de passe (string, min 8 chars) soumis via formulaire
- Variable d'environnement `JWT_SECRET` (string, min 32 chars)
- Variable d'environnement `NEXTAUTH_URL` (ex: `http://localhost:3000`)

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
   - Validation client Zod (email format, password min 8)
   - Affichage d'erreur accessible : `role="alert"` sur le message d'erreur, `aria-invalid="true"` sur le champ concerné
   - `<form>` avec `action` server action Auth.js (pas de JS requis pour la soumission de base)

5. **Page `/register`** (`apps/web/app/(auth)/register/page.tsx`) :
   - Formulaire : email, password, confirmation password
   - Validation client Zod
   - Affiche un message "Inscription temporairement indisponible — fonctionnalité à venir" (stub visible)
   - La soumission ne fait rien (pas de backend à ce stade) — ne pas silencieusement ignorer, afficher le message stub

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

- [ ] Accéder à `/dashboard` sans session → redirigé vers `/login`
- [ ] Connexion avec email valide + password ≥ 8 chars → session créée, redirection vers `/dashboard`
- [ ] JWT décodable dans un Server Component via `auth()` avec `{ sub, email, role }`
- [ ] Page `/login` navigable au clavier sans piège de focus
- [ ] Message d'erreur de validation affiché avec `role="alert"` (testé via Playwright + jest-axe)
- [ ] Page `/register` affiche le message stub "fonctionnalité à venir" visible
- [ ] `pnpm --filter web typecheck` passing avec les types Auth.js v5
- [ ] `JWT_SECRET` absent → `next dev` log une erreur explicite au démarrage

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

// apps/web/middleware.ts
export { auth as middleware } from "@/auth";
export const config = {
  matcher: ["/dashboard/:path*", "/modules/:path*"],
};
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

- [ ] Code implémenté (`auth.ts`, `middleware.ts`, pages login/register) et lint passing
- [ ] `pnpm --filter web typecheck` passing
- [ ] Tests Playwright : redirect non-auth, connexion stub, session persistée, page register stub
- [ ] Tests jest-axe : formulaire login (aria-invalid, role="alert", labels associés)
- [ ] SPEC mise à jour si écart découvert (Drift Lock)
- [ ] Code review passée (1 approval minimum)
- [ ] Gouvernance RGPD : aucune donnée personnelle persistée en base à ce stade (stub) — documenté dans la SPEC
- [ ] Gouvernance RGAA : formulaires avec labels explicites, erreurs accessibles, focus visible
