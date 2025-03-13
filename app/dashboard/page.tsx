"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/navigation/header"
import { FooterNav } from "@/components/navigation/footer-nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, LogIn, UserPlus } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEventStore } from "@/lib/event-store"
import { useUserStore } from "@/lib/user-store"
import Link from "next/link"

// Dynamically import client components with no SSR
const HomeContent = dynamic(() => import("@/components/home/home-content"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-12">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-2"></div>
        <p className="text-sm text-gray-600">Loading events...</p>
      </div>
    </div>
  ),
})

export default function Dashboard() {
  const router = useRouter()
  const { events, forceUpdate } = useEventStore()
  const { currentUser } = useUserStore()
  const [searchQuery, setSearchQuery] = useState("")
  const isLoggedIn = !!currentUser?.id

  // Force a refresh of the event store when the dashboard loads
  useEffect(() => {
    console.log("Dashboard mounted, forcing update")
    forceUpdate()
    console.log(`Dashboard loaded with ${events.length} events in store`)
  }, [forceUpdate])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    // Check if the search query matches any event titles or locations
    const matchingEvent = events.find(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (matchingEvent) {
      // If we found a matching event, navigate to it
      router.push(`/events/${matchingEvent.id}`)
    } else {
      // Otherwise, navigate to explore page with the search query
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="pb-16">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search events, users, or contributions"
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {!isLoggedIn && (
            <div className="flex items-center gap-3 self-end">
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="flex items-center">
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex items-center">
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        <HomeContent />
      </main>

      <FooterNav />
    </div>
  )
}

