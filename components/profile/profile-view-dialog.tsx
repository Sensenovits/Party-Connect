"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserAchievements } from "@/lib/achievements"
import { ProfileEditDialog } from "./profile-edit-dialog"

// Define proper types
interface User {
  id: string
  name: string
  avatar: string
  bio: string
  location: string
  preferences: string
  createdEvents: number[]
  sponsoredEvents: number[]
  joinedEvents: number[]
  positiveRatings: number
  successfulEvents: number
}

interface PastEvent {
  id: string
  title: string
  date: Date
  image: string
  role: string
}

// Mock user data
const mockUser: User = {
  id: "101",
  name: "Alex Johnson",
  avatar: "/placeholder.svg?height=100&width=100",
  bio: "Event enthusiast and community organizer. Love bringing people together!",
  location: "Los Angeles, CA",
  preferences: "Pop, Rock, Electronic",
  createdEvents: [1, 2, 3],
  sponsoredEvents: [1],
  joinedEvents: [1, 2, 3, 4, 5, 6],
  positiveRatings: 15,
  successfulEvents: 12,
}

// Mock past events
const mockPastEvents: PastEvent[] = [
  {
    id: "1",
    title: "Summer Beach Party 2024",
    date: new Date("2024-07-15T18:00:00"),
    image: "/placeholder.svg?height=80&width=120",
    role: "Organizer",
  },
  {
    id: "2",
    title: "Tech Meetup 2024",
    date: new Date("2024-08-05T14:00:00"),
    image: "/placeholder.svg?height=80&width=120",
    role: "Contributor",
  },
  {
    id: "3",
    title: "Charity Gala Dinner",
    date: new Date("2024-09-20T19:00:00"),
    image: "/placeholder.svg?height=80&width=120",
    role: "Participant",
  },
]

interface ProfileViewDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProfileViewDialog({ open, onOpenChange }: ProfileViewDialogProps) {
  const [user] = useState<User>(mockUser)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const userAchievements = getUserAchievements(user)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-500 mb-2">{user.location}</p>

          {userAchievements.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {getUserAchievements(user).map((achievement) => (
                <span
                  key={achievement.id}
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 ${achievement.color} text-xs`}
                >
                  {achievement.icon} {achievement.name}
                </span>
              ))}
            </div>
          )}

          <p className="text-center text-gray-700 mb-4">{user.bio}</p>

          <Button onClick={() => setEditProfileOpen(true)}>Edit Profile</Button>
        </div>

        <Tabs defaultValue="events">
          <TabsList className="w-full">
            <TabsTrigger value="events" className="flex-1">
              Past Events
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex-1">
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="space-y-4">
              {mockPastEvents.map((event) => (
                <div key={event.id} className="flex items-center">
                  <div className="h-16 w-24 rounded overflow-hidden mr-3">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-500">{event.date.toLocaleDateString()}</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{event.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Preferred Music Genres</h4>
                <p className="text-gray-700">{user.preferences}</p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Settings</h4>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Account Settings
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start mt-2">
                  Notification Preferences
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start mt-2">
                  Privacy Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      <ProfileEditDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} user={user} />
    </Dialog>
  )
}

