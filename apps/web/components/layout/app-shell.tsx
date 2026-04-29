"use client"

import type { ModuleMetadata } from "@formations-ia/shared-types"
import { usePathname } from "next/navigation"
import { MobileNav } from "./mobile-nav"
import { Sidebar } from "./sidebar"

interface UserInfo {
  email: string
  first_name: string | null
  last_name: string | null
  esn_name: string
}

interface AppShellProps {
  modules: ModuleMetadata[]
  children: React.ReactNode
  user?: UserInfo
}

export function AppShell({ modules, children, user }: AppShellProps): React.JSX.Element {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <Sidebar modules={modules} currentPath={pathname} user={user} />
      <div className="flex flex-col flex-1 min-w-0">
        <MobileNav modules={modules} currentPath={pathname} user={user} />
        <main id="main-content" className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
