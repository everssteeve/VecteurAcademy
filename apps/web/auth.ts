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

        try {
          const rawUrl = process.env.NEXT_PUBLIC_API_URL ?? ""
          const apiUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
            cache: "no-store",
          })

          if (!res.ok) return null

          const user = await res.json()
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name ?? null,
            last_name: user.last_name ?? null,
            esn_name: user.esn_name,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as {
          role: string
          first_name: string | null
          last_name: string | null
          esn_name: string
        }
        token.role = u.role
        token.first_name = u.first_name
        token.last_name = u.last_name
        token.esn_name = u.esn_name
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub as string
      session.user.role = token.role as string
      session.user.first_name = (token.first_name as string | null) ?? null
      session.user.last_name = (token.last_name as string | null) ?? null
      session.user.esn_name = token.esn_name as string
      return session
    },
  },
  pages: { signIn: "/login" },
})
