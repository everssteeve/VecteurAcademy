import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role: string
    esn_name: string
  }
  interface Session {
    user: {
      id: string
      role: string
      esn_name: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    esn_name: string
  }
}
