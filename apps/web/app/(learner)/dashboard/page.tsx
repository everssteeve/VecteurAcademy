import { getAllModules } from "../../../lib/module-registry"

export const metadata = {
  title: "Tableau de bord — VecteurAcademy",
}

export default async function DashboardPage() {
  const modules = await getAllModules()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mes modules</h1>

      {modules.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Aucun module disponible.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <li key={module.id}>
              <a
                href={`/modules/${module.slug}`}
                className="block h-full p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="font-semibold text-gray-900 dark:text-white leading-snug">
                    {module.title}
                  </h2>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {module.duration} min
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                  {module.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {module.audience.map((a) => (
                      <span
                        key={a}
                        className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Non commencé</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
