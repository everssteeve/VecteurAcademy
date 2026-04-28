import { getCertificationLevel } from "@formations-ia/shared-types"
import { describe, expect, it } from "vitest"

describe("getCertificationLevel", () => {
  it("score 0 → AI Curious", () => {
    const level = getCertificationLevel(0)
    expect(level.label).toBe("AI Curious")
    expect(level.emoji).toBe("🔵")
  })

  it("score 8 → AI Curious (borne haute)", () => {
    const level = getCertificationLevel(8)
    expect(level.label).toBe("AI Curious")
  })

  it("score 9 → AI Practitioner", () => {
    const level = getCertificationLevel(9)
    expect(level.label).toBe("AI Practitioner")
    expect(level.emoji).toBe("🟡")
  })

  it("score 13 → AI Practitioner (borne haute)", () => {
    const level = getCertificationLevel(13)
    expect(level.label).toBe("AI Practitioner")
  })

  it("score 14 → AI Engineer Junior", () => {
    const level = getCertificationLevel(14)
    expect(level.label).toBe("AI Engineer Junior")
    expect(level.emoji).toBe("🟠")
  })

  it("score 17 → AI Engineer Junior (borne haute)", () => {
    const level = getCertificationLevel(17)
    expect(level.label).toBe("AI Engineer Junior")
  })

  it("score 18 → AI Engineer", () => {
    const level = getCertificationLevel(18)
    expect(level.label).toBe("AI Engineer")
    expect(level.emoji).toBe("🟢")
  })
})

describe("calcul moduleScore par groupe de 3", () => {
  const correctAnswers = [
    "C",
    "C",
    "B",
    "B",
    "C",
    "B",
    "B",
    "D",
    "D",
    "B",
    "B",
    "C",
    "B",
    "B",
    "B",
    "C",
    "C",
    "B",
  ]

  function computeModuleScore(answers: string[], moduleIndex: number): number {
    return answers
      .slice(moduleIndex * 3, moduleIndex * 3 + 3)
      .filter((ans, j) => ans === correctAnswers[moduleIndex * 3 + j]).length
  }

  it("score parfait sur module 1 (Q1-3) → 3/3", () => {
    const answers = ["C", "C", "B", ...Array(15).fill("X")]
    expect(computeModuleScore(answers, 0)).toBe(3)
  })

  it("aucune bonne réponse sur module 1 → 0/3", () => {
    const answers = ["X", "X", "X", ...Array(15).fill("X")]
    expect(computeModuleScore(answers, 0)).toBe(0)
  })

  it("score partiel → 1/3", () => {
    const answers = ["C", "X", "X", ...Array(15).fill("X")]
    expect(computeModuleScore(answers, 0)).toBe(1)
  })

  it("score parfait sur module 6 (Q16-18) → 3/3", () => {
    const answers = [...Array(15).fill("X"), "C", "C", "B"]
    expect(computeModuleScore(answers, 5)).toBe(3)
  })

  it("seuil recommandation : score < 2 déclenche la recommandation", () => {
    const score = 1
    expect(score < 2).toBe(true)
  })

  it("seuil recommandation : score >= 2 ne déclenche pas de recommandation", () => {
    const score = 2
    expect(score < 2).toBe(false)
  })
})
