import type React from "react"
import type { Metadata } from "next"
import AuthSessionProvider from "@/components/session-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "EMBO - Manuscript Validation Dashboard",
  description: "EMBO editorial workflow management for scientific manuscript validation and curation",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`antialiased`}>
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
