import { test as setup } from "@playwright/test"

const E2E_EMAIL = "e2e@vecteuracademy.fr"
const E2E_PASSWORD = "E2eTest1!"
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

setup("authenticate", async ({ page }) => {
  // Créer le compte de test s'il n'existe pas encore (idempotent)
  await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: E2E_EMAIL,
      password: E2E_PASSWORD,
      esn_name: "E2E TestESN",
    }),
  })
  // 201 = créé, 409 = déjà existant — les deux sont acceptables

  await page.goto("/login")
  await page.fill('input[name="email"]', E2E_EMAIL)
  await page.fill('input[name="password"]', E2E_PASSWORD)
  await page.getByRole("button", { name: "Se connecter" }).click()
  await page.waitForURL("/dashboard")
  await page.context().storageState({ path: "e2e/.auth/user.json" })
})
