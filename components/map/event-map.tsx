"use client"
import dynamic from "next/dynamic"
import type { Event } from "@/lib/event-store"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

// Dynamically import Leaflet with no SSR
const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

interface EventMapProps {
  events: Event[]
  userLocation?: [number, number] | null
  onEventClick?: (eventId: string) => void
  height?: string
  className?: string
}

export function EventMap({ events, userLocation, onEventClick, height = "400px", className = "" }: EventMapProps) {
  const [processedEvents, setProcessedEvents] = useState<Event[]>([])
  const [mapKey, setMapKey] = useState(Date.now())
  const [mapReady, setMapReady] = useState(false)

  // Add a useEffect to set mapReady after component mount
  useEffect(() => {
    // Set a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setMapReady(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  // Process events to ensure dates are Date objects and coordinates are valid
  useEffect(() => {
    if (!events) {
      console.log("No events provided to EventMap")
      setProcessedEvents([])
      return
    }

    try {
      console.log(`Processing ${events.length} events for map display`)

      // Convert dates from string to Date objects if needed and validate coordinates
      const processed = events
        .map((event) => {
          if (!event) {
            console.log("Found null or undefined event")
            return null
          }

          try {
            // Ensure coordinates are in the correct format
            const coords = event.coordinates

            // Validate coordinates exist and are in proper format
            if (!coords || !Array.isArray(coords) || coords.length !== 2) {
              console.log(`Event ${event.id} has missing or invalid coordinates structure:`, coords)
              return null
            }

            // Ensure both values are numbers
            const lat = typeof coords[0] === "number" ? coords[0] : Number.parseFloat(coords[0] as any)
            const lng = typeof coords[1] === "number" ? coords[1] : Number.parseFloat(coords[1] as any)

            if (isNaN(lat) || isNaN(lng)) {
              console.log(`Event ${event.id} has NaN coordinates:`, coords)
              return null
            }

            // Check if coordinates are within reasonable bounds
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
              console.log(`Event ${event.id} has out-of-bounds coordinates:`, [lat, lng])
              return null
            }

            const validCoordinates: [number, number] = [lat, lng]

            console.log(`Processed event ${event.id} with coordinates:`, validCoordinates)

            return {
              ...event,
              date: event.date instanceof Date ? event.date : new Date(event.date),
              coordinates: validCoordinates,
            }
          } catch (err) {
            console.error(`Error processing event ${event.id}:`, err)
            return null
          }
        })
        .filter(Boolean) as Event[]

      console.log(`Successfully processed ${processed.length} valid events for map display`)
      setProcessedEvents(processed)

      // Force map to re-render with new events
      setMapKey(Date.now())
    } catch (error) {
      console.error("Error processing events for map:", error)
      setProcessedEvents([])
    }
  }, [events])

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-md ${className}`}>
      <div style={{ height }} className="rounded-xl overflow-hidden">
        {mapReady ? (
          <LeafletMap key={mapKey} events={processedEvents} userLocation={userLocation} onEventClick={onEventClick} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Preparing map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

