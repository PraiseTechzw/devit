"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { account, ID } from "@/lib/appwrite"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
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
      setUser(session)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      await account.createEmailSession(email, password)
      await checkUser()
      router.push("/dashboard")
    } catch (error) {
      throw new Error("Failed to sign in")
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      await account.create(ID.unique(), email, password, name)
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

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

