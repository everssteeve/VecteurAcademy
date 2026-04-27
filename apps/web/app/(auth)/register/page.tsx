export const metadata = {
  title: "Inscription — VecteurAcademy",
}

export default function RegisterPage() {
  return (
    <main id="main-content">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Créer un compte</h1>
      </div>

      <div
        role="alert"
        aria-live="polite"
        className="p-4 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm text-center"
      >
        Inscription temporairement indisponible — fonctionnalité à venir
      </div>

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
