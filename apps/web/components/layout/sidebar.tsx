import type { ModuleMetadata } from "@formations-ia/shared-types"
import Link from "next/link"

interface SidebarProps {
  modules: ModuleMetadata[]
  currentPath: string
}

export function Sidebar({ modules, currentPath }: SidebarProps): React.JSX.Element {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "VecteurAcademy"

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 min-h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link
          href="/dashboard"
          className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
        >
          {appName}
        </Link>
      </div>
      <nav
        aria-label="Navigation principale"
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
      >
        {modules.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
            Aucun module disponible
          </p>
        ) : (
          <ul className="space-y-1">
            {modules.map((module) => {
              const href = `/modules/${module.slug}`
              const isActive = currentPath === href
              return (
                <li key={module.id}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0"
                    />
                    <span className="truncate">{module.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
          <Link
            href="/evaluation-finale"
            aria-current={currentPath === "/evaluation-finale" ? "page" : undefined}
            className={[
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              currentPath === "/evaluation-finale"
                ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
            ].join(" ")}
          >
            <span aria-hidden="true" className="text-base">
              🎓
            </span>
            <span>Évaluation finale</span>
          </Link>
        </div>
      </nav>
    </aside>
  )
}
