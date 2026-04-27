export type { ModuleMetadata, ModuleWithContent } from './src/module'

export type UserRole = "learner" | "trainer" | "admin"

export interface User {
  id: string
  email: string
  role: UserRole
  createdAt: string
}

export interface ModuleProgress {
  moduleId: string
  userId: string
  completedAt: string | null
  score: number | null
}

export interface QuizResult {
  id: string
  moduleId: string
  userId: string
  score: number
  answeredAt: string
}
