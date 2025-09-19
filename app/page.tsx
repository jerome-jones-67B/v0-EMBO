import { ManuscriptDashboard } from "@/components/manuscript-dashboard"
import { AuthGuard } from "@/components/auth-guard"

export default function Home() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-background">
        <ManuscriptDashboard />
      </main>
    </AuthGuard>
  )
}
