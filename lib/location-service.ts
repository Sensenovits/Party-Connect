// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined" && window.navigator

// Function to get user's current location
export async function getCurrentLocation(): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      reject(new Error("Geolocation is only available in browser environment"))
      return
    }

    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        resolve([latitude, longitude])
      },
      (error) => {
        reject(error)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    )
  })
}

// Function to get location name from coordinates using reverse geocoding
export async function getLocationName(lat: number, lng: number): Promise<string> {
  try {
    // In a real app, you would use a geocoding service like Google Maps, Mapbox, or OpenStreetMap
    // For this example, we'll simulate a response
    return simulateReverseGeocode(lat, lng)
  } catch (error) {
    console.error("Error getting location name:", error)
    return "Unknown location"
  }
}

// Function to search for coordinates by location name
export async function searchLocation(locationName: string): Promise<[number, number] | null> {
  try {
    // In a real app, you would use a geocoding service API
    // For this example, we'll simulate a response
    return simulateGeocode(locationName)
  } catch (error) {
    console.error("Error searching for location:", error)
    return null
  }
}

// Simulate geocoding for demo purposes
function simulateGeocode(locationName: string): [number, number] | null {
  // This is a simplified mapping of location names to coordinates
  // In a real app, you would use an API
  const locations: Record<string, [number, number]> = {
    "los angeles": [34.0522, -118.2437],
    "new york": [40.7128, -74.006],
    chicago: [41.8781, -87.6298],
    "san francisco": [37.7749, -122.4194],
    austin: [30.2672, -97.7431],
    malibu: [34.0259, -118.7798],
    london: [51.5074, -0.1278],
    paris: [48.8566, 2.3522],
    tokyo: [35.6762, 139.6503],
    sydney: [-33.8688, 151.2093],
    berlin: [52.52, 13.405],
    rome: [41.9028, 12.4964],
    madrid: [40.4168, -3.7038],
    barcelona: [41.3851, 2.1734],
    amsterdam: [52.3676, 4.9041],
    dubai: [25.2048, 55.2708],
    singapore: [1.3521, 103.8198],
    "hong kong": [22.3193, 114.1694],
    toronto: [43.6532, -79.3832],
    vancouver: [49.2827, -123.1207],
    miami: [25.7617, -80.1918],
    "las vegas": [36.1699, -115.1398],
    seattle: [47.6062, -122.3321],
    boston: [42.3601, -71.0589],
    denver: [39.7392, -104.9903],
    mojacar: [37.139, -1.8513],
    spain: [40.4637, -3.7492],
  }

  // Search for the location in our database
  const normalizedName = locationName.toLowerCase().trim()

  // Try exact match first
  if (locations[normalizedName]) {
    return locations[normalizedName]
  }

  // Try partial match
  for (const [name, coords] of Object.entries(locations)) {
    if (normalizedName.includes(name) || name.includes(normalizedName)) {
      return coords
    }
  }

  // If no match found, return null
  return null
}

// Simulate reverse geocoding for demo purposes
function simulateReverseGeocode(lat: number, lng: number): string {
  // This is a simplified mapping of coordinates to location names
  // In a real app, you would use an API
  const locations = [
    { coords: [34.0522, -118.2437], name: "Los Angeles, CA" },
    { coords: [40.7128, -74.006], name: "New York, NY" },
    { coords: [41.8781, -87.6298], name: "Chicago, IL" },
    { coords: [37.7749, -122.4194], name: "San Francisco, CA" },
    { coords: [30.2672, -97.7431], name: "Austin, TX" },
    { coords: [34.0259, -118.7798], name: "Malibu Beach, CA" },
    { coords: [37.139, -1.8513], name: "Mojácar, Spain" },
    { coords: [40.4637, -3.7492], name: "Madrid, Spain" },
  ]

  // Find the closest location
  let closestLocation = locations[0]
  let minDistance = calculateDistance(lat, lng, closestLocation.coords[0], closestLocation.coords[1])

  for (let i = 1; i < locations.length; i++) {
    const distance = calculateDistance(lat, lng, locations[i].coords[0], locations[i].coords[1])
    if (distance < minDistance) {
      minDistance = distance
      closestLocation = locations[i]
    }
  }

  // If we're close to a known location, return it
  if (minDistance < 50) {
    // Within 50km
    return closestLocation.name
  }

  // Otherwise, return a generic location based on coordinates
  return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
}

// Calculate distance between two coordinates in kilometers
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

