import { test as setup } from "@playwright/test"

setup("authenticate", async ({ page }) => {
  await page.goto("/login")
  await page.fill('input[name="email"]', "test@example.com")
  await page.fill('input[name="password"]', "password123")
  await page.getByRole("button", { name: "Se connecter" }).click()
  await page.waitForURL("/dashboard")
  await page.context().storageState({ path: "e2e/.auth/user.json" })
})
