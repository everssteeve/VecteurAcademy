import { auth } from "@/auth"
import { AppShell } from "../../components/layout/app-shell"
import { getAllModules } from "../../lib/module-registry"

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const [session, modules] = await Promise.all([auth(), getAllModules()])
  const user = session?.user
    ? {
        email: session.user.email ?? "",
        first_name: session.user.first_name ?? null,
        last_name: session.user.last_name ?? null,
        esn_name: session.user.esn_name ?? "",
      }
    : undefined
  return (
    <AppShell modules={modules} user={user}>
      {children}
    </AppShell>
  )
}
