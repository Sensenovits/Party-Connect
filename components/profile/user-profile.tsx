"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserAchievements } from "@/lib/achievements"
import { ProfileEditDialog } from "./profile-edit-dialog"
import { Settings, LogOut, Navigation, MapPin } from "lucide-react"
import { useUserStore } from "@/lib/user-store"
import { useEventStore, type Event } from "@/lib/event-store"
import { formatDate } from "@/lib/utils"
import { EventMap } from "@/components/map/event-map"
import { LocationFilter } from "@/components/map/location-filter"
import { getCurrentLocation, getLocationName } from "@/lib/location-service"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { getUserAchievementIcons } from "@/lib/achievement-icons"

export function UserProfile() {
  const router = useRouter()
  const { currentUser, updateLocation } = useUserStore()
  const { events } = useEventStore()
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const [userEvents, setUserEvents] = useState<{
    created: Event[]
    joined: Event[]
  }>({
    created: [],
    joined: [],
  })
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [activeFilter, setActiveFilter] = useState<{
    type: "distance" | "location" | null
    value: number | string | null
  }>({ type: null, value: null })

  const userAchievements = getUserAchievements(currentUser)

  useEffect(() => {
    // Filter events created by the user
    const createdEvents = events.filter(
      (event) => event.creator.id === currentUser.id || currentUser.createdEvents.includes(event.id),
    )

    // Filter events joined by the user
    const joinedEvents = events.filter((event) => currentUser.joinedEvents.includes(event.id))

    // Convert dates from string to Date objects (needed for persisted store)
    const processCreated = createdEvents.map((event) => ({
      ...event,
      date: new Date(event.date),
    }))

    const processJoined = joinedEvents.map((event) => ({
      ...event,
      date: new Date(event.date),
    }))

    setUserEvents({
      created: processCreated,
      joined: processJoined,
    })

    // Set initial filtered events to all user events
    setFilteredEvents([...processCreated, ...processJoined])
  }, [events, currentUser])

  // Apply filters when they change
  useEffect(() => {
    const allUserEvents = [...userEvents.created, ...userEvents.joined]

    if (activeFilter.type === "distance" && currentUser.coordinates) {
      const maxDistance = activeFilter.value as number
      const nearbyEvents = allUserEvents.filter((event) => {
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
      const locationEvents = allUserEvents.filter((event) => event.location.toLowerCase().includes(locationQuery))

      setFilteredEvents(locationEvents)
    } else {
      setFilteredEvents(allUserEvents)
    }
  }, [userEvents, activeFilter, currentUser.coordinates])

  const handleFilterChange = (filter: { type: "distance" | "location"; value: number | string }) => {
    setActiveFilter(filter)
  }

  const handleLocationChange = (coordinates: [number, number], locationName: string) => {
    updateLocation(coordinates, locationName)
  }

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const updateUserLocation = async () => {
    setIsUpdatingLocation(true)

    try {
      const coordinates = await getCurrentLocation()
      const locationName = await getLocationName(coordinates[0], coordinates[1])

      updateLocation(coordinates, locationName)

      toast({
        title: "Location updated",
        description: `Your location: ${locationName}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not get your location. Please check your browser permissions.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingLocation(false)
    }
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

  return (
    <div>
      <div className="flex flex-col items-center py-4 mb-6">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
          <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <h2 className="text-xl font-bold">{currentUser.name}</h2>
        <div className="flex items-center text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{currentUser.location}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-6 px-2"
            onClick={updateUserLocation}
            disabled={isUpdatingLocation}
          >
            <Navigation className="h-3 w-3 mr-1" />
            {isUpdatingLocation ? "Updating..." : "Update"}
          </Button>
        </div>

        {getUserAchievementIcons(currentUser).length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {getUserAchievementIcons(currentUser).map((achievement) => (
              <span
                key={achievement.id}
                className={`inline-flex items-center justify-center rounded-full px-3 py-1 ${achievement.color} text-xs`}
              >
                {achievement.icon} {achievement.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-center text-gray-700 mb-4">{currentUser.bio}</p>

        <Button onClick={() => setEditProfileOpen(true)}>Edit Profile</Button>
      </div>

      <Tabs defaultValue="events">
        <TabsList className="w-full">
          <TabsTrigger value="events" className="flex-1">
            My Events
          </TabsTrigger>
          <TabsTrigger value="joined" className="flex-1">
            Joined Events
          </TabsTrigger>
          <TabsTrigger value="map" className="flex-1">
            Map View
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex-1">
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          {userEvents.created.length > 0 ? (
            <div className="space-y-4">
              {userEvents.created.map((event) => (
                <div key={event.id} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="h-16 w-24 rounded overflow-hidden mr-3">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Creator</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">You haven't created any events yet.</p>
              <Button className="mt-4" onClick={() => router.push("/create-event")}>
                Create an Event
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined">
          {userEvents.joined.length > 0 ? (
            <div className="space-y-4">
              {userEvents.joined.map((event) => (
                <div key={event.id} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="h-16 w-24 rounded overflow-hidden mr-3">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Participant</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">You haven't joined any events yet.</p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Explore Events
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <div className="space-y-4">
            <LocationFilter onFilterChange={handleFilterChange} onLocationChange={handleLocationChange} />

            {activeFilter.type && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  {activeFilter.type === "distance"
                    ? `Events within ${activeFilter.value}km of your location`
                    : `Events in "${activeFilter.value}"`}
                </h3>
                <p className="text-sm text-gray-500">
                  {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
                </p>
              </div>
            )}

            <EventMap
              events={filteredEvents}
              userLocation={currentUser.coordinates}
              onEventClick={handleEventClick}
              height="400px"
            />

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Event Legend</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">Your Location</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Event Location</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
            <div>
              <h4 className="font-medium mb-2">Preferred Music Genres</h4>
              <p className="text-gray-700">{currentUser.preferences}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Location Settings</h4>
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{currentUser.location}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={updateUserLocation}
                disabled={isUpdatingLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isUpdatingLocation ? "Updating location..." : "Update my location"}
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium mb-2">Account</h4>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ProfileEditDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} user={currentUser} />
    </div>
  )
}

