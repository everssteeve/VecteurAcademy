import { LoginForm } from "./login-form"

export const metadata = {
  title: "Connexion — VecteurAcademy",
}

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  const callbackUrl = params.callbackUrl ?? "/dashboard"

  return (
    <main id="main-content">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Accédez à votre espace de formation
        </p>
      </div>

      <LoginForm callbackUrl={callbackUrl} />

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Pas encore de compte ?{" "}
        <a
          href="/register"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          Créer un compte
        </a>
      </p>
    </main>
  )
}
