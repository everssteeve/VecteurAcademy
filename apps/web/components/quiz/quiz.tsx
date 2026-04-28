import { quizData } from "@/content/quiz-data"
import { QuizInteractive } from "./quiz-interactive"

interface QuizProps {
  moduleId: string
}

export function Quiz({ moduleId }: QuizProps): React.JSX.Element {
  const questions = quizData[moduleId] ?? []
  return <QuizInteractive questions={questions} moduleId={moduleId} />
}
