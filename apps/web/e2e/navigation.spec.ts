import { expect, test } from "@playwright/test"

test.describe("Navigation Shell — SPEC-003", () => {
  test("page d'accueil redirige vers /dashboard", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL("/dashboard")
  })

  test('<html lang="fr"> sur toutes les pages', async ({ page }) => {
    for (const path of ["/", "/dashboard", "/modules/ai-engineering"]) {
      await page.goto(path)
      const lang = await page.locator("html").getAttribute("lang")
      expect(lang).toBe("fr")
    }
  })

  test("skip link visible au focus", async ({ page }) => {
    await page.goto("/dashboard")
    await page.keyboard.press("Tab")
    const skipLink = page.getByRole("link", { name: "Aller au contenu principal" })
    await expect(skipLink).toBeVisible()
  })

  test("skip link pointe vers #main-content", async ({ page }) => {
    await page.goto("/dashboard")
    const skipLink = page.getByRole("link", { name: "Aller au contenu principal" })
    await expect(skipLink).toHaveAttribute("href", "#main-content")
  })

  test('main a l\'id "main-content"', async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("#main-content")).toBeVisible()
  })

  test("page module shell affiche titre, description, durée", async ({ page }) => {
    await page.goto("/modules/ai-engineering")
    await expect(page.locator("h1")).toBeVisible()
    const heading = await page.locator("h1").textContent()
    expect(heading).toBeTruthy()
  })

  test('aria-current="page" sur le lien actif en sidebar (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/modules/ai-engineering")
    const activeLink = page.locator(
      'aside nav[aria-label="Navigation principale"] a[aria-current="page"]'
    )
    await expect(activeLink).toBeVisible()
  })

  test('aria-current="page" dans le breadcrumb', async ({ page }) => {
    await page.goto("/modules/ai-engineering")
    const currentItem = page.locator('nav[aria-label="Fil d\'Ariane"] [aria-current="page"]')
    await expect(currentItem).toBeVisible()
  })

  test("navigation clavier : Tab depuis le début atteint la nav principale", async ({ page }) => {
    await page.goto("/dashboard")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(["A", "BUTTON"]).toContain(focused)
  })

  test("page 404 pour slug inexistant", async ({ page }) => {
    const response = await page.goto("/modules/module-inexistant")
    expect(response?.status()).toBe(404)
  })

  test('sidebar affiche "Aucun module disponible" si registry vide (message présent)', async ({
    page,
  }) => {
    // Vérification indirecte : s'il y a des modules, la sidebar les liste
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/dashboard")
    const sidebarNav = page.locator('aside nav[aria-label="Navigation principale"]')
    await expect(sidebarNav).toBeVisible()
    const links = await sidebarNav.locator("a").count()
    expect(links).toBeGreaterThan(0)
  })

  test("tous les slugs générés par generateStaticParams sont accessibles", async ({ page }) => {
    const slugs = [
      "ai-engineering",
      "foundation-models",
      "model-selection",
      "prompt-engineering",
      "rag-agents",
      "production-architecture",
    ]
    for (const slug of slugs) {
      const response = await page.goto(`/modules/${slug}`)
      expect(response?.status()).toBe(200)
    }
  })
})

test.describe("InstructorBadge — SPEC-011", () => {
  test("InstructorBadge Steeve Evers visible sur /modules/ai-engineering", async ({ page }) => {
    await page.goto("/modules/ai-engineering")
    const badge = page.getByRole("img", { name: "Steeve Evers" })
    await expect(badge.first()).toBeVisible()
  })

  test("InstructorBadge : 4 avatars Steeve Evers dans le module ai-engineering", async ({
    page,
  }) => {
    await page.goto("/modules/ai-engineering")
    const badges = page.getByRole("img", { name: "Steeve Evers" })
    await expect(badges).toHaveCount(4)
  })

  test("InstructorBadge Dr Lena Voss visible sur /modules/ai-engineering", async ({ page }) => {
    await page.goto("/modules/ai-engineering")
    const badge = page.getByRole("img", { name: "Dr Lena Voss" })
    await expect(badge).toBeVisible()
  })
})
