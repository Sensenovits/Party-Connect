"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, CalendarIcon, Clock, MapPin, Plus, X, Navigation } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useEventStore } from "@/lib/event-store"
import { useUserStore } from "@/lib/user-store"
import { getCurrentLocation, getLocationName } from "@/lib/location-service"
import { EventMap } from "@/components/map/event-map"

export function CreateEventForm() {
  const router = useRouter()
  const { addEvent } = useEventStore()
  const { currentUser, addCreatedEvent } = useUserStore()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [requirements, setRequirements] = useState([{ id: "1", type: "", description: "" }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Use user's location as default if available
  useEffect(() => {
    if (currentUser.coordinates) {
      setCoordinates(currentUser.coordinates)
    }
  }, [currentUser.coordinates])

  const addRequirement = () => {
    setRequirements([...requirements, { id: `${requirements.length + 1}`, type: "", description: "" }])
  }

  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter((req) => req.id !== id))
  }

  const updateRequirement = (id: string, field: string, value: string) => {
    setRequirements(requirements.map((req) => (req.id === id ? { ...req, [field]: value } : req)))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)

    // Create a preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true)

    try {
      const coords = await getCurrentLocation()
      const locationName = await getLocationName(coords[0], coords[1])

      setCoordinates(coords)
      setLocation(locationName)

      toast({
        title: "Location updated",
        description: `Event location set to: ${locationName}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not get your location. Please check your browser permissions.",
        variant: "destructive",
      })
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!title || !description || !location || !date || !time || !coordinates) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including location",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Combine date and time
    const [hours, minutes] = time.split(":").map(Number)
    const eventDateTime = new Date(date)
    eventDateTime.setHours(hours, minutes)

    // Create new event object
    const newEvent = {
      id: `event-${Date.now()}`,
      title,
      date: eventDateTime,
      image: imagePreview || "/placeholder.svg?height=400&width=800",
      description,
      location,
      coordinates,
      creator: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        createdEvents: [],
        sponsoredEvents: [],
      },
      contributors: [],
      requirements: requirements
        .filter((req) => req.type && req.description)
        .map((req) => ({
          id: req.id,
          type: req.type,
          description: req.description,
          filled: false,
        })),
    }

    // Simulate API call
    setTimeout(() => {
      // Add event to store
      addEvent(newEvent)

      // Add to user's created events
      addCreatedEvent(newEvent.id)

      toast({
        title: "Success",
        description: "Event created successfully!",
      })

      setIsSubmitting(false)
      router.push("/")
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          placeholder="Enter event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="time"
              type="time"
              className="pl-10"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="location"
              placeholder="Enter location"
              className="pl-10"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <Button type="button" variant="outline" onClick={handleGetCurrentLocation} disabled={isGettingLocation}>
            <Navigation className="h-4 w-4 mr-2" />
            {isGettingLocation ? "Getting..." : "Use my location"}
          </Button>
        </div>
      </div>

      {coordinates && (
        <div className="space-y-2">
          <Label>Location Preview</Label>
          <EventMap events={[]} userLocation={coordinates} height="200px" />
          <p className="text-xs text-gray-500">Your event location is marked on the map</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your event..."
          className="resize-none"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Event Image</Label>
        <Card>
          <CardContent className="p-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Event preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(null)
                    setImageFile(null)
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                <Input type="file" className="hidden" id="image-upload" accept="image/*" onChange={handleImageChange} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  Select File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Contribution Requirements</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRequirement} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Add Requirement
          </Button>
        </div>

        {requirements.map((req, index) => (
          <div key={req.id} className="flex items-start space-x-2">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                placeholder="Type (e.g., Food, Drinks)"
                value={req.type}
                onChange={(e) => updateRequirement(req.id, "type", e.target.value)}
                required
              />
              <Input
                placeholder="Description"
                value={req.description}
                onChange={(e) => updateRequirement(req.id, "description", e.target.value)}
                required
              />
            </div>
            {requirements.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeRequirement(req.id)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => router.push("/")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  )
}

