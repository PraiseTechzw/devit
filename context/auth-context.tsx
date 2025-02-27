"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { account, databases, ID } from "@/lib/appwrite"
import type { User } from "@/types"

const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MATERIALS_COLLECTION_ID!
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    name: string,
    preferences?: { major: string; academicYear: string },
  ) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const session = await account.get()
      const userData = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        session.$id
      )

      setUser({
        $id: session.$id,
        name: session.name,
        email: session.email,
        major: userData.major || "",
        academicYear: userData.academicYear || "",
        createdAt: session.$createdAt || new Date().toISOString(),
        preferences: {
          theme: userData.preferences?.theme || "light",
          notifications: userData.preferences?.notifications || false,
        },
      })
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      await account.createSession(email, password)
      await checkUser()
      router.push("/dashboard")
    } catch (error) {
      throw new Error("Failed to sign in")
    }
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    preferences?: { major: string; academicYear: string },
  ) {
    try {
      // Create account in Appwrite Authentication
      const response = await account.create(ID.unique(), email, password, name)

      // Store user details in the Appwrite Database
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        response.$id, // Use the same user ID from authentication
        {
          name,
          email,
          major: preferences?.major || "",
          academicYear: preferences?.academicYear || "",
          preferences: {
            theme: "light",
            notifications: true,
          },
        }
      )

      await signIn(email, password)
    } catch (error) {
      throw new Error("Failed to sign up")
    }
  }

  async function signOut() {
    try {
      await account.deleteSession("current")
      setUser(null)
      router.push("/login")
    } catch (error) {
      throw new Error("Failed to sign out")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
