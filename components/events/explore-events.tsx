"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, X } from "lucide-react"
import { FeaturedEvents } from "./featured-events"
import { useEventStore } from "@/lib/event-store"
import { motion } from "framer-motion"

interface ExploreEventsProps {
  initialSearchQuery?: string
}

export function ExploreEvents({ initialSearchQuery = "" }: ExploreEventsProps) {
  const { events } = useEventStore()
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [filteredEvents, setFilteredEvents] = useState(events)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    date: "all",
    distance: "all",
    category: "all",
  })

  // Update search query when initialSearchQuery changes
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery)
    }
  }, [initialSearchQuery])

  // Filter events based on search query and other filters
  useEffect(() => {
    let filtered = [...events]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeTab === "upcoming") {
      filtered = filtered.filter((event) => new Date(event.date) > new Date())
    } else if (activeTab === "nearby") {
      // This would use geolocation in a real app
      // For now, just show all events
    } else if (activeTab === "popular") {
      // Sort by some popularity metric
      // For now, just randomize
      filtered = [...filtered].sort(() => Math.random() - 0.5)
    }

    // Apply additional filters
    if (filters.date !== "all") {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date)
        if (filters.date === "today") {
          return eventDate.toDateString() === now.toDateString()
        } else if (filters.date === "tomorrow") {
          return eventDate.toDateString() === tomorrow.toDateString()
        } else if (filters.date === "week") {
          return eventDate <= nextWeek && eventDate >= now
        } else if (filters.date === "month") {
          return eventDate <= nextMonth && eventDate >= now
        }
        return true
      })
    }

    setFilteredEvents(filtered)
  }, [events, searchQuery, activeTab, filters])

  const clearSearch = () => {
    setSearchQuery("")
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const updateFilter = (type: string, value: string) => {
    setFilters({
      ...filters,
      [type]: value,
    })
  }

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search events, users, or contributions"
          className="pl-10 pr-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" onClick={clearSearch}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Discover Events</h2>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          className="flex items-center"
          onClick={toggleFilters}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <motion.div
          className="mb-6 p-4 bg-gray-50 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-medium mb-3">Filter Options</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filters.date === "all" ? "default" : "outline"}
                  onClick={() => updateFilter("date", "all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filters.date === "today" ? "default" : "outline"}
                  onClick={() => updateFilter("date", "today")}
                >
                  Today
                </Button>
                <Button
                  size="sm"
                  variant={filters.date === "tomorrow" ? "default" : "outline"}
                  onClick={() => updateFilter("date", "tomorrow")}
                >
                  Tomorrow
                </Button>
                <Button
                  size="sm"
                  variant={filters.date === "week" ? "default" : "outline"}
                  onClick={() => updateFilter("date", "week")}
                >
                  This Week
                </Button>
                <Button
                  size="sm"
                  variant={filters.date === "month" ? "default" : "outline"}
                  onClick={() => updateFilter("date", "month")}
                >
                  This Month
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Distance</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filters.distance === "all" ? "default" : "outline"}
                  onClick={() => updateFilter("distance", "all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filters.distance === "5km" ? "default" : "outline"}
                  onClick={() => updateFilter("distance", "5km")}
                >
                  Within 5km
                </Button>
                <Button
                  size="sm"
                  variant={filters.distance === "10km" ? "default" : "outline"}
                  onClick={() => updateFilter("distance", "10km")}
                >
                  Within 10km
                </Button>
                <Button
                  size="sm"
                  variant={filters.distance === "25km" ? "default" : "outline"}
                  onClick={() => updateFilter("distance", "25km")}
                >
                  Within 25km
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filters.category === "all" ? "default" : "outline"}
                  onClick={() => updateFilter("category", "all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filters.category === "music" ? "default" : "outline"}
                  onClick={() => updateFilter("category", "music")}
                >
                  Music
                </Button>
                <Button
                  size="sm"
                  variant={filters.category === "food" ? "default" : "outline"}
                  onClick={() => updateFilter("category", "food")}
                >
                  Food & Drink
                </Button>
                <Button
                  size="sm"
                  variant={filters.category === "sports" ? "default" : "outline"}
                  onClick={() => updateFilter("category", "sports")}
                >
                  Sports
                </Button>
                <Button
                  size="sm"
                  variant={filters.category === "arts" ? "default" : "outline"}
                  onClick={() => updateFilter("category", "arts")}
                >
                  Arts
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="nearby" className="flex-1">
            Nearby
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex-1">
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <FeaturedEvents events={filteredEvents} />
        </TabsContent>

        <TabsContent value="nearby">
          <FeaturedEvents events={filteredEvents} />
        </TabsContent>

        <TabsContent value="popular">
          <FeaturedEvents events={filteredEvents} />
        </TabsContent>
      </Tabs>

      {filteredEvents.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No events found matching your criteria</p>
          <Button
            onClick={() => {
              setSearchQuery("")
              setFilters({
                date: "all",
                distance: "all",
                category: "all",
              })
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

