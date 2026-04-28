import { auth } from "@/auth"
import { getCertificationLevel } from "@formations-ia/shared-types"
import { getAllModules } from "../../../lib/module-registry"

export const metadata = {
  title: "Tableau de bord — VecteurAcademy",
}

interface ModuleProgressItem {
  module_id: string
  completed_at: string | null
}

interface QuizResultItem {
  quiz_type: string
  module_id: string | null
  score: number
  max_score: number
  answered_at: string
}

export default async function DashboardPage() {
  const session = await auth()
  const modules = await getAllModules()

  let moduleProgress: ModuleProgressItem[] = []
  let quizResults: QuizResultItem[] = []

  if (session?.user?.id) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/progress?user_id=${session.user.id}`,
        { cache: "no-store" }
      )
      if (res.ok) {
        const data = await res.json()
        moduleProgress = data.module_progress ?? []
        quizResults = data.quiz_results ?? []
      }
    } catch {
      // dégradation gracieuse — tous les modules affichent "Non commencé"
    }
  }

  function getModuleStatus(slug: string): { label: string; score?: string } {
    const progress = moduleProgress.find((p) => p.module_id === slug)
    if (!progress) return { label: "Non commencé" }
    if (progress.completed_at) {
      const result = quizResults.find((r) => r.quiz_type === "module" && r.module_id === slug)
      if (result) {
        const pct = Math.round((result.score / result.max_score) * 100)
        return { label: "Terminé", score: `${result.score}/${result.max_score} (${pct}%)` }
      }
      return { label: "Terminé" }
    }
    return { label: "En cours" }
  }

  const finalAttempts = quizResults.filter((r) => r.quiz_type === "final")

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mes modules</h1>

      {modules.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Aucun module disponible.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const { label, score } = getModuleStatus(module.slug)
            return (
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
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {label}
                      {score ? ` · ${score}` : ""}
                    </span>
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      )}

      <section aria-labelledby="final-quiz-heading" className="mt-10">
        <h2
          id="final-quiz-heading"
          className="text-xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Évaluation finale
        </h2>
        {finalAttempts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Pas encore de tentative à l&apos;évaluation finale.
          </p>
        ) : (
          <ul className="space-y-2">
            {finalAttempts.map((attempt) => {
              const level = getCertificationLevel(attempt.score)
              const date = new Date(attempt.answered_at).toLocaleDateString("fr-FR", {
                dateStyle: "medium",
              })
              return (
                <li
                  key={attempt.answered_at}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[7rem]">
                    {date}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {attempt.score}/{attempt.max_score}
                  </span>
                  <span className="text-sm">
                    {level.emoji} {level.label}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
