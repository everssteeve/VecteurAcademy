"use client"

import { saveFinalQuizResultAction } from "@/app/(learner)/actions"
import { getCertificationLevel } from "@formations-ia/shared-types"
import type { CertificationLevel, QuizQuestion } from "@formations-ia/shared-types"
import { useState } from "react"

type FinalQuizState =
  | { status: "intro" }
  | { status: "answering"; currentQuestion: number; answers: string[] }
  | { status: "completed"; totalScore: number; answers: string[] }

interface ModuleBilan {
  moduleTitle: string
  score: number
  retravaillerSi: string
}

const MODULE_BILANS: Omit<ModuleBilan, "score">[] = [
  {
    moduleTitle: "Module 1 — L'ère de l'AI Engineering",
    retravaillerSi: "Revoir les 5 concepts clés et les trois couches du stack",
  },
  {
    moduleTitle: "Module 2 — Foundation Models",
    retravaillerSi: "Revoir RLHF, nature probabiliste, outputs structurés",
  },
  {
    moduleTitle: "Module 3 — Évaluer et choisir",
    retravaillerSi: "Revoir LLM-as-judge, Build/Buy, pipeline d'eval",
  },
  {
    moduleTitle: "Module 4 — Prompt Engineering",
    retravaillerSi: "Revoir versioning, system prompt, few-shot",
  },
  {
    moduleTitle: "Module 5 — RAG & Agents",
    retravaillerSi: "Revoir chunking, failure modes, full context vs RAG",
  },
  {
    moduleTitle: "Module 6 — Production",
    retravaillerSi: "Revoir monitoring, latence, enrichissement contexte",
  },
]

interface FinalQuizProps {
  questions: QuizQuestion[]
}

export function FinalQuiz({ questions }: FinalQuizProps): React.JSX.Element {
  const [state, setState] = useState<FinalQuizState>({ status: "intro" })

  function start() {
    setState({ status: "answering", currentQuestion: 0, answers: [] })
  }

  function restart() {
    setState({ status: "intro" })
  }

  if (state.status === "intro") {
    return <QuizIntro onStart={start} />
  }

  if (state.status === "completed") {
    return (
      <QuizResults
        questions={questions}
        totalScore={state.totalScore}
        answers={state.answers}
        onRestart={restart}
      />
    )
  }

  const { currentQuestion, answers } = state
  const question = questions[currentQuestion]
  const isLast = currentQuestion === questions.length - 1
  const selectedAnswer = answers[currentQuestion] ?? ""

  function handleSelect(value: string) {
    const next = [...answers]
    next[currentQuestion] = value
    setState({ status: "answering", currentQuestion, answers: next })
  }

  function handleNext() {
    if (!selectedAnswer) return
    const nextAnswers = [...answers]
    if (isLast) {
      const totalScore = questions.reduce(
        (acc, q, i) => acc + (nextAnswers[i] === q.correctAnswer ? 1 : 0),
        0
      )
      const answersPayload = questions.map((q, i) => ({
        question_id: q.id,
        selected_option: nextAnswers[i] ?? "",
        is_correct: nextAnswers[i] === q.correctAnswer,
      }))
      saveFinalQuizResultAction(totalScore, answersPayload).catch(() => {})
      setState({ status: "completed", totalScore, answers: nextAnswers })
    } else {
      setState({ status: "answering", currentQuestion: currentQuestion + 1, answers: nextAnswers })
    }
  }

  return (
    <section
      aria-label="Évaluation finale — question en cours"
      className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-900"
    >
      <p aria-live="polite" className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
        Question {currentQuestion + 1} / {questions.length}
      </p>
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {question.question}
        </legend>
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option.label}
              className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-white dark:hover:bg-gray-800 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-950/30"
            >
              <input
                type="radio"
                name={`final-question-${question.id}`}
                value={option.label}
                checked={selectedAnswer === option.label}
                onChange={() => handleSelect(option.label)}
                className="mt-0.5 shrink-0 accent-blue-600"
              />
              <span className="text-sm text-gray-800 dark:text-gray-200">
                <span className="font-medium">{option.label})</span> {option.text}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        onClick={handleNext}
        disabled={!selectedAnswer}
        className="mt-6 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isLast ? "Terminer l'évaluation" : "Suivant"}
      </button>
    </section>
  )
}

function QuizIntro({ onStart }: { onStart: () => void }): React.JSX.Element {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-8 bg-gray-50 dark:bg-gray-900 text-center">
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        18 questions · 1 point par bonne réponse
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">Durée indicative : 35 minutes</p>
      <button
        type="button"
        onClick={onStart}
        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
      >
        Commencer l'évaluation
      </button>
    </div>
  )
}

interface QuizResultsProps {
  questions: QuizQuestion[]
  totalScore: number
  answers: string[]
  onRestart: () => void
}

function QuizResults({
  questions,
  totalScore,
  answers,
  onRestart,
}: QuizResultsProps): React.JSX.Element {
  const level: CertificationLevel = getCertificationLevel(totalScore)

  const moduleBilans: ModuleBilan[] = MODULE_BILANS.map((m, i) => ({
    ...m,
    score: answers
      .slice(i * 3, i * 3 + 3)
      .filter((ans, j) => ans === questions[i * 3 + j]?.correctAnswer).length,
  }))

  return (
    <div className="space-y-8">
      <section
        aria-label="Résultat de l'évaluation finale"
        className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-900"
      >
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          Score : {totalScore} / 18
        </p>
        <output
          aria-live="polite"
          className="block mt-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-2xl mb-1">
            {level.emoji}{" "}
            <span className="font-bold text-gray-900 dark:text-white">{level.label}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{level.description}</p>
        </output>
      </section>

      <section aria-labelledby="bilan-heading">
        <h2 id="bilan-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Bilan par module
        </h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  Module
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-700 dark:text-gray-300 w-20">
                  Score
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  Recommandation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {moduleBilans.map((bilan) => (
                <tr key={bilan.moduleTitle}>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                    {bilan.moduleTitle}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    <span
                      className={
                        bilan.score >= 2
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }
                    >
                      {bilan.score}/3
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {bilan.score < 2 ? bilan.retravaillerSi : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="corrections-heading">
        <h2
          id="corrections-heading"
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Corrections détaillées
        </h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctAnswer
            return (
              <div
                key={q.id}
                className={`rounded-lg border p-4 ${
                  isCorrect
                    ? "border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-700"
                    : "border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-700"
                }`}
              >
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  <span
                    aria-hidden="true"
                    className={`mr-2 ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {isCorrect ? "✓" : "✗"}
                  </span>
                  {q.question}
                </p>
                {!isCorrect && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Votre réponse : <span className="font-medium">{answers[i]}</span> — Bonne
                    réponse : <span className="font-medium">{q.correctAnswer}</span>
                  </p>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">{q.explanation}</p>
              </div>
            )
          })}
        </div>
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        Recommencer
      </button>
    </div>
  )
}
