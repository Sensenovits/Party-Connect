"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserAchievementIcons } from "@/lib/achievements"
import { formatDate } from "@/lib/utils"
import { MapPin, Calendar, MessageCircle } from "lucide-react"
import { ContributionForm } from "@/components/events/contribution-form"
import { toast } from "@/components/ui/use-toast"
import { useEventStore, type Event } from "@/lib/event-store"
import { useUserStore } from "@/lib/user-store"
import { EventMap } from "@/components/map/event-map"
import { StarRating } from "@/components/ui/star-rating"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { UserProfileDialog } from "@/components/profile/user-profile-dialog"
import { MessageDialog } from "@/components/messages/message-dialog"

interface EventDetailsProps {
  eventId: string
}

export function EventDetails({ eventId }: EventDetailsProps) {
  const { getEvent, joinEvent, rateParticipant } = useEventStore()
  const { currentUser, addJoinedEvent } = useUserStore()
  const [event, setEvent] = useState<Event | null>(null)
  const [showContributionForm, setShowContributionForm] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const fetchedEvent = getEvent(eventId)
      if (fetchedEvent) {
        // Ensure date is a Date object
        setEvent({
          ...fetchedEvent,
          date: new Date(fetchedEvent.date),
        })
      }

      // Check if user has already joined
      setHasJoined(currentUser?.joinedEvents?.includes(eventId) || false)
    } catch (error) {
      console.error("Error fetching event:", error)
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      })
    }
  }, [eventId, getEvent, currentUser])

  const handleJoinEvent = async () => {
    if (!event) return

    setIsJoining(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update both stores
      joinEvent(eventId, currentUser.id)
      addJoinedEvent(eventId)

      setHasJoined(true)

      toast({
        title: "Success",
        description: "You have joined the event!",
      })
    } catch (error) {
      console.error("Error joining event:", error)
      toast({
        title: "Error",
        description: "Failed to join the event",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const handleRateParticipant = (participant: any) => {
    if (!participant) return

    setSelectedParticipant(participant)
    setRatingValue(participant.rating || 0)
    setShowRatingDialog(true)
  }

  const submitRating = () => {
    if (!selectedParticipant || !event) return

    try {
      // Update the rating in the store
      rateParticipant(event.id, selectedParticipant.id, ratingValue)

      toast({
        title: "Rating Submitted",
        description: `You rated ${selectedParticipant.name} with ${ratingValue} stars`,
      })

      // Close the dialog and refresh the event data
      setShowRatingDialog(false)
      const updatedEvent = getEvent(eventId)
      if (updatedEvent) {
        setEvent({
          ...updatedEvent,
          date: new Date(updatedEvent.date),
        })
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      })
    }
  }

  const handleViewProfile = (user: any) => {
    setSelectedUser(user)
    setShowProfileDialog(true)
  }

  const handleMessageUser = (userId: string) => {
    setSelectedConversationId(userId)
    setShowMessageDialog(true)
  }

  if (!event) {
    return <div className="text-center py-10">Event not found</div>
  }

  return (
    <div>
      <div className="relative h-64 w-full mb-4">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="h-full w-full object-cover rounded-lg"
        />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{event.title}</h1>

        <div className="flex items-center text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(event.date)}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{event.location}</span>
        </div>

        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
            <img
              src={event.creator?.avatar || "/placeholder.svg"}
              alt={event.creator?.name || "Creator"}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm text-gray-500">Created by</p>
            <div className="flex items-center">
              <button
                className="font-medium text-blue-600 hover:underline"
                onClick={() => handleViewProfile(event.creator)}
              >
                {event.creator?.name || "Unknown"}
              </button>
              {event.creator && (
                <div className="ml-2 flex">
                  {getUserAchievementIcons(event.creator).map((achievement) => (
                    <span
                      key={achievement.id}
                      className={`inline-flex items-center justify-center rounded-full w-6 h-6 ${achievement.color} text-xs mr-1`}
                      title={`${achievement.name}: ${achievement.description}`}
                    >
                      {achievement.icon}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-700 mb-6">{event.description}</p>

        <div className="flex space-x-4 mb-8">
          <Button className="flex-1" onClick={handleJoinEvent} disabled={isJoining || hasJoined}>
            {isJoining ? "Joining..." : hasJoined ? "Joined" : "Join Event"}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setShowContributionForm(true)}>
            Contribute
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="w-full">
          <TabsTrigger value="details" className="flex-1">
            Details
          </TabsTrigger>
          <TabsTrigger value="contributors" className="flex-1">
            Contributors
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex-1">
            Participants
          </TabsTrigger>
          <TabsTrigger value="requirements" className="flex-1">
            Requirements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">About this event</h3>
              <p className="text-gray-700">{event.description}</p>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Location</h3>
                {event.coordinates ? (
                  <div className="h-40 rounded-lg overflow-hidden">
                    <EventMap events={[event]} userLocation={currentUser.coordinates} height="160px" />
                  </div>
                ) : (
                  <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-500" />
                    <span className="ml-2 text-gray-500">Map view not available</span>
                  </div>
                )}
                <p className="mt-2 text-gray-700">{event.location}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Event Contributors</h3>

              {event.contributors && event.contributors.length > 0 ? (
                <div className="space-y-4">
                  {event.contributors.map((contributor) => (
                    <div key={contributor.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                        <img
                          src={contributor.avatar || "/placeholder.svg"}
                          alt={contributor.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <button
                            className="font-medium text-blue-600 hover:underline"
                            onClick={() => handleViewProfile(contributor)}
                          >
                            {contributor.name}
                          </button>
                          <div className="ml-2 flex">
                            {getUserAchievementIcons(contributor).map((achievement) => (
                              <span
                                key={achievement.id}
                                className={`inline-flex items-center justify-center rounded-full w-5 h-5 ${achievement.color} text-xs mr-1`}
                                title={`${achievement.name}: ${achievement.description}`}
                              >
                                {achievement.icon}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{contributor.role}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={contributor.rating || 0} size="sm" />
                        <span className="text-sm">{contributor.rating || 0}</span>

                        {/* Only show rate button if current user is event creator */}
                        {event.creator.id === currentUser.id && contributor.userId !== currentUser.id && (
                          <Button variant="outline" size="sm" onClick={() => handleRateParticipant(contributor)}>
                            Rate
                          </Button>
                        )}

                        {/* Message button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMessageUser(contributor.userId || contributor.id)}
                          className="text-blue-600"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No contributors yet. Be the first to contribute!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Event Participants</h3>

              {event.participants && event.participants.length > 0 ? (
                <div className="space-y-4">
                  {event.participants.map((participantId) => {
                    // Find participant details
                    const participant = event.contributors?.find((c) => c.userId === participantId) || {
                      id: participantId,
                      userId: participantId,
                      name: participantId === currentUser.id ? "You" : "Participant",
                      avatar: "/placeholder.svg?height=40&width=40",
                      rating: 0,
                    }

                    return (
                      <div key={participantId} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                          <img
                            src={participant.avatar || "/placeholder.svg?height=40&width=40"}
                            alt={participant.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <button
                              className="font-medium text-blue-600 hover:underline"
                              onClick={() => handleViewProfile(participant)}
                            >
                              {participant.name}
                            </button>
                          </div>
                          <div className="flex items-center mt-1">
                            <StarRating rating={participant.rating || 0} size="sm" />
                            <span className="ml-1 text-xs text-gray-500">
                              {participant.rating ? `${participant.rating} stars` : "Not rated yet"}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {/* Only show rate button if current user is event creator */}
                          {event.creator.id === currentUser.id && participantId !== currentUser.id && (
                            <Button variant="outline" size="sm" onClick={() => handleRateParticipant(participant)}>
                              Rate
                            </Button>
                          )}

                          {/* Message button */}
                          {participantId !== currentUser.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMessageUser(participantId)}
                              className="text-blue-600"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No participants yet. Be the first to join!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Event Requirements</h3>

              {event.requirements && event.requirements.length > 0 ? (
                <div className="space-y-3">
                  {event.requirements.map((req) => (
                    <div key={req.id} className="flex items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{req.type}</h4>
                        <p className="text-sm text-gray-500">{req.description}</p>
                      </div>
                      <div>
                        {req.filled ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Filled</span>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setShowContributionForm(true)}>
                            Contribute
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No requirements specified for this event.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showContributionForm && <ContributionForm eventId={event.id} onClose={() => setShowContributionForm(false)} />}

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate Participant</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {selectedParticipant && (
              <>
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                    <img
                      src={selectedParticipant.avatar || "/placeholder.svg?height=40&width=40"}
                      alt={selectedParticipant.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{selectedParticipant.name}</p>
                    <p className="text-sm text-gray-500">Event Participant</p>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="mb-2">How would you rate this participant?</p>
                  <div className="flex justify-center mb-2">
                    <StarRating rating={ratingValue} size="lg" interactive={true} onRatingChange={setRatingValue} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {ratingValue === 1 && "Poor"}
                    {ratingValue === 2 && "Fair"}
                    {ratingValue === 3 && "Good"}
                    {ratingValue === 4 && "Very Good"}
                    {ratingValue === 5 && "Excellent"}
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitRating} disabled={ratingValue === 0}>
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Profile Dialog */}
      {showProfileDialog && selectedUser && (
        <UserProfileDialog
          user={selectedUser}
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          onMessage={() => {
            setShowProfileDialog(false)
            handleMessageUser(selectedUser.id || selectedUser.userId)
          }}
          eventId={eventId}
        />
      )}

      {/* Message Dialog */}
      {showMessageDialog && selectedConversationId && (
        <MessageDialog
          conversationId={selectedConversationId}
          eventId={eventId}
          open={showMessageDialog}
          onOpenChange={setShowMessageDialog}
        />
      )}
    </div>
  )
}

