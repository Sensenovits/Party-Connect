import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Update the initialEvents array with new sample events using the provided images
const initialEvents = [
  {
    id: "sample-1",
    title: "Summer Beach Party 2025",
    date: new Date("2025-07-15T18:00:00"),
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images%20%282%29.jfif-wGzyxfLowH890Zy5LRsiZXMAzMH2f7.jpeg", // Let's Party image
    description: "[SAMPLE EVENT] Join us for the ultimate beach party! Live music, games, and refreshments.",
    location: "Malibu Beach, California",
    coordinates: [34.0259, -118.7798],
    category: "party",
    creator: {
      id: "101",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      createdEvents: [1, 2, 3],
      sponsoredEvents: [1],
    },
    contributors: [],
    participants: ["101"],
    requirements: [
      { id: "1", type: "Food", description: "Beach snacks and refreshments", filled: false },
      { id: "2", type: "Music", description: "Portable speakers", filled: false },
    ],
  },
  {
    id: "sample-2",
    title: "Elegant Dance Night",
    date: new Date("2025-08-05T20:00:00"),
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/226183633-vector-stock-illustration-handwritten-lettering-of-dance-party-template-for-banner-card-label.jpg-gkOH1O8sx1S9nOhvpcwjQs24G3kdzq.jpeg", // Dance Party image
    description: "[SAMPLE EVENT] An evening of elegant dancing with professional instructors.",
    location: "Grand Ballroom, New York",
    coordinates: [40.7128, -74.006],
    category: "cultural",
    creator: {
      id: "102",
      name: "Emma Dance",
      avatar: "/placeholder.svg?height=40&width=40",
      createdEvents: [1],
      sponsoredEvents: [],
    },
    contributors: [],
    participants: ["102"],
    requirements: [],
  },
  {
    id: "sample-3",
    title: "Retro Disco Night",
    date: new Date("2025-09-20T21:00:00"),
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/178307115-disco-night-party-banner-retro-music-poster-party-template-dj-80s-disco-ball-party-70s.jpg-98n93v6R9UmSczr4jD2Wk7GTBZq3If.jpeg", // Disco Party image
    description: "[SAMPLE EVENT] Step back in time with our retro disco night! 70s and 80s hits all night long.",
    location: "Studio 54, Chicago",
    coordinates: [41.8781, -87.6298],
    category: "music",
    creator: {
      id: "103",
      name: "Disco Dave",
      avatar: "/placeholder.svg?height=40&width=40",
      createdEvents: [1, 2],
      sponsoredEvents: [],
    },
    contributors: [],
    participants: ["103"],
    requirements: [],
  },
  {
    id: "sample-4",
    title: "Purple Party Extravaganza",
    date: new Date("2025-10-15T19:00:00"),
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images%20%281%29.jfif-rC5RShbgVdM2XJTQg50qtTd7XrPnOI.jpeg", // Purple Let's Party image
    description: "[SAMPLE EVENT] A colorful celebration with games, prizes, and entertainment!",
    location: "Party Palace, San Francisco",
    coordinates: [37.7749, -122.4194],
    category: "party",
    creator: {
      id: "104",
      name: "Party Pro",
      avatar: "/placeholder.svg?height=40&width=40",
      createdEvents: [1],
      sponsoredEvents: [],
    },
    contributors: [],
    participants: ["104"],
    requirements: [],
  },
  {
    id: "sample-5",
    title: "Day Party in the Park",
    date: new Date("2025-07-25T12:00:00"),
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-w2MnnOs50RgikKRh2DaGJPFCvkvXNC.png", // Day Party image
    description: "[SAMPLE EVENT] Family-friendly day party with balloon artists and face painting!",
    location: "Central Park, Austin",
    coordinates: [30.2672, -97.7431],
    category: "family",
    creator: {
      id: "105",
      name: "Family Fun Events",
      avatar: "/placeholder.svg?height=40&width=40",
      createdEvents: [1],
      sponsoredEvents: [1],
    },
    contributors: [],
    participants: ["105"],
    requirements: [],
  },
  {
    id: "sample-6",
    title: "Neon Party Time",
    date: new Date("2025-08-30T22:00:00"),
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images.jfif-EiCrNfdKKoACpQpdVURdHai9iBkbOZ.jpeg", // Party Time image
    description: "[SAMPLE EVENT] Glow in the dark party with neon decorations and UV paint!",
    location: "Neon Club, Miami",
    coordinates: [25.7617, -80.1918],
    category: "party",
    creator: {
      id: "106",
      name: "Neon Nights",
      avatar: "/placeholder.svg?height=40&width=40",
      createdEvents: [1],
      sponsoredEvents: [],
    },
    contributors: [],
    participants: ["106"],
    requirements: [],
  },
  {
    id: "sample-7",
    title: "Rainbow Celebration",
    date: new Date("2025-06-15T16:00:00"),
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/istockphoto-1041176238-612x612.jpg-v0ErPq8YLhPsIvdngTEZScWjk7oZUC.jpeg", // Colorful Let's Party image
    description: "[SAMPLE EVENT] A vibrant celebration of colors, music, and community!",
    location: "Rainbow Plaza, Seattle",
    coordinates: [47.6062, -122.3321],
    category: "community",
    creator: {
      id: "107",
      name: "Community Events",
      avatar: "/placeholder.svg?height=40&width=40",
      createdEvents: [1, 2],
      sponsoredEvents: [],
    },
    contributors: [],
    participants: ["107"],
    requirements: [],
  },
  {
    id: "sample-8",
    title: "Modern Party Design Workshop",
    date: new Date("2025-07-01T14:00:00"),
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pd-s_new-E5fRYw05NSmYc8uCAH7bRTbfIbOm5n.webp", // Party Design image
    description: "[SAMPLE EVENT] Learn modern party planning and design techniques from experts!",
    location: "Design Studio, Los Angeles",
    coordinates: [34.0522, -118.2437],
    category: "education",
    creator: {
      id: "108",
      name: "Design Pro",
      avatar: "/placeholder.svg?height=40&width=40",
      createdEvents: [1],
      sponsoredEvents: [],
    },
    contributors: [],
    participants: ["108"],
    requirements: [],
  },
]

export interface Event {
  id: string
  title: string
  date: Date
  image: string
  description: string
  location: string
  coordinates?: [number, number] // [latitude, longitude]
  creator: {
    id: string
    name: string
    avatar: string
    createdEvents: number[]
    sponsoredEvents: number[]
  }
  contributors: any[]
  requirements: {
    id: string
    type: string
    description: string
    filled: boolean
  }[]
  participants?: string[] // Array of user IDs who joined
  category?: string // Added category field
}

// Add the rateParticipant function to the EventStore interface
interface EventStore {
  events: Event[]
  addEvent: (event: Event) => void
  getEvent: (id: string) => Event | undefined
  joinEvent: (eventId: string, userId: string) => void
  contributeToEvent: (eventId: string, contribution: any) => void
  getEventsByDistance: (userLocation: [number, number], maxDistance: number) => Event[]
  getEventsByLocation: (location: string) => Event[]
  getEventsByCategory: (category: string) => Event[]
  rateParticipant: (eventId: string, participantId: string, rating: number) => void
  forceUpdate: () => void // Add a function to force update
}

// Helper function to calculate distance between two coordinates in kilometers
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

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: initialEvents,

      addEvent: (event) => {
        console.log("Adding event to store:", event.id, "with coordinates:", event.coordinates)

        // Ensure coordinates are in correct format
        const processedEvent = { ...event }

        if (event.coordinates) {
          try {
            // Validate and convert coordinates
            const lat =
              typeof event.coordinates[0] === "number"
                ? event.coordinates[0]
                : Number.parseFloat(event.coordinates[0] as any)

            const lng =
              typeof event.coordinates[1] === "number"
                ? event.coordinates[1]
                : Number.parseFloat(event.coordinates[1] as any)

            if (!isNaN(lat) && !isNaN(lng)) {
              // Create a new array to ensure it's not a reference to the original
              processedEvent.coordinates = [lat, lng] as [number, number]
              console.log("Processed coordinates for event:", processedEvent.id, processedEvent.coordinates)
            } else {
              console.warn("Invalid coordinates detected for event:", event.id)
            }
          } catch (err) {
            console.error("Error processing coordinates for event:", event.id, err)
          }
        }

        // Initialize participants array if not present
        if (!processedEvent.participants) {
          processedEvent.participants = [processedEvent.creator.id]
        }

        // Add the event to the store
        set((state) => {
          const newEvents = [...state.events, processedEvent]
          console.log(`Store now has ${newEvents.length} events`)
          return { events: newEvents }
        })

        // Force a storage sync
        if (typeof window !== "undefined") {
          try {
            const storeData = JSON.stringify({ state: { events: [...get().events, processedEvent] } })
            localStorage.setItem("event-storage", storeData)
            console.log("Manually synced event store to localStorage")
          } catch (err) {
            console.error("Error manually syncing to localStorage:", err)
          }
        }
      },

      getEvent: (id) => {
        return get().events.find((event) => event.id === id)
      },

      joinEvent: (eventId, userId) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  participants: [...(event.participants || []), userId],
                }
              : event,
          ),
        }))
      },

      contributeToEvent: (eventId, contribution) => {
        set((state) => ({
          events: state.events.map((event) => {
            if (event.id !== eventId) return event

            // Check if this contribution is filling a requirement
            let updatedRequirements = [...event.requirements]
            if (contribution.requirementId) {
              updatedRequirements = event.requirements.map((req) =>
                req.id === contribution.requirementId ? { ...req, filled: true } : req,
              )
            }

            // Add user to participants if not already there
            const updatedParticipants = [...(event.participants || [])]
            if (contribution.userId && !updatedParticipants.includes(contribution.userId)) {
              updatedParticipants.push(contribution.userId)
            }

            return {
              ...event,
              contributors: [...(event.contributors || []), contribution],
              requirements: updatedRequirements,
              participants: updatedParticipants,
            }
          }),
        }))
      },

      getEventsByDistance: (userLocation, maxDistance) => {
        const events = get().events
        return events.filter((event) => {
          if (!event.coordinates) return false

          const distance = calculateDistance(
            userLocation[0],
            userLocation[1],
            event.coordinates[0],
            event.coordinates[1],
          )

          return distance <= maxDistance
        })
      },

      getEventsByLocation: (location) => {
        const events = get().events
        const searchTerm = location.toLowerCase()

        return events.filter((event) => event.location.toLowerCase().includes(searchTerm))
      },

      getEventsByCategory: (category) => {
        const events = get().events
        return events.filter((event) => event.category === category)
      },

      rateParticipant: (eventId, participantId, rating) => {
        if (!eventId || !participantId) {
          console.error("Missing eventId or participantId in rateParticipant")
          return
        }

        set((state) => ({
          events: state.events.map((event) => {
            if (event.id !== eventId) return event

            // Update the rating for the participant in contributors
            const updatedContributors =
              event.contributors?.map((contributor) => {
                if (!contributor) return contributor

                if (contributor.id === participantId || contributor.userId === participantId) {
                  return { ...contributor, rating }
                }
                return contributor
              }) || []

            return {
              ...event,
              contributors: updatedContributors,
            }
          }),
        }))
      },

      // Add a function to force update the store
      forceUpdate: () => {
        set((state) => ({ ...state }))
      },
    }),
    {
      name: "event-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ events: state.events }),
      // Add onRehydrateStorage to log when store is rehydrated
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Event store rehydrated with", state.events.length, "events")
        }
      },
    },
  ),
)

