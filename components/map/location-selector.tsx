"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Check, Loader2, Search, ZoomIn, ZoomOut } from "lucide-react"
import "leaflet/dist/leaflet.css"

interface LocationSelectorProps {
  initialLocation?: [number, number]
  onLocationSelect: (coordinates: [number, number]) => void
  height?: string
}

export function LocationSelector({
  initialLocation = [40.7128, -74.006],
  onLocationSelect,
  height = "400px",
}: LocationSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(initialLocation)
  const [isGettingUserLocation, setIsGettingUserLocation] = useState(false)
  const [isMapLoading, setIsMapLoading] = useState(true)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [zoom, setZoom] = useState(13)
  const [locationName, setLocationName] = useState<string>("")
  const [isSearching, setIsSearching] = useState(false)
  const mapInitializedRef = useRef(false)

  // Initialize map
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    // Only initialize if mapRef exists and map hasn't been created yet
    if (!mapRef.current || map || mapInitializedRef.current) return

    setIsMapLoading(true)
    mapInitializedRef.current = true

    // Import Leaflet dynamically to avoid SSR issues
    const initMap = async () => {
      try {
        // Make sure the DOM element still exists before initializing
        if (!mapRef.current) {
          console.error("Map container not found when trying to initialize location selector")
          mapInitializedRef.current = false
          setIsMapLoading(false)
          return
        }

        const L = (await import("leaflet")).default

        // Fix Leaflet icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          iconUrl: "/leaflet/marker-icon.png",
          shadowUrl: "/leaflet/marker-shadow.png",
        })

        // Create map with a more modern tile layer
        const leafletMap = L.map(mapRef.current, {
          zoomControl: false, // We'll add custom zoom controls
          attributionControl: false, // We'll add this manually for better styling
        }).setView(initialLocation, zoom)

        // Add a modern-looking tile layer
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 20,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(leafletMap)

        // Add attribution in a better position
        L.control
          .attribution({
            position: "bottomright",
          })
          .addTo(leafletMap)

        // Create a marker at the initial location
        const initialMarker = L.marker(initialLocation, {
          draggable: false,
        }).addTo(leafletMap)

        setMarker(initialMarker)

        // Add event listener for map clicks to update marker position
        leafletMap.on("click", (e: any) => {
          const { lat, lng } = e.latlng
          const newCoords: [number, number] = [lat, lng]

          // Update marker position
          if (initialMarker) {
            initialMarker.setLatLng(newCoords)
          }

          setCurrentLocation(newCoords)

          // Notify parent component
          onLocationSelect(newCoords)

          // Attempt to get location name
          fetchLocationName(newCoords)
        })

        // Add event listener for map movement
        leafletMap.on("moveend", () => {
          const center = leafletMap.getCenter()
          const newZoom = leafletMap.getZoom()
          setZoom(newZoom)
        })

        setMap(leafletMap)
        setIsMapLoading(false)

        // Get initial location name
        fetchLocationName(initialLocation)
      } catch (error) {
        console.error("Error initializing map:", error)
        mapInitializedRef.current = false
        setIsMapLoading(false)
      }
    }

    // Add a small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      initMap()
    }, 100)

    // Cleanup function
    return () => {
      clearTimeout(timer)
      if (map) {
        map.remove()
        setMap(null)
        mapInitializedRef.current = false
      }
    }
  }, [initialLocation, onLocationSelect])

  // Update marker when initialLocation changes, but only if it's significantly different
  useEffect(() => {
    if (!map || !marker) return

    // Calculate distance between current marker position and new initialLocation
    const markerPos = marker.getLatLng()
    const currentPos = [markerPos.lat, markerPos.lng]

    // Only update if the position has changed significantly (more than 0.001 degrees)
    const hasChangedSignificantly =
      Math.abs(currentPos[0] - initialLocation[0]) > 0.001 || Math.abs(currentPos[1] - initialLocation[1]) > 0.001

    if (hasChangedSignificantly) {
      marker.setLatLng(initialLocation)
      map.setView(initialLocation, zoom, { animate: true })
      fetchLocationName(initialLocation)
      setCurrentLocation(initialLocation)
    }
  }, [initialLocation, map, marker, zoom])

  // Function to fetch location name from coordinates
  const fetchLocationName = async (coords: [number, number]) => {
    try {
      // In a real app, you would use a geocoding service
      // For now, we'll simulate it
      setIsSearching(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()

      if (data && data.display_name) {
        // Format the location name to be more concise
        const parts = data.display_name.split(", ")
        const shortenedName =
          parts.length > 3 ? `${parts[0]}, ${parts[1]}, ${parts[parts.length - 1]}` : data.display_name

        setLocationName(shortenedName)
      } else {
        setLocationName("Unknown location")
      }
    } catch (error) {
      console.error("Error fetching location name:", error)
      setLocationName("Unknown location")
    } finally {
      setIsSearching(false)
    }
  }

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsGettingUserLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newLocation: [number, number] = [latitude, longitude]

        setCurrentLocation(newLocation)

        if (map && marker) {
          map.flyTo(newLocation, 16, {
            duration: 1.5, // Animation duration in seconds
            easeLinearity: 0.25,
          })

          marker.setLatLng(newLocation)
        }

        fetchLocationName(newLocation)
        onLocationSelect(newLocation)
        setIsGettingUserLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to retrieve your location. Please try again or select manually.")
        setIsGettingUserLocation(false)
      },
    )
  }

  // Handle location selection
  const handleSelectLocation = () => {
    console.log("Selected location:", currentLocation)
    onLocationSelect(currentLocation)
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

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-md" style={{ height }}>
      {/* Loading overlay */}
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-30">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
            <p className="text-base font-medium text-blue-800">Loading map...</p>
            <p className="text-sm text-blue-600">Please wait a moment</p>
          </div>
        </div>
      )}

      {/* Center marker that stays fixed */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
          {/* Pulsing effect */}
          <div className="absolute w-16 h-16 rounded-full bg-blue-500/20 animate-ping"></div>
          {/* Shadow effect */}
          <div className="absolute top-8 w-6 h-1.5 rounded-full bg-black/20 blur-sm"></div>
        </div>
      </div>

      {/* Map container */}
      <div ref={mapRef} className="h-full w-full z-10"></div>

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

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3 px-4">
        <Button
          variant="outline"
          className="bg-white shadow-md hover:bg-gray-100 transition-colors border-gray-300"
          onClick={getUserLocation}
          disabled={isGettingUserLocation}
        >
          {isGettingUserLocation ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Locating...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              My Location
            </>
          )}
        </Button>

        <Button className="shadow-md bg-blue-600 hover:bg-blue-700 transition-colors" onClick={handleSelectLocation}>
          <Check className="h-4 w-4 mr-2" />
          Confirm Location
        </Button>
      </div>

      {/* Location info panel */}
      <div className="absolute top-4 left-4 right-20 z-20">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {isSearching ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" />
                      <span className="text-gray-500">Finding location...</span>
                    </div>
                  ) : (
                    locationName || "Select a location"
                  )}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {currentLocation[0].toFixed(6)}, {currentLocation[1].toFixed(6)}
                </p>
              </div>
            </div>
          </div>
          <div className="px-3 py-2 bg-blue-50 text-xs text-blue-700 flex items-center">
            <Search className="h-3 w-3 mr-1.5" />
            <span>Click on the map to position the marker at your desired location</span>
          </div>
        </div>
      </div>

      {/* Add custom styles for the map */}
      <style jsx global>{`
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
      `}</style>
    </div>
  )
}

export default LocationSelector

