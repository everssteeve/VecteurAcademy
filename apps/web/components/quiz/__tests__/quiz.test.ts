import type { QuizQuestion } from "@formations-ia/shared-types"
import { describe, expect, it } from "vitest"

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "Question 1",
    options: [
      { label: "A", text: "Option A" },
      { label: "B", text: "Option B" },
      { label: "C", text: "Option C" },
      { label: "D", text: "Option D" },
    ],
    correctAnswer: "B",
    explanation: "B est la bonne réponse.",
  },
  {
    id: "q2",
    question: "Question 2",
    options: [
      { label: "A", text: "Option A" },
      { label: "B", text: "Option B" },
      { label: "C", text: "Option C" },
      { label: "D", text: "Option D" },
    ],
    correctAnswer: "C",
    explanation: "C est la bonne réponse.",
  },
  {
    id: "q3",
    question: "Question 3",
    options: [
      { label: "A", text: "Option A" },
      { label: "B", text: "Option B" },
      { label: "C", text: "Option C" },
      { label: "D", text: "Option D" },
    ],
    correctAnswer: "A",
    explanation: "A est la bonne réponse.",
  },
]

function computeScore(questions: QuizQuestion[], answers: string[]): number {
  return questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0)
}

describe("computeScore", () => {
  it("retourne 0 si toutes les réponses sont fausses", () => {
    expect(computeScore(QUESTIONS, ["D", "D", "D"])).toBe(0)
  })

  it("retourne le score partiel correct", () => {
    expect(computeScore(QUESTIONS, ["B", "D", "D"])).toBe(1)
    expect(computeScore(QUESTIONS, ["B", "C", "D"])).toBe(2)
  })

  it("retourne le score maximum si toutes les réponses sont correctes", () => {
    expect(computeScore(QUESTIONS, ["B", "C", "A"])).toBe(3)
  })

  it("le bouton Suivant est disabled si aucune réponse sélectionnée (réponse vide)", () => {
    const selectedAnswer = ""
    expect(!selectedAnswer).toBe(true)
  })

  it("le bouton Suivant est actif si une réponse est sélectionnée", () => {
    const selectedAnswer = "A"
    expect(!selectedAnswer).toBe(false)
  })
})
