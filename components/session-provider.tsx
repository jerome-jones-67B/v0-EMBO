"use client"

// No longer using NextAuth for static builds
import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export default function AuthSessionProvider({ children }: Props) {
  return <>{children}</>
}
