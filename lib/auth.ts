import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    // Google Provider for institutional accounts
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Restrict to specific domain if needed
          hd: process.env.GOOGLE_WORKSPACE_DOMAIN || undefined,
        },
      },
    }),
    
    // Credentials provider for EMBO staff/fallback
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "your.email@embo.org",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For demo/development - replace with actual user validation
        const validUsers = [
          {
            id: "1",
            email: "editorial.assistant@embo.org",
            name: "EMBO Editorial Assistant",
            role: "editorial_assistant",
          },
          {
            id: "2", 
            email: "admin@embo.org",
            name: "EMBO Admin",
            role: "admin",
          },
        ]

        const user = validUsers.find(
          (u) => u.email === credentials.email && credentials.password === "embo2025"
        )

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }

        return null
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist user role and other data to token
      if (user) {
        token.role = user.role || "editorial_assistant"
        token.userId = user.id
      }
      return token
    },
    
    async session({ session, token }) {
      // Send user role and id to the client
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.userId as string
      }
      return session
    },
    
    async signIn({ user, account, profile }) {
      // Allow sign in for Google accounts from specific domains
      if (account?.provider === "google") {
        const allowedDomains = [
          "embo.org",
          "gmail.com", // For demo purposes
        ]
        
        const emailDomain = user.email?.split("@")[1]
        return allowedDomains.includes(emailDomain || "")
      }
      
      // Allow credential sign ins
      if (account?.provider === "credentials") {
        return true
      }
      
      return false
    },
  },
  
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === "development",
}
