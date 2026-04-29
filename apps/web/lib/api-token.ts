import { SignJWT } from "jose"

export async function createApiToken(userId: string): Promise<string> {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) throw new Error("[VecteurAcademy] JWT_SECRET manquant")
  const secret = new TextEncoder().encode(jwtSecret)
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret)
}
