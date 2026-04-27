export interface ModuleMetadata {
  id: string
  slug: string
  title: string
  description: string
  order: number
  duration: number
  audience: ('consultant' | 'commercial')[]
  tags?: string[]
}

export interface ModuleWithContent extends ModuleMetadata {
  rawContent: string
}
