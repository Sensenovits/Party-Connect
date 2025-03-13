"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserAchievements } from "@/lib/achievements"
import { StarRating } from "@/components/ui/star-rating"
import { MessageCircle, Award, Calendar, MapPin } from "lucide-react"
import { useEventStore } from "@/lib/event-store"
import { formatDate } from "@/lib/utils"

interface UserProfileDialogProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onMessage?: () => void
  eventId?: string
}

export function UserProfileDialog({ user, open, onOpenChange, onMessage, eventId }: UserProfileDialogProps) {
  const { events } = useEventStore()
  const [userEvents, setUserEvents] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState<number>(0)

  useEffect(() => {
    if (!user) return

    // Get user achievements
    const userAchievements = getUserAchievements(user)
    setAchievements(userAchievements)

    // Find events created by this user
    const createdEvents = events.filter(
      (event) => event.creator && (event.creator.id === user.id || event.creator.id === user.userId),
    )

    // Find events where user contributed
    const contributedEvents = events.filter(
      (event) =>
        event.contributors &&
        event.contributors.some(
          (c) => c.id === user.id || c.userId === user.id || c.id === user.userId || c.userId === user.userId,
        ),
    )

    // Combine and deduplicate events
    const allUserEvents = [...new Set([...createdEvents, ...contributedEvents])]
      .map((event) => ({
        ...event,
        date: event.date instanceof Date ? event.date : new Date(event.date),
        userRole:
          event.creator && (event.creator.id === user.id || event.creator.id === user.userId)
            ? "Creator"
            : "Contributor",
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5) // Limit to 5 most recent events

    setUserEvents(allUserEvents)

    // Calculate average rating
    let totalRating = 0
    let ratingCount = 0

    events.forEach((event) => {
      if (event.contributors) {
        event.contributors.forEach((contributor) => {
          if (
            (contributor.id === user.id ||
              contributor.userId === user.id ||
              contributor.id === user.userId ||
              contributor.userId === user.userId) &&
            contributor.rating
          ) {
            totalRating += contributor.rating
            ratingCount++
          }
        })
      }
    })

    if (ratingCount > 0) {
      setAverageRating(totalRating / ratingCount)
    }
  }, [user, events])

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.avatar || "/placeholder.svg?height=100&width=100"} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-bold">{user.name}</h2>

          {user.location && (
            <div className="flex items-center text-gray-500 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{user.location}</span>
            </div>
          )}

          <div className="flex items-center mb-2">
            <StarRating rating={averageRating} size="md" />
            <span className="ml-2 text-sm text-gray-600">
              {averageRating > 0 ? `${averageRating.toFixed(1)} average rating` : "No ratings yet"}
            </span>
          </div>

          {achievements.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {achievements.map((achievement) => (
                <span
                  key={achievement.id}
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 ${achievement.color} text-xs`}
                >
                  {achievement.icon} {achievement.name}
                </span>
              ))}
            </div>
          )}

          {user.bio && <p className="text-center text-gray-700 mb-4">{user.bio}</p>}

          <Button onClick={onMessage} className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>

        <Tabs defaultValue="events">
          <TabsList className="w-full">
            <TabsTrigger value="events" className="flex-1">
              Events
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex-1">
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="space-y-4">
              {userEvents.length > 0 ? (
                userEvents.map((event) => (
                  <div key={event.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="h-16 w-24 rounded overflow-hidden mr-3">
                      <img
                        src={event.image || "/placeholder.svg?height=80&width=120"}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block
                        ${event.userRole === "Creator" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                      >
                        {event.userRole}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No events found for this user.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="space-y-4">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div
                      className={`w-10 h-10 rounded-full ${achievement.color} flex items-center justify-center mr-3`}
                    >
                      <span className="text-lg">{achievement.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No achievements yet</p>
                  <p className="text-sm text-gray-400">
                    This user will earn achievements as they participate in events
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

