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
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import {
  Upload,
  CalendarIcon,
  Clock,
  MapPin,
  Plus,
  X,
  Navigation,
  Info,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useEventStore } from "@/lib/event-store"
import { useUserStore } from "@/lib/user-store"
import { getCurrentLocation, getLocationName } from "@/lib/location-service"
import dynamic from "next/dynamic"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Music,
  Utensils,
  Leaf,
  BookOpen,
  Heart,
  Code,
  Dumbbell,
  Palette,
  PartyPopper,
  MoreHorizontal,
} from "lucide-react"

// Dynamically import the LocationSelector with no SSR to avoid Leaflet issues
const DynamicLocationSelector = dynamic(
  () => import("@/components/map/location-selector").then((mod) => mod.LocationSelector),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Loading map component...</p>
          <p className="text-xs text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    ),
  },
)

export default function CreateEventForm() {
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
  const [isBrowser, setIsBrowser] = useState(false)
  const [mapVisible, setMapVisible] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [formStep, setFormStep] = useState(1)
  const totalSteps = 4
  const [mapKey, setMapKey] = useState(Date.now()) // Add a key to force remount when needed
  const [category, setCategory] = useState<string>("")

  // Check if we're in the browser
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  // Use user's location as default if available
  useEffect(() => {
    if (currentUser.coordinates && !coordinates) {
      setCoordinates(currentUser.coordinates)
    }
  }, [currentUser.coordinates, coordinates])

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
      setMapVisible(true)

      // Force map to remount with new coordinates
      setMapKey(Date.now())

      // Clear any location error
      setFormErrors({ ...formErrors, location: "", coordinates: "" })

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

  const handleLocationSelect = async (coords: [number, number]) => {
    if (!coords || !Array.isArray(coords) || coords.length !== 2) {
      console.error("Invalid coordinates:", coords)
      return
    }

    // Make sure we're working with a proper array of numbers
    const validCoords: [number, number] = [
      typeof coords[0] === "number" ? coords[0] : Number.parseFloat(coords[0] as any),
      typeof coords[1] === "number" ? coords[1] : Number.parseFloat(coords[1] as any),
    ]

    // Validate the coordinates are within reasonable bounds
    if (
      isNaN(validCoords[0]) ||
      isNaN(validCoords[1]) ||
      validCoords[0] < -90 ||
      validCoords[0] > 90 ||
      validCoords[1] < -180 ||
      validCoords[1] > 180
    ) {
      console.error("Coordinates out of bounds:", validCoords)
      toast({
        title: "Error",
        description: "Invalid coordinates selected",
        variant: "destructive",
      })
      return
    }

    console.log("Setting coordinates:", validCoords)
    setCoordinates(validCoords)

    try {
      const name = await getLocationName(validCoords[0], validCoords[1])
      if (name && name !== "Unknown location") {
        setLocation(name)
      }

      // Clear any location error
      setFormErrors({ ...formErrors, location: "", coordinates: "" })

      toast({
        title: "Location selected",
        description: `Location set to: ${name || "Custom location"}`,
      })
    } catch (error) {
      console.error("Error getting location name:", error)
    }
  }

  const validateCurrentStep = (): boolean => {
    const errors: { [key: string]: string } = {}

    if (formStep === 1) {
      if (!title.trim()) {
        errors.title = "Event title is required"
      }
      if (!date) {
        errors.date = "Event date is required"
      }
      if (!time) {
        errors.time = "Event time is required"
      }
    } else if (formStep === 2) {
      if (!location.trim()) {
        errors.location = "Location name is required"
      }
      if (!coordinates) {
        errors.coordinates = "Please select a location on the map"
      }
    } else if (formStep === 3) {
      if (!description.trim()) {
        errors.description = "Event description is required"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setFormStep(Math.min(formStep + 1, totalSteps))
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    setFormStep(Math.max(formStep - 1, 1))
    window.scrollTo(0, 0)
  }

  // Add categories array at the top of the component
  const categories = [
    { id: "music", name: "Music", icon: Music },
    { id: "food", name: "Food", icon: Utensils },
    { id: "nature", name: "Nature", icon: Leaf },
    { id: "education", name: "Education", icon: BookOpen },
    { id: "charity", name: "Charity", icon: Heart },
    { id: "tech", name: "Tech", icon: Code },
    { id: "sports", name: "Sports", icon: Dumbbell },
    { id: "cultural", name: "Cultural", icon: Palette },
    { id: "party", name: "Party", icon: PartyPopper },
    { id: "other", name: "Other", icon: MoreHorizontal },
  ]

  // Update handleSubmit to include category
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!title || !description || !location || !date || !time || !coordinates || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including location and category",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time
      const [hours, minutes] = time.split(":").map(Number)
      const eventDateTime = new Date(date!)
      eventDateTime.setHours(hours, minutes)

      // Validate coordinates to ensure they are in the correct format
      if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new Error("Invalid coordinates format")
      }

      // Ensure coordinates are numbers
      const validCoordinates: [number, number] = [
        typeof coordinates[0] === "number" ? coordinates[0] : Number.parseFloat(coordinates[0] as any),
        typeof coordinates[1] === "number" ? coordinates[1] : Number.parseFloat(coordinates[1] as any),
      ]

      if (isNaN(validCoordinates[0]) || isNaN(validCoordinates[1])) {
        throw new Error("Coordinates contain invalid numbers")
      }

      // Log the coordinates to verify they're correct
      console.log("Creating event with coordinates:", validCoordinates)

      // Create new event object
      const newEvent = {
        id: `event-${Date.now()}`,
        title,
        date: eventDateTime,
        image: imagePreview || "/placeholder.svg?height=400&width=800",
        description,
        location,
        coordinates: validCoordinates,
        category, // Add category
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

      // Add event to store
      addEvent(newEvent)
      addCreatedEvent(newEvent.id)

      console.log("Event created successfully with coordinates:", validCoordinates)

      toast({
        title: "Success",
        description: "Event created successfully!",
      })

      // Navigate to the event page directly instead of the dashboard
      setTimeout(() => {
        router.push(`/events/${newEvent.id}`)
      }, 500)
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Default coordinates for the map
  const defaultCoordinates: [number, number] = coordinates || currentUser.coordinates || [40.7128, -74.006] // New York City

  // Render progress indicator
  const renderProgress = () => {
    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                formStep > i + 1
                  ? "bg-green-500 text-white"
                  : formStep === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {formStep > i + 1 ? <Check className="h-5 w-5" /> : <span>{i + 1}</span>}
            </div>
          ))}
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full">
          <div
            className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(formStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Basic Info</span>
          <span>Location</span>
          <span>Details</span>
          <span>Finish</span>
        </div>
      </div>
    )
  }

  // Add category selection in the form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderProgress()}

      {/* Step 1: Basic Information */}
      {formStep === 1 && (
        <>
          <Card className="border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-xl font-bold">Event Details</h2>
              <p className="text-sm text-white/80">Let's start with the basic information</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a catchy title for your event"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (e.target.value.trim()) {
                      setFormErrors({ ...formErrors, title: "" })
                    }
                  }}
                  className={cn("border-blue-200 focus-visible:ring-blue-500", formErrors.title && "border-red-500")}
                />
                {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
              </div>

              {/* Add this after the title input */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700">
                  Event Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-blue-200 focus-visible:ring-blue-500">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center">
                          <cat.icon className="h-4 w-4 mr-2" />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!category && <p className="text-sm text-muted-foreground">Please select an event category</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-blue-200 hover:bg-blue-50/50",
                          !date && "text-muted-foreground",
                          formErrors.date && "border-red-500",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => {
                          setDate(date)
                          if (date) {
                            setFormErrors({ ...formErrors, date: "" })
                          }
                        }}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.date && <p className="text-sm text-red-500">{formErrors.date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-gray-700">
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                    <Input
                      id="time"
                      type="time"
                      className={cn(
                        "pl-10 border-blue-200 focus-visible:ring-blue-500",
                        formErrors.time && "border-red-500",
                      )}
                      value={time}
                      onChange={(e) => {
                        setTime(e.target.value)
                        if (e.target.value) {
                          setFormErrors({ ...formErrors, time: "" })
                        }
                      }}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">24-hour format (e.g., 14:30 for 2:30 PM)</p>
                  {formErrors.time && <p className="text-sm text-red-500">{formErrors.time}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-end p-4">
              <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                Continue to Location
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Step 2: Location */}
      {formStep === 2 && (
        <>
          <Card className="border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-xl font-bold">Event Location</h2>
              <p className="text-sm text-white/80">Where will your event take place?</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700">
                    Location Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                    <Input
                      id="location"
                      placeholder="Location name (e.g., Central Park, New York)"
                      className={cn(
                        "pl-10 border-blue-200 focus-visible:ring-blue-500",
                        formErrors.location && "border-red-500",
                      )}
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value)
                        if (e.target.value.trim()) {
                          setFormErrors({ ...formErrors, location: "" })
                        }
                      }}
                    />
                  </div>
                  {formErrors.location && <p className="text-sm text-red-500">{formErrors.location}</p>}
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-blue-200 hover:bg-blue-50 text-blue-700"
                    onClick={() => setMapVisible(true)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Select on Map
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-blue-200 hover:bg-blue-50 text-blue-700"
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Locating...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Use my location
                      </>
                    )}
                  </Button>
                </div>

                {formErrors.coordinates && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Location Required</AlertTitle>
                    <AlertDescription>Please select a location on the map</AlertDescription>
                  </Alert>
                )}
              </div>

              {(mapVisible || coordinates) && isBrowser && (
                <div className="mt-2" style={{ minHeight: "350px" }}>
                  <DynamicLocationSelector
                    key={mapKey}
                    initialLocation={defaultCoordinates}
                    onLocationSelect={handleLocationSelect}
                    height="350px"
                  />
                </div>
              )}

              {coordinates && (
                <div className="p-4 bg-blue-50 border-t border-blue-100">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Selected Location</h4>
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Address:</span> {location || "Custom location"}
                      </p>
                      <p className="text-sm text-blue-600">
                        <span className="font-medium">Coordinates:</span> {coordinates[0].toFixed(6)},{" "}
                        {coordinates[1].toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-between p-4">
              <Button type="button" variant="outline" onClick={prevStep} className="border-gray-300">
                Back
              </Button>
              <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                Continue to Details
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Step 3: Details */}
      {formStep === 3 && (
        <>
          <Card className="border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-xl font-bold">Event Details</h2>
              <p className="text-sm text-white/80">Tell people more about your event</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">
                  Event Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event in detail. What can attendees expect? What should they bring?"
                  className={cn(
                    "resize-none border-blue-200 focus-visible:ring-blue-500 min-h-[150px]",
                    formErrors.description && "border-red-500",
                  )}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (e.target.value.trim()) {
                      setFormErrors({ ...formErrors, description: "" })
                    }
                  }}
                />
                {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-gray-700">
                  Event Image (Optional)
                </Label>
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Event preview"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute bottom-4 right-4"
                      onClick={() => {
                        setImagePreview(null)
                        setImageFile(null)
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 flex flex-col items-center justify-center bg-blue-50/50 hover:bg-blue-50 transition-colors">
                    <Upload className="h-10 w-10 text-blue-400 mb-3" />
                    <p className="text-blue-700 font-medium mb-1">Drag and drop your image here</p>
                    <p className="text-sm text-blue-500 mb-4">or click to browse files</p>
                    <Input
                      type="file"
                      className="hidden"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      Select Image
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-between p-4">
              <Button type="button" variant="outline" onClick={prevStep} className="border-gray-300">
                Back
              </Button>
              <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                Continue to Requirements
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Step 4: Requirements */}
      {formStep === 4 && (
        <>
          <Card className="border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Contribution Requirements</h2>
                  <p className="text-sm text-white/80">What do you need others to bring or contribute?</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addRequirement}
                  className="flex items-center bg-white/20 hover:bg-white/30 text-white border-none"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div
                    key={req.id}
                    className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`req-type-${req.id}`} className="text-xs text-gray-500 mb-1 block">
                          Type
                        </Label>
                        <Input
                          id={`req-type-${req.id}`}
                          placeholder="Food, Drinks, Equipment, etc."
                          value={req.type}
                          onChange={(e) => updateRequirement(req.id, "type", e.target.value)}
                          className="border-blue-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`req-desc-${req.id}`} className="text-xs text-gray-500 mb-1 block">
                          Description
                        </Label>
                        <Input
                          id={`req-desc-${req.id}`}
                          placeholder="Please provide details"
                          value={req.description}
                          onChange={(e) => updateRequirement(req.id, "description", e.target.value)}
                          className="border-blue-200"
                        />
                      </div>
                    </div>
                    {requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRequirement(req.id)}
                        className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {requirements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No requirements added yet. Click "Add Item" to add requirements.</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="text-blue-700">Almost done!</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    Review your event details before submitting. You can go back to previous steps to make changes.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-between p-4">
              <Button type="button" variant="outline" onClick={prevStep} className="border-gray-300">
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </form>
  )
}

