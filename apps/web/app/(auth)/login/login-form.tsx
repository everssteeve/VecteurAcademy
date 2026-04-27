"use client"

import { loginSchema } from "@/lib/schemas/auth"
import { useActionState, useState } from "react"
import { loginAction } from "../actions"

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [serverState, formAction, isPending] = useActionState(loginAction, null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  function validateClient(event: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(event.currentTarget)
    const result = loginSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    })

    if (!result.success) {
      event.preventDefault()
      const errs: { email?: string; password?: string } = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as "email" | "password"
        if (!errs[key]) errs[key] = issue.message
      }
      setFieldErrors(errs)
    } else {
      setFieldErrors({})
    }
  }

  return (
    <form action={formAction} onSubmit={validateClient} noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Adresse email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
          {fieldErrors.password && (
            <p
              id="password-error"
              role="alert"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {fieldErrors.password}
            </p>
          )}
        </div>

        {serverState?.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 text-center">
            {serverState.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {isPending ? "Connexion en cours…" : "Se connecter"}
        </button>
      </div>
    </form>
  )
}
