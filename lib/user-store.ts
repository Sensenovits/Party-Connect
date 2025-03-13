import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  name: string
  avatar: string
  email?: string
  bio: string
  location: string
  coordinates?: [number, number] // [latitude, longitude]
  preferences: string
  createdEvents: string[]
  joinedEvents: string[]
  sponsoredEvents: string[]
  positiveRatings: number
  successfulEvents: number
}

// Mock current user
const initialUser: User = {
  id: "current-user",
  name: "You (Current User)",
  avatar: "/placeholder.svg?height=100&width=100",
  bio: "Event enthusiast and community organizer. Love bringing people together!",
  location: "Los Angeles, CA",
  coordinates: [34.0522, -118.2437], // Los Angeles coordinates
  preferences: "Pop, Rock, Electronic",
  createdEvents: [],
  joinedEvents: [],
  sponsoredEvents: [],
  positiveRatings: 0,
  successfulEvents: 0,
}

interface UserStore {
  currentUser: User
  updateProfile: (updates: Partial<User>) => void
  addCreatedEvent: (eventId: string) => void
  addJoinedEvent: (eventId: string) => void
  addSponsoredEvent: (eventId: string) => void
  updateLocation: (coordinates: [number, number], locationName: string) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: initialUser,

      updateProfile: (updates) => {
        set((state) => ({
          currentUser: { ...state.currentUser, ...updates },
        }))
      },

      addCreatedEvent: (eventId) => {
        set((state) => ({
          currentUser: {
            ...state.currentUser,
            createdEvents: [...state.currentUser.createdEvents, eventId],
          },
        }))
      },

      addJoinedEvent: (eventId) => {
        set((state) => {
          // Check if already joined
          if (state.currentUser.joinedEvents.includes(eventId)) {
            return state
          }

          return {
            currentUser: {
              ...state.currentUser,
              joinedEvents: [...state.currentUser.joinedEvents, eventId],
            },
          }
        })
      },

      addSponsoredEvent: (eventId) => {
        set((state) => ({
          currentUser: {
            ...state.currentUser,
            sponsoredEvents: [...state.currentUser.sponsoredEvents, eventId],
          },
        }))
      },

      updateLocation: (coordinates, locationName) => {
        set((state) => ({
          currentUser: {
            ...state.currentUser,
            coordinates,
            location: locationName,
          },
        }))
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ currentUser: state.currentUser }),
    },
  ),
)

