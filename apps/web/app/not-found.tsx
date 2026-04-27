import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Page introuvable</h1>
      <p className="text-gray-600 dark:text-gray-300 max-w-md">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-800 focus:outline-none"
      >
        Retour au tableau de bord
      </Link>
    </div>
  )
}
