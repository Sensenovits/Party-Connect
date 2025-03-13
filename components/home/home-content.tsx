"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventMap } from "@/components/map/event-map"
import { LocationFilter } from "@/components/map/location-filter"
import { useEventStore, type Event } from "@/lib/event-store"
import { useUserStore } from "@/lib/user-store"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FeaturedEvents } from "@/components/events/featured-events"
import { Music, Utensils, Leaf, BookOpen, Heart, Code, Dumbbell, Palette } from "lucide-react"

export default function HomeContent() {
  const router = useRouter()
  const { events, forceUpdate } = useEventStore()
  const { currentUser, updateLocation } = useUserStore()
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [activeFilter, setActiveFilter] = useState<{
    type: "distance" | "location" | "category" | null
    value: number | string | null
  }>({ type: null, value: null })
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [mapKey, setMapKey] = useState(Date.now())
  const [isInitialized, setIsInitialized] = useState(false)

  // Force a re-render when the component mounts to ensure we have the latest events
  useEffect(() => {
    console.log("HomeContent mounted, forcing update")
    forceUpdate()
    setIsInitialized(true)

    // Log the current events in the store
    console.log(`Home page loaded with ${events.length} events in store`)

    // Force a map refresh
    setMapKey(Date.now())
  }, [forceUpdate])

  // Process events when they change or filter changes
  useEffect(() => {
    if (!isInitialized) return

    console.log("Processing events for home map view:", events.length, "events available")

    // Convert dates from string to Date objects and ensure valid coordinates
    const processedEvents = events
      .map((event) => {
        if (!event) {
          console.log("Found null or undefined event")
          return null
        }

        // Ensure event has coordinates and they are valid
        if (
          !event.coordinates ||
          !Array.isArray(event.coordinates) ||
          event.coordinates.length !== 2 ||
          typeof event.coordinates[0] !== "number" ||
          typeof event.coordinates[1] !== "number" ||
          isNaN(event.coordinates[0]) ||
          isNaN(event.coordinates[1])
        ) {
          console.log(`Event ${event.id} has invalid or missing coordinates:`, event.coordinates)
          return null
        }

        // Make a deep copy to ensure we don't modify the original
        return {
          ...event,
          date: event.date instanceof Date ? event.date : new Date(event.date),
          coordinates: [...event.coordinates] as [number, number],
        }
      })
      .filter(Boolean) as Event[]

    console.log("Processed events with valid coordinates:", processedEvents.length)

    // Apply filters if active
    if (activeFilter.type === "distance" && currentUser.coordinates) {
      const maxDistance = activeFilter.value as number
      const nearbyEvents = processedEvents.filter((event) => {
        if (!event.coordinates) return false

        // Calculate distance between user and event
        const distance = calculateDistance(
          currentUser.coordinates![0],
          currentUser.coordinates![1],
          event.coordinates[0],
          event.coordinates[1],
        )

        return distance <= maxDistance
      })

      setFilteredEvents(nearbyEvents)
    } else if (activeFilter.type === "location") {
      const locationQuery = (activeFilter.value as string).toLowerCase()
      const locationEvents = processedEvents.filter((event) => event.location.toLowerCase().includes(locationQuery))

      setFilteredEvents(locationEvents)
    } else if (activeFilter.type === "category") {
      const categoryEvents = processedEvents.filter(
        (event) => event.category?.toLowerCase() === (activeFilter.value as string).toLowerCase(),
      )
      setFilteredEvents(categoryEvents)
    } else {
      setFilteredEvents(processedEvents)
    }

    // Force map to re-render with new events
    setMapKey(Date.now())
  }, [events, activeFilter, currentUser.coordinates, isInitialized])

  const handleFilterChange = (filter: { type: "distance" | "location"; value: number | string }) => {
    setActiveFilter(filter)
    setActiveCategory(null)
  }

  const handleCategorySelect = (category: string) => {
    setActiveFilter({ type: "category", value: category })
    setActiveCategory(category)
  }

  const handleLocationChange = (coordinates: [number, number], locationName: string) => {
    updateLocation(coordinates, locationName)
  }

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  // Helper function to calculate distance between coordinates
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
  }

  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  // Category definitions
  const categories = [
    { id: "music", name: "Music", icon: Music, color: "bg-festival-100 text-festival-800" },
    { id: "food", name: "Food", icon: Utensils, color: "bg-amber-100 text-amber-800" },
    { id: "nature", name: "Nature", icon: Leaf, color: "bg-nature-100 text-nature-800" },
    { id: "education", name: "Education", icon: BookOpen, color: "bg-indigo-100 text-indigo-800" },
    { id: "charity", name: "Charity", icon: Heart, color: "bg-red-100 text-red-800" },
    { id: "tech", name: "Tech", icon: Code, color: "bg-blue-100 text-blue-800" },
    { id: "sports", name: "Sports", icon: Dumbbell, color: "bg-sports-100 text-sports-800" },
    { id: "cultural", name: "Cultural", icon: Palette, color: "bg-cultural-100 text-cultural-800" },
  ]

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      {/* Categories section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 gradient-text gradient-blue">Browse by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((category) => {
            const isActive = activeCategory === category.id
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                  isActive ? "bg-blue-600 text-white shadow-md" : "bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isActive ? "bg-white/20" : category.color
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
                </div>
                <span className="text-xs font-medium">{category.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Tabs defaultValue="list">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Map View
            </TabsTrigger>
          </TabsList>

          <Link href="/create-event">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow"
            >
              Create Event
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <LocationFilter onFilterChange={handleFilterChange} onLocationChange={handleLocationChange} />
        </div>

        {activeFilter.type && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-2 gradient-text gradient-blue">
              {activeFilter.type === "distance"
                ? `Events within ${activeFilter.value}km of your location`
                : activeFilter.type === "location"
                  ? `Events in "${activeFilter.value}"`
                  : `${activeFilter.value} Events`}
            </h3>
            <p className="text-sm text-gray-500">
              {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
            </p>
          </motion.div>
        )}

        <TabsContent value="list">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">
              {activeFilter.type ? "Filtered Events" : "Featured Events"}
            </h2>

            {filteredEvents.length > 0 ? (
              <FeaturedEvents events={filteredEvents} />
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg glass-card">
                <p className="text-gray-500 mb-4">No events found matching your criteria.</p>
                <Button onClick={() => setActiveFilter({ type: null, value: null })}>Show all events</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="map">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">
              {activeFilter.type ? "Filtered Events" : "All Events"} on Map
            </h2>

            <div className="mb-2">
              <p className="text-sm text-gray-500">
                Showing {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} on the map
              </p>
            </div>

            <EventMap
              key={mapKey}
              events={filteredEvents}
              userLocation={currentUser.coordinates}
              onEventClick={handleEventClick}
              height="500px"
              className="mb-4 rounded-lg overflow-hidden shadow-md"
            />

            <div className="mt-4 text-sm text-gray-500">
              <p>Click on a marker to view event details. Your location is shown with a blue dot.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

