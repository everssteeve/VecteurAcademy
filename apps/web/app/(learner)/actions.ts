"use server"

import { auth } from "@/auth"

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const API_URL = rawApiUrl.startsWith("http") ? rawApiUrl : `https://${rawApiUrl}`

export async function markModuleStartedAction(moduleId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return
  try {
    await fetch(`${API_URL}/progress/module`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: session.user.id, module_id: moduleId }),
    })
  } catch {
    // fire & forget — page renders regardless
  }
}

interface QuizAnswer {
  question_id: string
  selected_option: string
  is_correct: boolean
}

export async function saveModuleQuizResultAction(
  moduleId: string,
  score: number,
  maxScore: number,
  answers: QuizAnswer[]
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return
  try {
    await fetch(`${API_URL}/quiz/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: session.user.id,
        quiz_type: "module",
        module_id: moduleId,
        score,
        max_score: maxScore,
        answers,
      }),
    })
  } catch {
    // best-effort persistence
  }
}

export async function saveFinalQuizResultAction(
  score: number,
  answers: QuizAnswer[]
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return
  try {
    await fetch(`${API_URL}/quiz/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: session.user.id,
        quiz_type: "final",
        module_id: null,
        score,
        max_score: 18,
        answers,
      }),
    })
  } catch {
    // best-effort persistence
  }
}
