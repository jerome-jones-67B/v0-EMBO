"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Code } from "lucide-react"

export function UserNav() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  // Check if auth is bypassed (development mode)
  const isAuthBypassed = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" || process.env.NODE_ENV === "development"
  
  if (!session?.user && !isAuthBypassed) {
    return null
  }

  // Use mock user data when auth is bypassed
  const user = session?.user || {
    name: "Developer",
    email: "dev@localhost",
    image: null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative h-10 rounded-lg px-3 hover:bg-gray-50 border ${isAuthBypassed ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Avatar className={`h-8 w-8 ring-2 ${isAuthBypassed ? 'ring-orange-200' : 'ring-blue-100'}`}>
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className={`text-white text-sm font-medium ${isAuthBypassed ? 'bg-orange-600' : 'bg-blue-600'}`}>
                {getInitials(user.name || user.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate">
                {user.name || "User"}
              </span>
              {isAuthBypassed && (
                <span className="text-xs text-orange-600 font-medium">DEV MODE</span>
              )}
            </div>
            <div className={`w-2 h-2 rounded-full ring-2 ring-white ${isAuthBypassed ? 'bg-orange-500' : 'bg-green-500'}`}></div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {isAuthBypassed && (
              <div className="flex items-center gap-1 mt-1">
                <Code className="w-3 h-3 text-orange-600" />
                <span className="text-xs text-orange-600 font-medium">Development Mode</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isAuthBypassed ? (
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled className="text-gray-400">
            <Code className="mr-2 h-4 w-4" />
            <span>Auth Bypassed</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
