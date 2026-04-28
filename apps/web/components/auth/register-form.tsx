"use client"

import { registerAction } from "@/app/(auth)/actions"
import { registerSchema } from "@/lib/schemas/auth"
import { useActionState, useState } from "react"

type FieldErrors = {
  email?: string
  esn_name?: string
  password?: string
  confirmPassword?: string
}

export function RegisterForm() {
  const [serverState, formAction, isPending] = useActionState(registerAction, null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function validateClient(event: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(event.currentTarget)
    const result = registerSchema.safeParse({
      email: fd.get("email"),
      esn_name: fd.get("esn_name"),
      password: fd.get("password"),
      confirmPassword: fd.get("confirmPassword"),
    })

    if (!result.success) {
      event.preventDefault()
      const errs: FieldErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors
        if (!errs[key]) errs[key] = issue.message
      }
      setFieldErrors(errs)
    } else {
      setFieldErrors({})
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

  return (
    <form action={formAction} onSubmit={validateClient} noValidate>
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
            className={inputClass}
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
            htmlFor="esn_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Nom de l&apos;ESN
          </label>
          <input
            id="esn_name"
            name="esn_name"
            type="text"
            autoComplete="organization"
            required
            className={inputClass}
            aria-invalid={fieldErrors.esn_name ? true : undefined}
            aria-describedby={fieldErrors.esn_name ? "esn-name-error" : undefined}
          />
          {fieldErrors.esn_name && (
            <p
              id="esn-name-error"
              role="alert"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {fieldErrors.esn_name}
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
            autoComplete="new-password"
            required
            className={inputClass}
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
            aria-invalid={fieldErrors.confirmPassword ? true : undefined}
            aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
          />
          {fieldErrors.confirmPassword && (
            <p
              id="confirm-password-error"
              role="alert"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {fieldErrors.confirmPassword}
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
          {isPending ? "Création en cours…" : "Créer mon compte"}
        </button>
      </div>
    </form>
  )
}
