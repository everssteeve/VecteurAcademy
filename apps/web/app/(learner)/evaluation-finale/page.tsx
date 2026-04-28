import { FinalQuiz } from "@/components/quiz/final-quiz"
import { finalQuizQuestions } from "./questions"

export const metadata = {
  title: "Évaluation finale — Certification AI Engineering ESN",
}

export default function EvaluationFinalePage() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Évaluation finale — Certification AI Engineering ESN
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Durée indicative : <span className="font-medium">35 minutes</span>
      </p>
      <FinalQuiz questions={finalQuizQuestions} />
    </main>
  )
}
