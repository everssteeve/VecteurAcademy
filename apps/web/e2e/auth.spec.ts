import { expect, test } from "@playwright/test"

const E2E_EMAIL = "e2e@vecteuracademy.fr"
const E2E_PASSWORD = "E2eTest1!"

test.describe("Auth Shell — SPEC-004/009", () => {
  test.describe("redirect non-authentifié", () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test("accès /dashboard sans session → redirigé vers /login", async ({ page }) => {
      await page.goto("/dashboard")
      await expect(page).toHaveURL(/\/login/)
    })

    test("accès /modules/:slug sans session → redirigé vers /login", async ({ page }) => {
      await page.goto("/modules/ai-engineering")
      await expect(page).toHaveURL(/\/login/)
    })

    test("accès /evaluation-finale sans session → redirigé vers /login", async ({ page }) => {
      await page.goto("/evaluation-finale")
      await expect(page).toHaveURL(/\/login/)
    })

    test("callbackUrl préservé dans l'URL de redirection", async ({ page }) => {
      await page.goto("/dashboard")
      await expect(page).toHaveURL(/callbackUrl/)
    })
  })

  test.describe("page /login", () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test("page /login accessible sans session", async ({ page }) => {
      await page.goto("/login")
      await expect(page.locator("h1")).toHaveText("Connexion")
    })

    test("formulaire login navigable au clavier sans piège de focus", async ({ page }) => {
      await page.goto("/login")
      await page.keyboard.press("Tab")
      const activeTag = await page.evaluate(() => document.activeElement?.tagName)
      expect(["A", "INPUT", "BUTTON"]).toContain(activeTag)
    })

    test("erreur validation email affiché avec role=alert", async ({ page }) => {
      await page.goto("/login")
      await page.fill('input[name="email"]', "email-invalide")
      await page.fill('input[name="password"]', "password123")
      await page.getByRole("button", { name: "Se connecter" }).click()
      const alert = page.locator('[role="alert"]').first()
      await expect(alert).toBeVisible()
    })

    test("erreur validation password affiché avec role=alert", async ({ page }) => {
      await page.goto("/login")
      await page.fill('input[name="email"]', "test@example.com")
      await page.fill('input[name="password"]', "court")
      await page.getByRole("button", { name: "Se connecter" }).click()
      const alert = page.locator('[role="alert"]').first()
      await expect(alert).toBeVisible()
    })

    test("aria-invalid=true sur champ email invalide", async ({ page }) => {
      await page.goto("/login")
      await page.fill('input[name="email"]', "pas-un-email")
      await page.fill('input[name="password"]', "password123")
      await page.getByRole("button", { name: "Se connecter" }).click()
      await expect(page.locator('input[name="email"]')).toHaveAttribute("aria-invalid", "true")
    })

    test("credentials invalides → message d'erreur visible", async ({ page }) => {
      await page.goto("/login")
      await page.fill('input[name="email"]', "inexistant@example.com")
      await page.fill('input[name="password"]', "WrongPassword1!")
      await page.getByRole("button", { name: "Se connecter" }).click()
      const alert = page.getByRole("alert").filter({ hasText: /identifiants|invalide/i })
      await expect(alert).toBeVisible()
    })

    test("connexion avec credentials valides → session créée, redirection /dashboard", async ({
      page,
    }) => {
      await page.goto("/login")
      await page.fill('input[name="email"]', E2E_EMAIL)
      await page.fill('input[name="password"]', E2E_PASSWORD)
      await page.getByRole("button", { name: "Se connecter" }).click()
      await expect(page).toHaveURL("/dashboard")
    })
  })

  test.describe("session persistée (avec auth)", () => {
    test("utilisateur connecté accédant à /login → redirigé vers /dashboard", async ({ page }) => {
      await page.goto("/login")
      await expect(page).toHaveURL("/dashboard")
    })

    test("session disponible après reload de la page", async ({ page }) => {
      await page.goto("/dashboard")
      await expect(page).toHaveURL("/dashboard")
      await page.reload()
      await expect(page).toHaveURL("/dashboard")
    })
  })

  test.describe("page /register", () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test("page /register accessible sans session", async ({ page }) => {
      await page.goto("/register")
      await expect(page.locator("h1")).toHaveText("Créer un compte")
    })

    test("formulaire /register contient les 4 champs requis", async ({ page }) => {
      await page.goto("/register")
      await expect(page.locator('input[name="email"]')).toBeVisible()
      await expect(page.locator('input[name="esn_name"]')).toBeVisible()
      await expect(page.locator('input[name="password"]')).toBeVisible()
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
    })

    test("erreur si email déjà utilisé → message 409 visible", async ({ page }) => {
      await page.goto("/register")
      await page.fill('input[name="email"]', E2E_EMAIL)
      await page.fill('input[name="esn_name"]', "TestESN")
      await page.fill('input[name="password"]', E2E_PASSWORD)
      await page.fill('input[name="confirmPassword"]', E2E_PASSWORD)
      await page.getByRole("button", { name: /créer|s'inscrire/i }).click()
      const alert = page.getByRole("alert").filter({ hasText: /déjà utilisée/i })
      await expect(alert).toBeVisible()
    })
  })
})
