"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Send, Paperclip, Calendar, MapPin } from "lucide-react"
import { useEventStore } from "@/lib/event-store"
import { useUserStore } from "@/lib/user-store"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"

// Mock users data
const mockUsers = {
  "102": {
    id: "102",
    name: "Sam Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "103": {
    id: "103",
    name: "Emily Parker",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "104": {
    id: "104",
    name: "Michael Brown",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "101": {
    id: "101",
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "105": {
    id: "105",
    name: "Jessica Lee",
    avatar: "/placeholder.svg?height=40&width=40",
  },
}

interface MessageDialogProps {
  conversationId: string
  eventId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MessageDialog({ conversationId, eventId, open, onOpenChange }: MessageDialogProps) {
  const { events, getEvent } = useEventStore()
  const { currentUser } = useUserStore()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [event, setEvent] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Find the event based on eventId
  useEffect(() => {
    if (eventId) {
      try {
        const foundEvent = getEvent(eventId)
        setEvent(foundEvent || null)
      } catch (error) {
        console.error("Error finding event:", error)
        setEvent(null)
      }
    } else {
      setEvent(null)
    }
  }, [eventId, getEvent])

  // Find the user based on the conversationId
  const otherUser = mockUsers[conversationId as keyof typeof mockUsers] ||
    events.find((event) => event?.creator?.id === conversationId)?.creator || {
      id: conversationId,
      name: "Event Creator",
      avatar: "/placeholder.svg?height=40&width=40",
    }

  useEffect(() => {
    try {
      // Try to get messages from localStorage
      const storageKey = eventId
        ? `event_${eventId}_user_${conversationId}_messages`
        : `user_${conversationId}_messages`
      const storedMessages = localStorage.getItem(storageKey)

      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages)
        setMessages(Array.isArray(parsedMessages) ? parsedMessages : [])
      } else {
        // Default to empty array if no messages found
        setMessages([])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      setMessages([])
    }

    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversationId, eventId])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
      }).format(dateObj)
    } catch (error) {
      console.error("Error formatting time:", error)
      return ""
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    try {
      const newMsg = {
        id: `${conversationId}-${Date.now()}`,
        senderId: "currentUser",
        text: newMessage,
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...messages, newMsg]
      setMessages(updatedMessages)

      // Save to localStorage with appropriate key
      const storageKey = eventId
        ? `event_${eventId}_user_${conversationId}_messages`
        : `user_${conversationId}_messages`
      localStorage.setItem(storageKey, JSON.stringify(updatedMessages))

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 z-50">
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
              <AvatarFallback>{otherUser?.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{otherUser?.name || "Unknown User"}</DialogTitle>
              {event && (
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{format(event.date instanceof Date ? event.date : new Date(event.date), "MMM d, yyyy")}</span>
                  <span className="mx-1">•</span>
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => {
              if (!message) return null

              const isCurrentUser = message.senderId === "currentUser"
              const user = isCurrentUser
                ? { name: currentUser.name, avatar: currentUser.avatar }
                : { name: otherUser?.name, avatar: otherUser?.avatar }

              return (
                <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className="max-w-[70%]">
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isCurrentUser
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {message.text}
                    </div>
                    <div className={`text-xs mt-1 ${isCurrentUser ? "text-right" : "text-left"} text-gray-500`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Start a conversation with {otherUser?.name}</p>
              {event && <p className="mt-2 text-sm">You can discuss details about "{event.title}"</p>}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-3">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>

            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 mx-2 bg-gray-100 border-0"
            />

            <Button
              onClick={handleSendMessage}
              disabled={newMessage.trim() === ""}
              size="icon"
              className="rounded-full"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

