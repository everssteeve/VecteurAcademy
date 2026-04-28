export interface QuizQuestion {
  id: string
  question: string
  options: { label: string; text: string }[]
  correctAnswer: string
  explanation: string
}

export interface CertificationLevel {
  label: string
  emoji: string
  description: string
  minScore: number
  maxScore: number
}

const CERTIFICATION_LEVELS: CertificationLevel[] = [
  {
    label: "AI Curious",
    emoji: "🔵",
    description:
      "Bases à consolider. Vous comprenez le paysage mais pas encore les mécanismes fondamentaux. Revoir les modules 1 et 2.",
    minScore: 0,
    maxScore: 8,
  },
  {
    label: "AI Practitioner",
    emoji: "🟡",
    description:
      "Opérationnel en appui sur des missions IA. Vous savez reconnaître les bons cas d'usage et éviter les erreurs les plus fréquentes en ESN.",
    minScore: 9,
    maxScore: 13,
  },
  {
    label: "AI Engineer Junior",
    emoji: "🟠",
    description:
      "Autonome sur des projets IA en ESN. Vous maîtrisez les architectures RAG, agents, et les pratiques de production. Vous pouvez piloter une mission de bout en bout.",
    minScore: 14,
    maxScore: 17,
  },
  {
    label: "AI Engineer",
    emoji: "🟢",
    description:
      "Niveau formateur. Vous maîtrisez l'ensemble du programme, pouvez encadrer vos collègues et défendre des choix techniques devant n'importe quel client.",
    minScore: 18,
    maxScore: 18,
  },
]

export function getCertificationLevel(score: number): CertificationLevel {
  for (let i = CERTIFICATION_LEVELS.length - 1; i >= 0; i--) {
    if (score >= CERTIFICATION_LEVELS[i].minScore) {
      return CERTIFICATION_LEVELS[i]
    }
  }
  return CERTIFICATION_LEVELS[0]
}
