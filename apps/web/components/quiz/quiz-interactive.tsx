"use client"

import { saveModuleQuizResultAction } from "@/app/(learner)/actions"
import type { QuizQuestion } from "@formations-ia/shared-types"
import { useState } from "react"

type QuizState =
  | { status: "answering"; currentQuestion: number; answers: string[] }
  | { status: "completed"; score: number; answers: string[] }

interface QuizInteractiveProps {
  questions: QuizQuestion[]
  moduleId?: string
}

export function QuizInteractive({ questions, moduleId }: QuizInteractiveProps): React.JSX.Element {
  const [state, setState] = useState<QuizState>({
    status: "answering",
    currentQuestion: 0,
    answers: [],
  })

  function restart() {
    setState({ status: "answering", currentQuestion: 0, answers: [] })
  }

  if (state.status === "completed") {
    return (
      <QuizResults
        questions={questions}
        score={state.score}
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
    if (isLast) {
      const nextAnswers = [...answers]
      const score = questions.reduce(
        (acc, q, i) => acc + (nextAnswers[i] === q.correctAnswer ? 1 : 0),
        0
      )
      if (moduleId) {
        const answersPayload = questions.map((q, i) => ({
          question_id: q.id,
          selected_option: nextAnswers[i] ?? "",
          is_correct: nextAnswers[i] === q.correctAnswer,
        }))
        saveModuleQuizResultAction(moduleId, score, questions.length, answersPayload).catch(
          () => {}
        )
      }
      setState({ status: "completed", score, answers: nextAnswers })
    } else {
      setState({ status: "answering", currentQuestion: currentQuestion + 1, answers })
    }
  }

  return (
    <section
      data-testid="quiz"
      aria-label="Quiz de fin de module"
      className="mt-12 border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-900"
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
                name={`question-${question.id}`}
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
        {isLast ? "Terminer le quiz" : "Suivant"}
      </button>
    </section>
  )
}

interface QuizResultsProps {
  questions: QuizQuestion[]
  score: number
  answers: string[]
  onRestart: () => void
}

function QuizResults({
  questions,
  score,
  answers,
  onRestart,
}: QuizResultsProps): React.JSX.Element {
  const isPerfect = score === questions.length

  return (
    <section
      data-testid="quiz"
      aria-label="Quiz de fin de module"
      className="mt-12 border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-900"
    >
      <output className="block text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        {isPerfect ? "Parfait !" : "Quiz terminé"}
      </output>
      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">
        Score : {score} / {questions.length}
      </p>
      <div aria-live="polite" className="space-y-4">
        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.correctAnswer
          return (
            <div
              key={q.id}
              className={`rounded-lg border p-4 ${isCorrect ? "border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-700" : "border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-700"}`}
            >
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                <span
                  className={`mr-2 ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {isCorrect ? "✓" : "✗"}
                </span>
                {q.question}
              </p>
              {!isCorrect && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Votre réponse : <span className="font-medium">{answers[i]}</span> — Bonne réponse
                  : <span className="font-medium">{q.correctAnswer}</span>
                </p>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">{q.explanation}</p>
            </div>
          )
        })}
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="mt-6 px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
      >
        Recommencer
      </button>
    </section>
  )
}
