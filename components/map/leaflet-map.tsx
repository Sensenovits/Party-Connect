"use client"

import { useEffect, useRef, useState } from "react"
import type { Event } from "@/lib/event-store"
import { Button } from "@/components/ui/button"
import { Navigation, Loader2, MapPin, Calendar, ZoomIn, ZoomOut, Info } from "lucide-react"
import { format } from "date-fns"
import "leaflet/dist/leaflet.css"

interface LeafletMapProps {
  events: Event[]
  userLocation?: [number, number] | null
  onEventClick?: (eventId: string) => void
}

export default function LeafletMap({ events, userLocation, onEventClick }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [zoom, setZoom] = useState(3)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const markersRef = useRef<any[]>([])
  const mapInitializedRef = useRef(false)
  const [mapInstance, setMapInstance] = useState<any>(null)

  // Initialize map
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined" || !mapRef.current) return

    // Only initialize if map hasn't been created yet
    if (mapInitializedRef.current) return

    console.log("Initializing map")
    mapInitializedRef.current = true
    setIsLoading(true)

    // Import Leaflet dynamically to avoid SSR issues
    const initMap = async () => {
      try {
        // Make sure the DOM element still exists before initializing
        if (!mapRef.current) {
          console.error("Map container not found when trying to initialize map")
          mapInitializedRef.current = false
          setIsLoading(false)
          return
        }

        const L = (await import("leaflet")).default

        // Clear existing map if it exists
        if (mapInstance) {
          mapInstance.remove()
        }

        // Fix Leaflet icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          iconUrl: "/leaflet/marker-icon.png",
          shadowUrl: "/leaflet/marker-shadow.png",
        })

        // Create map with better styling
        const newMap = L.map(mapRef.current, {
          zoomControl: false, // We'll add custom zoom controls
          attributionControl: false, // We'll add this manually for better styling
        }).setView([40.7128, -74.006], zoom)

        // Add a modern-looking tile layer
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 20,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(newMap)

        // Add attribution in a better position
        L.control
          .attribution({
            position: "bottomright",
          })
          .addTo(newMap)

        // Track zoom level changes
        newMap.on("zoomend", () => {
          setZoom(newMap.getZoom())
        })

        setMapInstance(newMap)
        setMap(newMap)
        setIsLoading(false)

        console.log("Map initialized successfully")
      } catch (error) {
        console.error("Error initializing map:", error)
        mapInitializedRef.current = false
        setIsLoading(false)
      }
    }

    // Add a small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      initMap()
    }, 100)

    return () => {
      clearTimeout(timer)
      if (mapInstance) {
        mapInstance.remove()
        setMapInstance(null)
        mapInitializedRef.current = false
      }
    }
  }, [])

  // Add event markers
  useEffect(() => {
    if (!map || typeof window === "undefined") return

    const addMarkers = async () => {
      try {
        // Import Leaflet dynamically
        const L = (await import("leaflet")).default

        console.log("Adding markers to map. Events:", events.length)

        // Clear any existing markers
        markersRef.current.forEach((marker) => {
          if (marker && marker.remove) {
            marker.remove()
          }
        })
        markersRef.current = []

        // Clear any existing popup
        map.closePopup()

        // Create bounds for fitting the map
        const bounds = L.latLngBounds([])
        let hasValidMarkers = false

        // Add event markers with custom styling
        if (events && events.length > 0) {
          events.forEach((event, index) => {
            if (!event) {
              console.warn(`Event at index ${index} is null or undefined`)
              return
            }

            if (!event.coordinates) {
              console.warn(`Event ${event.id} is missing coordinates`)
              return
            }

            if (!Array.isArray(event.coordinates) || event.coordinates.length !== 2) {
              console.warn(`Event ${event.id} has invalid coordinates array:`, event.coordinates)
              return
            }

            const [lat, lng] = event.coordinates

            if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
              console.warn(`Event ${event.id} has non-numeric coordinates:`, event.coordinates)
              return
            }

            console.log(`Adding marker for event ${event.id} at coordinates:`, lat, lng)
            hasValidMarkers = true

            // Create custom event marker
            const eventIcon = L.divIcon({
              className: "event-marker",
              html: `
                <div class="event-marker-pin">
                  <div class="event-marker-content">
                    <div class="event-marker-icon"></div>
                  </div>
                </div>
              `,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
            })

            try {
              const marker = L.marker([lat, lng], { icon: eventIcon }).addTo(map)

              // Add event listener for marker click
              marker.on("click", () => {
                console.log(`Marker clicked for event: ${event.id}`)
                setSelectedEvent(event)

                // If there's a direct handler, call it too
                if (onEventClick) {
                  onEventClick(event.id)
                }
              })

              markersRef.current.push(marker)
              bounds.extend([lat, lng])
              console.log(`Successfully added marker for event ${event.id}`)
            } catch (err) {
              console.error(`Error adding marker for event ${event.id}:`, err)
            }
          })
        }

        // Add user location marker if available
        if (userLocation && Array.isArray(userLocation) && userLocation.length === 2) {
          const [lat, lng] = userLocation

          if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
            console.log("Adding user location marker at:", lat, lng)
            hasValidMarkers = true

            const userIcon = L.divIcon({
              className: "user-location-marker",
              html: `
                <div class="user-marker-pin">
                  <div class="user-marker-content"></div>
                  <div class="user-marker-pulse"></div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })

            try {
              const userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map)
              markersRef.current.push(userMarker)
              bounds.extend([lat, lng])
              console.log("Successfully added user location marker")
            } catch (err) {
              console.error("Error adding user location marker:", err)
            }
          } else {
            console.warn("User location contains invalid coordinates:", userLocation)
          }
        }

        // Fit map to bounds if we have markers
        if (hasValidMarkers && bounds.isValid()) {
          console.log("Fitting map to bounds")
          map.fitBounds(bounds, { padding: [50, 50] })
        } else {
          console.log("No valid markers to fit bounds, setting default view")
          // If no markers, set a default view
          map.setView([40.7128, -74.006], 3)
        }
      } catch (error) {
        console.error("Error adding markers:", error)
      }
    }

    addMarkers()
  }, [events, userLocation, map, onEventClick])

  // Center map on user location
  const centerOnUserLocation = () => {
    if (!userLocation || !map) return

    map.flyTo(userLocation, 15, {
      duration: 1.5,
      easeLinearity: 0.25,
    })
  }

  // Handle zoom in
  const handleZoomIn = () => {
    if (map && zoom < 20) {
      map.setZoom(zoom + 1)
    }
  }

  // Handle zoom out
  const handleZoomOut = () => {
    if (map && zoom > 1) {
      map.setZoom(zoom - 1)
    }
  }

  // View event details
  const viewEventDetails = () => {
    if (selectedEvent && onEventClick) {
      onEventClick(selectedEvent.id)
    }
  }

  // Close event details
  const closeEventDetails = () => {
    setSelectedEvent(null)
  }

  return (
    <>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-30">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
            <p className="text-base font-medium text-blue-800">Loading map...</p>
            <p className="text-sm text-blue-600">Please wait a moment</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapRef} style={{ height: "100%", width: "100%", zIndex: 10 }}></div>

      {/* Custom zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-gray-100 border-gray-300"
        >
          <ZoomIn className="h-5 w-5 text-gray-700" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-gray-100 border-gray-300"
        >
          <ZoomOut className="h-5 w-5 text-gray-700" />
        </Button>
      </div>

      {/* User location button */}
      {userLocation && (
        <Button
          size="sm"
          className="absolute bottom-4 right-4 z-20 bg-white text-blue-600 hover:bg-gray-100 shadow-md border border-gray-200"
          onClick={centerOnUserLocation}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Center on me
        </Button>
      )}

      {/* Event details panel */}
      {selectedEvent && (
        <div className="absolute left-4 right-4 bottom-16 z-20 md:left-auto md:right-4 md:bottom-16 md:w-80">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
            <div
              className="h-32 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${selectedEvent.image || "/placeholder.svg?height=200&width=400"})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeEventDetails}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
              <div className="absolute bottom-3 left-3 text-white">
                <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm">{selectedEvent.location}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">
                  {format(
                    selectedEvent.date instanceof Date ? selectedEvent.date : new Date(selectedEvent.date),
                    "PPP 'at' p",
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{selectedEvent.description}</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={viewEventDetails}>
                View Event Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute left-4 bottom-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-2 border border-gray-200">
          <div className="flex items-center text-xs text-gray-700 mb-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm mr-2"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center text-xs text-gray-700">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm mr-2"></div>
            <span>Event Location</span>
          </div>
        </div>
      </div>

      {/* Info button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 left-4 h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-100 border-gray-300 z-20"
        onClick={() =>
          alert("Map shows event locations and your current position. Click on any marker to see event details.")
        }
      >
        <Info className="h-4 w-4 text-gray-700" />
      </Button>

      {/* Custom styles for markers and popups */}
      <style jsx global>{`
        .event-marker-pin {
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          background: #ef4444;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -20px 0 0 -20px;
          animation: bounce 0.5s ease-in-out;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .event-marker-content {
          width: 26px;
          height: 26px;
          margin: 7px 0 0 7px;
          background: #fff;
          position: absolute;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .event-marker-icon {
          width: 14px;
          height: 14px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3'%3E%3C/circle%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          transform: rotate(45deg);
        }
        
        .user-marker-pin {
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          position: relative;
        }
        
        .user-marker-content {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .user-marker-pulse {
          width: 40px;
          height: 40px;
          background: rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        }
        
        .leaflet-container {
          font-family: 'Inter', sans-serif;
        }
        
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          margin-bottom: 5px;
        }
        
        .leaflet-control-attribution {
          background-color: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(4px);
          border-radius: 4px !important;
          padding: 2px 8px !important;
          font-size: 10px !important;
        }
        
        .leaflet-control-attribution a {
          color: #3b82f6 !important;
        }
        
        @keyframes bounce {
          0% { transform: rotate(-45deg) translateY(-10px); opacity: 0; }
          50% { transform: rotate(-45deg) translateY(5px); opacity: 1; }
          100% { transform: rotate(-45deg) translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
        }
      `}</style>
    </>
  )
}

