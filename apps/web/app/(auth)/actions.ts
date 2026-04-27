"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

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
