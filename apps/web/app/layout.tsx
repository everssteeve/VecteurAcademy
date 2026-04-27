import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { AppShell } from "../components/layout/app-shell"
import { getAllModules } from "../lib/module-registry"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "VecteurAcademy",
  description: "Plateforme de formation AI Engineering pour consultants ESN",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const modules = await getAllModules()

  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:ring-2 focus:ring-blue-800"
        >
          Aller au contenu principal
        </a>
        <AppShell modules={modules}>{children}</AppShell>
      </body>
    </html>
  )
}
