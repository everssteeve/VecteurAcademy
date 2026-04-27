import type { ComponentPropsWithoutRef } from "react"

type HeadingProps = ComponentPropsWithoutRef<"h1">
type ParagraphProps = ComponentPropsWithoutRef<"p">
type ListProps = ComponentPropsWithoutRef<"ul">
type ListItemProps = ComponentPropsWithoutRef<"li">
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">
type CodeProps = ComponentPropsWithoutRef<"code">
type PreProps = ComponentPropsWithoutRef<"pre">

export const mdxComponents = {
  h1: ({ children, ...props }: HeadingProps) => (
    <h1 className="text-3xl font-bold mt-8 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: HeadingProps) => (
    <h2 className="text-2xl font-semibold mt-8 mb-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: HeadingProps) => (
    <h3 className="text-xl font-medium mt-6 mb-2" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: ParagraphProps) => (
    <p className="my-3 leading-7" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: ListProps) => (
    <ul className="my-3 ml-6 list-disc space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-3 ml-6 list-decimal space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: ListItemProps) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: ComponentPropsWithoutRef<"em">) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }: BlockquoteProps) => (
    <blockquote
      className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 pl-4 py-2 my-4 text-amber-900 dark:text-amber-200 italic rounded-r"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,
  code: ({ children, ...props }: CodeProps) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 text-sm font-mono px-1.5 py-0.5 rounded"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: PreProps) => (
    <pre
      className="bg-gray-100 dark:bg-gray-800 text-sm font-mono p-4 rounded-lg overflow-x-auto my-4"
      {...props}
    >
      {children}
    </pre>
  ),
}
