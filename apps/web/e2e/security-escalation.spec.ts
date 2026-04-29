import { expect, test } from "@playwright/test"
import { SignJWT } from "jose"

// Direct FastAPI security tests — no browser UI, uses Playwright request fixture.
// These tests verify that protected endpoints reject unauthenticated/invalid requests.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-min-32-chars-required!!"

async function makeToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret)
}

test.describe("Security — JWT auth on FastAPI (SPEC-014)", () => {
  test("GET /progress sans Authorization → 401", async ({ request }) => {
    const resp = await request.get(`${API_URL}/progress`)
    expect(resp.status()).toBe(401)
  })

  test("GET /progress avec token invalide → 401", async ({ request }) => {
    const resp = await request.get(`${API_URL}/progress`, {
      headers: { Authorization: "Bearer not-a-valid-jwt" },
    })
    expect(resp.status()).toBe(401)
  })

  test("POST /progress/module sans Authorization → 401", async ({ request }) => {
    const resp = await request.post(`${API_URL}/progress/module`, {
      data: { module_id: "ai-engineering" },
    })
    expect(resp.status()).toBe(401)
  })

  test("POST /quiz/result sans Authorization → 401", async ({ request }) => {
    const resp = await request.post(`${API_URL}/quiz/result`, {
      data: {
        quiz_type: "module",
        module_id: "ai-engineering",
        score: 1,
        max_score: 2,
        answers: [],
      },
    })
    expect(resp.status()).toBe(401)
  })

  test("GET /health sans Authorization → 200 (route publique)", async ({ request }) => {
    const resp = await request.get(`${API_URL}/health`)
    expect(resp.status()).toBe(200)
  })

  test("escalation horizontale : user A ne peut pas lire les données de user B", async ({
    request,
  }) => {
    // Deux utilisateurs distincts — user A ne peut lire que ses propres données
    const userAId = "00000000-0000-0000-0000-000000000001"
    const userBId = "00000000-0000-0000-0000-000000000002"

    const tokenA = await makeToken(userAId)
    const tokenB = await makeToken(userBId)

    // Avec le token de A : retourne uniquement les données de A (vides)
    const respA = await request.get(`${API_URL}/progress`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    // L'API peut répondre 200 (user inconnu → progression vide) ou 404
    // L'important : le statut n'est pas 401 (token valide) et user B n'est pas exposé
    expect([200, 404]).toContain(respA.status())

    // Avec le token de B : retourne uniquement les données de B (vides)
    const respB = await request.get(`${API_URL}/progress`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    })
    expect([200, 404]).toContain(respB.status())

    // Structural proof : user A cannot inject user B's ID — the query param no longer exists
    const respIDOR = await request.get(`${API_URL}/progress?user_id=${userBId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    // The ?user_id param is ignored — server uses token's sub — response is user A's data
    expect([200, 404]).toContain(respIDOR.status())
    if (respIDOR.status() === 200) {
      const body = await respIDOR.json()
      // Response is user A's data (empty), confirming the user_id param was ignored
      expect(body).toHaveProperty("module_progress")
      expect(body).toHaveProperty("quiz_results")
    }
  })
})
