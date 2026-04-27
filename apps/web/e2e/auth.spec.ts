import { expect, test } from "@playwright/test"

test.describe("Auth Shell — SPEC-004", () => {
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
  })

  test.describe("connexion stub", () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test("connexion avec credentials valides → session créée, redirection /dashboard", async ({
      page,
    }) => {
      await page.goto("/login")
      await page.fill('input[name="email"]', "user@example.com")
      await page.fill('input[name="password"]', "password123")
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

  test.describe("page /register (stub)", () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test("page /register accessible sans session", async ({ page }) => {
      await page.goto("/register")
      await expect(page.locator("h1")).toHaveText("Créer un compte")
    })

    test("message stub visible sur la page /register", async ({ page }) => {
      await page.goto("/register")
      await expect(
        page.getByText("Inscription temporairement indisponible — fonctionnalité à venir")
      ).toBeVisible()
    })

    test("message stub a role=alert", async ({ page }) => {
      await page.goto("/register")
      const alert = page.getByRole("alert").filter({ hasText: "temporairement indisponible" })
      await expect(alert).toBeVisible()
    })
  })
})
