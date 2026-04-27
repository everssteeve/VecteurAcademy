import { MDXRemote } from "next-mdx-remote/rsc"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../../components/layout/breadcrumb"
import { mdxComponents } from "../../../../components/mdx/mdx-components"
import { getAllModules, getModuleBySlug } from "../../../../lib/module-registry"

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const modules = await getAllModules()
  return modules.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const module = await getModuleBySlug(slug)
  if (!module) return {}
  return { title: `${module.title} — VecteurAcademy` }
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<React.JSX.Element> {
  const { slug } = await params
  const module = await getModuleBySlug(slug)

  if (!module) {
    notFound()
  }

  const allModules = await getAllModules()
  const index = allModules.findIndex((m) => m.slug === slug)
  const prevModule = index > 0 ? allModules[index - 1] : null
  const nextModule = index < allModules.length - 1 ? allModules[index + 1] : null

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/dashboard" },
          { label: "Modules" },
          { label: module.title },
        ]}
      />

      <div className="mt-6 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {module.duration} min
          </span>
          {module.audience.map((a) => (
            <span
              key={a}
              className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
            >
              {a}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{module.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">{module.description}</p>
      </div>

      <article className="prose prose-gray dark:prose-invert max-w-none mb-8">
        <MDXRemote source={module.rawContent} components={mdxComponents} />
      </article>

      <nav
        aria-label="Navigation entre modules"
        className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800"
      >
        {prevModule ? (
          <a
            href={`/modules/${prevModule.slug}`}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <span aria-hidden="true">←</span>
            <span>{prevModule.title}</span>
          </a>
        ) : (
          <span />
        )}

        {nextModule ? (
          <a
            href={`/modules/${nextModule.slug}`}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <span>{nextModule.title}</span>
            <span aria-hidden="true">→</span>
          </a>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}
