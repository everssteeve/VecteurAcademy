import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { loginSchema } from "./lib/schemas/auth"

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error(
    "[VecteurAcademy] JWT_SECRET manquant — définir cette variable d'environnement avant de démarrer."
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: jwtSecret,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null
        // Stub: validation format only — backend auth implemented in future SPEC (auth backend)
        return { id: "stub-id", email: parsed.data.email, role: "learner" }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role: string }).role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      return session
    },
  },
  pages: { signIn: "/login" },
})
