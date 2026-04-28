import { RegisterForm } from "@/components/auth/register-form"

export const metadata = {
  title: "Inscription — VecteurAcademy",
}

export default function RegisterPage() {
  return (
    <main id="main-content">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Créer un compte</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Rejoignez VecteurAcademy pour suivre votre progression
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Vous avez déjà un compte ?{" "}
        <a
          href="/login"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          Se connecter
        </a>
      </p>
    </main>
  )
}
