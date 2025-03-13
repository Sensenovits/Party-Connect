"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

// Mock notification data
const mockNotifications = [
  {
    id: "1",
    type: "event_invite",
    user: {
      id: "102",
      name: "Sam Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    event: {
      id: "1",
      title: "Summer Beach Party",
    },
    timestamp: new Date("2025-03-05T14:30:00"),
    isRead: false,
  },
  {
    id: "2",
    type: "new_contribution",
    user: {
      id: "103",
      name: "Emily Parker",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    event: {
      id: "2",
      title: "Tech Meetup 2025",
    },
    contribution: "Food",
    timestamp: new Date("2025-03-05T10:15:00"),
    isRead: false,
  },
  {
    id: "3",
    type: "event_reminder",
    event: {
      id: "1",
      title: "Summer Beach Party",
    },
    timestamp: new Date("2025-03-04T18:45:00"),
    isRead: true,
  },
  {
    id: "4",
    type: "new_rating",
    user: {
      id: "104",
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    rating: 5,
    timestamp: new Date("2025-03-03T09:20:00"),
    isRead: true,
  },
]

export function NotificationsList() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    )
  }

  const getNotificationContent = (notification: any) => {
    switch (notification.type) {
      case "event_invite":
        return (
          <>
            <span className="font-medium">{notification.user.name}</span>
            {" invited you to "}
            <span className="font-medium">{notification.event.title}</span>
          </>
        )
      case "new_contribution":
        return (
          <>
            <span className="font-medium">{notification.user.name}</span>
            {" offered to bring "}
            <span className="font-medium">{notification.contribution}</span>
            {" to "}
            <span className="font-medium">{notification.event.title}</span>
          </>
        )
      case "event_reminder":
        return (
          <>
            {"Reminder: "}
            <span className="font-medium">{notification.event.title}</span>
            {" is happening soon!"}
          </>
        )
      case "new_rating":
        return (
          <>
            <span className="font-medium">{notification.user.name}</span>
            {" gave you a "}
            <span className="font-medium">{notification.rating}-star rating</span>
          </>
        )
      default:
        return "New notification"
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Recent Notifications</h2>
        <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={!notifications.some((n) => !n.isRead)}>
          Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className={`p-4 rounded-lg ${notification.isRead ? "bg-white" : "bg-blue-50"}`}>
            <div className="flex">
              {notification.user && (
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                  <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}

              {!notification.user && (
                <div className="h-10 w-10 mr-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">!</span>
                </div>
              )}

              <div className="flex-1">
                <p className={`${!notification.isRead ? "font-medium" : ""}`}>{getNotificationContent(notification)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                </p>
              </div>

              {!notification.isRead && <div className="h-2 w-2 bg-blue-600 rounded-full self-start mt-2"></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

