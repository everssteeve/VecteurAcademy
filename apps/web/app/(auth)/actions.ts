"use server"

import { signIn, signOut } from "@/auth"
import { registerSchema } from "@/lib/schemas/auth"
import { AuthError } from "next-auth"

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" })
}

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const rawCallbackUrl = formData.get("callbackUrl")?.toString() ?? ""
  const callbackUrl = rawCallbackUrl.startsWith("/") ? rawCallbackUrl : "/dashboard"

  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: callbackUrl,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Identifiants invalides. Vérifiez votre email et mot de passe." }
    }
    throw error
  }
  return null
}

export async function registerAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    esn_name: formData.get("esn_name"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: parsed.data.email,
      password: parsed.data.password,
      esn_name: parsed.data.esn_name,
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    if (res.status === 409) return { error: "Cette adresse email est déjà utilisée." }
    return { error: "Erreur lors de la création du compte. Réessayez." }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Erreur d'authentification après inscription. Réessayez." }
    }
    throw error
  }
  return null
}
