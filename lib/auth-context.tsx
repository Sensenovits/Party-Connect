"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useUserStore } from "./user-store"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, updateProfile } = useUserStore()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check authentication status on mount
  useEffect(() => {
    // In a real app, this would verify the session/token
    const checkAuth = async () => {
      setIsLoading(true)

      // Simulate checking auth status
      await new Promise((resolve) => setTimeout(resolve, 500))

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Handle logout
  const logout = () => {
    // Clear user data
    updateProfile({
      id: "",
      name: "",
      avatar: "",
      email: "",
      bio: "",
      location: "",
      coordinates: undefined,
      preferences: "",
      createdEvents: [],
      joinedEvents: [],
      sponsoredEvents: [],
      positiveRatings: 0,
      successfulEvents: 0,
    })

    // Redirect to login page
    router.push("/auth/login")
  }

  // Determine if user is authenticated
  const isAuthenticated = !!currentUser?.id

  return <AuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>{children}</AuthContext.Provider>
}

