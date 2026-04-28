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
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
            cache: "no-store",
          })

          if (!res.ok) return null

          const user = await res.json()
          return { id: user.id, email: user.email, role: user.role, esn_name: user.esn_name }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.esn_name = (user as { esn_name: string }).esn_name
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub as string
      session.user.role = token.role as string
      session.user.esn_name = token.esn_name as string
      return session
    },
  },
  pages: { signIn: "/login" },
})
