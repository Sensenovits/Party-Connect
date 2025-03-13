"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Calendar, MapPin } from "lucide-react"
import { MessageDialog } from "./message-dialog"
import { useEventStore } from "@/lib/event-store"
import { useUserStore } from "@/lib/user-store"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

interface Conversation {
  id: string
  eventId: string
  user: {
    id: string
    name: string
    avatar: string
  }
  lastMessage: {
    text: string
    timestamp: Date
    isRead: boolean
    sentByMe: boolean
  }
}

export function MessagesTab() {
  const router = useRouter()
  const { events } = useEventStore()
  const { currentUser } = useUserStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const loadConversations = () => {
        const allConversations: Conversation[] = []
        const processedConversations = new Set<string>() // Track processed conversations to avoid duplicates

        // Check localStorage for all keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)

          // Process event-specific messages
          if (key && key.includes("_messages")) {
            try {
              const storedMessages = localStorage.getItem(key)
              if (!storedMessages) continue

              const messages = JSON.parse(storedMessages)
              if (!Array.isArray(messages) || messages.length === 0) continue

              // Extract event ID and user ID from the key
              let eventId = ""
              let userId = ""

              // Handle different key formats
              if (key.startsWith("event_")) {
                // Format: event_[eventId]_user_[userId]_messages
                const parts = key.split("_")
                if (parts.length >= 4) {
                  eventId = parts[1]
                  userId = parts[3]
                }
              } else if (key.startsWith("user_")) {
                // Format: user_[userId]_messages
                const parts = key.split("_")
                if (parts.length >= 3) {
                  userId = parts[1]
                }
              }

              // Skip if we've already processed this conversation
              const conversationKey = `${eventId}_${userId}`
              if (processedConversations.has(conversationKey)) continue
              processedConversations.add(conversationKey)

              // Get the last message
              const lastMsg = messages[messages.length - 1]

              // Find event details if available
              const event = events.find((e) => e.id === eventId)

              // Find user details
              let userName = "Unknown User"
              let userAvatar = "/placeholder.svg?height=40&width=40"

              // Check if this is the event creator
              if (event && event.creator && event.creator.id === userId) {
                userName = event.creator.name
                userAvatar = event.creator.avatar
              }
              // Check if this is a contributor
              else if (event && event.contributors) {
                const contributor = event.contributors.find((c) => c.userId === userId || c.id === userId)
                if (contributor) {
                  userName = contributor.name
                  userAvatar = contributor.avatar
                }
              }

              // Determine if the last message was sent by the current user
              const sentByMe = lastMsg.senderId === "currentUser"

              allConversations.push({
                id: userId,
                eventId: eventId,
                user: {
                  id: userId,
                  name: userName,
                  avatar: userAvatar,
                },
                lastMessage: {
                  text: lastMsg.text || "",
                  timestamp: new Date(lastMsg.timestamp),
                  isRead: false,
                  sentByMe: sentByMe,
                },
              })
            } catch (err) {
              console.error(`Error processing message key ${key}:`, err)
            }
          }
        }

        // Add mock conversations for demo purposes if no real conversations exist
        if (allConversations.length === 0 && events && events.length > 0) {
          // Add a mock conversation for the first event
          const firstEvent = events[0]
          if (firstEvent && firstEvent.creator) {
            allConversations.push({
              id: firstEvent.creator.id,
              eventId: firstEvent.id,
              user: {
                id: firstEvent.creator.id,
                name: firstEvent.creator.name || "Event Creator",
                avatar: firstEvent.creator.avatar || "/placeholder.svg?height=40&width=40",
              },
              lastMessage: {
                text: "Welcome to the event! Let me know if you have any questions.",
                timestamp: new Date(),
                isRead: false,
                sentByMe: false,
              },
            })
          }
        }

        // Sort by timestamp (newest first)
        allConversations.sort((a, b) => {
          if (!a.lastMessage || !b.lastMessage) return 0
          return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime()
        })

        setConversations(allConversations)
      }

      loadConversations()
    } catch (error) {
      console.error("Error loading conversations:", error)
      setConversations([])
    }
  }, [events, currentUser])

  const formatTime = (date: Date) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
      }).format(date)
    } catch (error) {
      console.error("Error formatting time:", error)
      return ""
    }
  }

  const handleOpenConversation = (conversationId: string, eventId: string) => {
    setSelectedConversation(conversationId)
    setSelectedEventId(eventId)
  }

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search messages"
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
        <Button size="sm" onClick={() => router.push("/explore")} className="bg-blue-600 hover:bg-blue-700">
          Find Events
        </Button>
      </div>

      {filteredConversations.length > 0 ? (
        <div className="space-y-3">
          {filteredConversations.map((conversation) => {
            const event = events.find((e) => e.id === conversation.eventId)

            return (
              <Card
                key={`${conversation.id}-${conversation.eventId}`}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  conversation.lastMessage.isRead
                    ? "bg-white"
                    : conversation.lastMessage.sentByMe
                      ? "bg-blue-50/50"
                      : "bg-blue-50"
                }`}
                onClick={() => handleOpenConversation(conversation.user.id, conversation.eventId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                      <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{conversation.user.name}</h3>
                        <span className="text-xs text-gray-500">{formatTime(conversation.lastMessage.timestamp)}</span>
                      </div>
                      <p
                        className={`text-sm truncate flex items-center ${
                          conversation.lastMessage.isRead ? "text-gray-500" : "text-gray-900 font-medium"
                        }`}
                      >
                        {conversation.lastMessage.sentByMe && (
                          <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.5 mr-1.5">
                            You
                          </span>
                        )}
                        {conversation.lastMessage.text}
                      </p>

                      {event && (
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span className="truncate mr-2">
                            {format(event.date instanceof Date ? event.date : new Date(event.date), "MMM d")}
                          </span>
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? "No messages match your search" : "Join or create an event to start messaging"}
            </p>
            <Button onClick={() => router.push("/explore")} className="bg-blue-600 hover:bg-blue-700">
              Browse Events
            </Button>
          </div>
        </div>
      )}

      {selectedConversation && selectedEventId && (
        <MessageDialog
          conversationId={selectedConversation}
          eventId={selectedEventId}
          open={!!selectedConversation}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedConversation(null)
              setSelectedEventId(null)
            }
          }}
        />
      )}
    </div>
  )
}

