import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("node:fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}))

import { readFile, readdir } from "node:fs/promises"
import { getAllModules, getModuleBySlug } from "../module-registry"

const mockReaddir = vi.mocked(readdir)
const mockReadFile = vi.mocked(readFile)

function makeMdx(data: Record<string, unknown>): string {
  const lines = Object.entries(data).map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
  return `---\n${lines.join("\n")}\n---\n\n{/* contenu à venir */}`
}

const MOD_01 = {
  id: "01",
  slug: "ai-engineering",
  title: "Introduction à l'AI Engineering",
  description: "Desc",
  order: 1,
  duration: 45,
  audience: ["consultant"],
}

const MOD_02 = {
  id: "02",
  slug: "foundation-models",
  title: "Foundation Models",
  description: "Desc",
  order: 2,
  duration: 60,
  audience: ["consultant", "commercial"],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getAllModules", () => {
  it("returns empty array when directory is empty", async () => {
    mockReaddir.mockResolvedValue([] as never)
    expect(await getAllModules()).toEqual([])
  })

  it("returns empty array when directory does not exist", async () => {
    mockReaddir.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }))
    expect(await getAllModules()).toEqual([])
  })

  it("filters out non-MDX files silently", async () => {
    mockReaddir.mockResolvedValue([".DS_Store", ".gitkeep", "README.md"] as never)
    expect(await getAllModules()).toEqual([])
  })

  it("returns modules sorted by order ascending", async () => {
    mockReaddir.mockResolvedValue(["02-foundation-models.mdx", "01-ai-engineering.mdx"] as never)
    mockReadFile
      .mockResolvedValueOnce(makeMdx(MOD_02) as never)
      .mockResolvedValueOnce(makeMdx(MOD_01) as never)
    const result = await getAllModules()
    expect(result).toHaveLength(2)
    expect(result[0].slug).toBe("ai-engineering")
    expect(result[1].slug).toBe("foundation-models")
  })

  it("uses filename as stable sort fallback for duplicate order values", async () => {
    mockReaddir.mockResolvedValue(["02-b.mdx", "01-a.mdx"] as never)
    const modA = { ...MOD_01, slug: "a", order: 1 }
    const modB = { ...MOD_02, slug: "b", order: 1 }
    mockReadFile
      .mockResolvedValueOnce(makeMdx(modB) as never)
      .mockResolvedValueOnce(makeMdx(modA) as never)
    const result = await getAllModules()
    expect(result[0].slug).toBe("a")
    expect(result[1].slug).toBe("b")
  })

  it("throws on invalid frontmatter (missing required field)", async () => {
    mockReaddir.mockResolvedValue(["01-bad.mdx"] as never)
    const invalid = { id: "01", slug: "bad" }
    mockReadFile.mockResolvedValueOnce(makeMdx(invalid) as never)
    await expect(getAllModules()).rejects.toThrow(/ZodError/)
  })
})

describe("getModuleBySlug", () => {
  it("returns the matching module", async () => {
    mockReaddir.mockResolvedValue(["01-ai-engineering.mdx"] as never)
    mockReadFile.mockResolvedValueOnce(makeMdx(MOD_01) as never)
    const result = await getModuleBySlug("ai-engineering")
    expect(result?.slug).toBe("ai-engineering")
    expect(result?.order).toBe(1)
  })

  it("returns null for an unknown slug", async () => {
    mockReaddir.mockResolvedValue(["01-ai-engineering.mdx"] as never)
    mockReadFile.mockResolvedValueOnce(makeMdx(MOD_01) as never)
    expect(await getModuleBySlug("inexistant")).toBeNull()
  })
})
