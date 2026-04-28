export interface QuizQuestion {
  id: string
  question: string
  options: { label: string; text: string }[]
  correctAnswer: string
  explanation: string
}
