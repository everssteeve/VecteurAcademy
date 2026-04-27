import { AppShell } from "../../components/layout/app-shell"
import { getAllModules } from "../../lib/module-registry"

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const modules = await getAllModules()
  return <AppShell modules={modules}>{children}</AppShell>
}
