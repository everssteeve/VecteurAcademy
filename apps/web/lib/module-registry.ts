import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import type { ModuleMetadata } from "@formations-ia/shared-types"
import matter from "gray-matter"
import { z } from "zod"

const MODULES_DIR = path.join(process.cwd(), "content", "modules")

const ModuleMetadataSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  duration: z.number(),
  audience: z.array(z.enum(["consultant", "commercial"])),
  tags: z.array(z.string()).optional(),
})

async function parseModule(filename: string): Promise<ModuleMetadata> {
  const filepath = path.join(MODULES_DIR, filename)
  const content = await readFile(filepath, "utf-8")
  const { data } = matter(content)
  const result = ModuleMetadataSchema.safeParse(data)
  if (!result.success) {
    throw new Error(`ZodError: invalid frontmatter in ${filename}: ${result.error.message}`)
  }
  return result.data
}

export async function getAllModules(): Promise<ModuleMetadata[]> {
  let entries: string[]
  try {
    entries = await readdir(MODULES_DIR)
  } catch {
    return []
  }

  const mdxFiles = entries.filter((f) => f.endsWith(".mdx"))
  if (mdxFiles.length === 0) return []

  const items = await Promise.all(
    mdxFiles.map(async (filename) => ({
      filename,
      module: await parseModule(filename),
    }))
  )

  if (process.env.NODE_ENV === "development") {
    const orderCounts = new Map<number, number>()
    for (const { module } of items) {
      orderCounts.set(module.order, (orderCounts.get(module.order) ?? 0) + 1)
    }
    for (const [order, count] of orderCounts) {
      if (count > 1) {
        console.warn(`[module-registry] duplicate order value ${order} detected`)
      }
    }
  }

  return items
    .sort((a, b) => {
      if (a.module.order !== b.module.order) return a.module.order - b.module.order
      return a.filename.localeCompare(b.filename)
    })
    .map((item) => item.module)
}

export async function getModuleBySlug(slug: string): Promise<ModuleMetadata | null> {
  const modules = await getAllModules()
  return modules.find((m) => m.slug === slug) ?? null
}
