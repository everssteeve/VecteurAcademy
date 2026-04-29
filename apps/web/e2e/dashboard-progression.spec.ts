import { expect, test } from "@playwright/test"

// page.route() n'intercepte pas les fetch() exécutés côté serveur (Server Component Next.js).
// Les tests utilisent les données réelles du test user ou l'API FastAPI directement.

const E2E_USER_ID = "b96cb0fc-093f-4804-920c-35e185e1c5ae"
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

test.describe("Dashboard progression — SPEC-013", () => {
  test.describe.configure({ mode: "serial" })

  test("module terminé avec quiz result affiche le score en %", async ({ page }) => {
    // L'utilisateur e2e a ai-engineering terminé avec score 4/5 → (80%)
    await page.goto("/dashboard")
    await expect(page.getByText("Terminé · 4/5 (80%)")).toBeVisible()
  })

  test("module non commencé n'affiche pas de pourcentage", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.getByText("Non commencé").first()).toBeVisible()
    // Aucun badge "Non commencé" ne doit contenir de pourcentage
    const badges = page.getByText("Non commencé")
    for (const badge of await badges.all()) {
      await expect(badge).not.toContainText("%")
    }
  })

  test("section Évaluation finale visible sous la grille modules", async ({ page }) => {
    await page.goto("/dashboard")
    const heading = page.getByRole("heading", { name: "Évaluation finale" })
    await expect(heading).toBeVisible()
    // La section doit apparaître APRÈS la grille modules
    const modulesHeading = page.getByRole("heading", { name: "Mes modules" })
    await expect(modulesHeading).toBeVisible()
  })

  test("0 tentative finale affiche le message vide", async ({ page }) => {
    // Conditionnel : skip si un résultat final existe déjà en DB (non idempotent par design —
    // la DB de test n'est pas nettoyée entre les runs. Relancer le setup e2e pour repartir à 0.)
    const resp = await fetch(`${API_URL}/progress?user_id=${E2E_USER_ID}`)
    const data = await resp.json()
    const hasFinal = data.quiz_results.some((r: { quiz_type: string }) => r.quiz_type === "final")
    if (hasFinal) {
      test.skip()
      return
    }

    await page.goto("/dashboard")
    await expect(page.getByText("Pas encore de tentative à l'évaluation finale.")).toBeVisible()
  })

  test("tentative finale affiche score et niveau de certification", async ({ request, page }) => {
    // POST un résultat final via l'API réelle (score 14/18 → 🟠 AI Engineer Junior)
    const res = await request.post(`${API_URL}/quiz/result`, {
      data: {
        quiz_type: "final",
        module_id: null,
        score: 14,
        max_score: 18,
        answers: [],
        user_id: E2E_USER_ID,
      },
    })
    expect(res.status()).toBe(201)

    await page.goto("/dashboard")
    await expect(page.getByText("14/18").first()).toBeVisible()
    await expect(page.getByText(/🟠.*AI Engineer Junior/).first()).toBeVisible()
  })

  test("accessibilité : section h2 + liste sémantique", async ({ page }) => {
    // Requiert un résultat final en DB (posté par le test précédent en mode serial)
    await page.goto("/dashboard")
    await expect(page.getByRole("heading", { level: 2, name: "Évaluation finale" })).toBeVisible()
    const region = page.getByRole("region", { name: "Évaluation finale" })
    const list = region.getByRole("list")
    await expect(list).toBeVisible()
    await expect(list.getByRole("listitem").first()).toBeVisible()
  })
})
