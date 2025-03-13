"use client"
import dynamic from "next/dynamic"
import type { Event } from "@/lib/event-store"

// Dynamically import Leaflet with no SSR
const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), { ssr: false })

interface EventMapProps {
  events: Event[]
  userLocation?: [number, number] | null
  onEventClick?: (eventId: string) => void
  height?: string
  className?: string
}

export function EventMap({ events, userLocation, onEventClick, height = "400px", className = "" }: EventMapProps) {
  return (
    <div className={`relative ${className}`}>
      <div style={{ height }} className="rounded-lg overflow-hidden">
        <LeafletMap events={events} userLocation={userLocation} onEventClick={onEventClick} />
      </div>
    </div>
  )
}

