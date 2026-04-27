import { describe, expect, it } from "vitest"
import { loginSchema, registerSchema } from "../schemas/auth"

describe("loginSchema", () => {
  it("accepte un email valide et un password de 8+ chars", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "password123" })
    expect(result.success).toBe(true)
  })

  it("rejette un email invalide", () => {
    const result = loginSchema.safeParse({ email: "pas-un-email", password: "password123" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) => i.path[0] === "email")
      expect(emailIssue).toBeDefined()
    }
  })

  it("rejette un password < 8 chars", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "court" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordIssue = result.error.issues.find((i) => i.path[0] === "password")
      expect(passwordIssue).toBeDefined()
    }
  })

  it("rejette un password de exactement 7 chars", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "1234567" })
    expect(result.success).toBe(false)
  })

  it("accepte un password de exactement 8 chars", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "12345678" })
    expect(result.success).toBe(true)
  })
})

describe("registerSchema", () => {
  it("accepte des passwords identiques valides", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      confirmPassword: "password123",
    })
    expect(result.success).toBe(true)
  })

  it("rejette si passwords différents", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      confirmPassword: "autrepassword",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmIssue = result.error.issues.find((i) => i.path[0] === "confirmPassword")
      expect(confirmIssue?.message).toContain("correspondent")
    }
  })

  it("rejette un email invalide", () => {
    const result = registerSchema.safeParse({
      email: "invalide",
      password: "password123",
      confirmPassword: "password123",
    })
    expect(result.success).toBe(false)
  })
})
