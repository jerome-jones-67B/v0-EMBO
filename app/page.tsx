import { ManuscriptDashboard } from "@/components/manuscript-dashboard"

export default function Home() {
  // Skip AuthGuard in demo mode - let users access directly
  return (
    <main className="min-h-screen bg-background">
      <ManuscriptDashboard />
    </main>
  )
}
