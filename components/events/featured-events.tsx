"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { getUserAchievementIcons } from "@/lib/achievements"
import { formatDate } from "@/lib/utils"
import { useEventStore, type Event } from "@/lib/event-store"
import { motion } from "framer-motion"
import { MapPin, Users } from "lucide-react"

interface FeaturedEventsProps {
  events?: Event[]
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
  const { events: storeEvents } = useEventStore()
  const [displayEvents, setDisplayEvents] = useState<Event[]>([])

  useEffect(() => {
    // Use provided events or fall back to store events
    const eventsToProcess = events || storeEvents

    // Convert dates from string to Date objects (needed for persisted store)
    const processedEvents = eventsToProcess.map((event) => ({
      ...event,
      date: new Date(event.date),
    }))

    setDisplayEvents(processedEvents)
  }, [events, storeEvents])

  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  // Function to get category badge class
  const getCategoryBadgeClass = (category?: string) => {
    if (!category) return "bg-gray-100 text-gray-800"

    switch (category.toLowerCase()) {
      case "music":
        return "category-badge music"
      case "sports":
        return "category-badge sports"
      case "nature":
        return "category-badge nature"
      case "cultural":
        return "category-badge cultural"
      case "food":
        return "category-badge food"
      case "tech":
        return "category-badge tech"
      case "charity":
        return "category-badge charity"
      case "education":
        return "category-badge education"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {displayEvents.map((event) => (
        <motion.div key={event.id} variants={item}>
          <Link href={`/events/${event.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group card-hover-effect border-none shadow-md">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={event.image || "/placeholder.svg?height=200&width=400"}
                  alt={event.title}
                  className="h-full w-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex justify-between items-center">
                    <p className="text-white font-medium">{formatDate(event.date)}</p>
                    {event.category && (
                      <span className={getCategoryBadgeClass(event.category)}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h3>

                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{event.description}</p>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full overflow-hidden mr-2 border border-gray-200">
                      <img
                        src={event.creator.avatar || "/placeholder.svg?height=40&width=40"}
                        alt={event.creator.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{event.creator.name}</span>
                      <div className="ml-2 flex">
                        {getUserAchievementIcons(event.creator)
                          .slice(0, 2)
                          .map((achievement) => (
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
                  </div>

                  {event.participants && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{event.participants.length} joined</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}

