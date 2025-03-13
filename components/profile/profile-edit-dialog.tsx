"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, MapPin, Navigation } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useUserStore, type User } from "@/lib/user-store"
import { getCurrentLocation, getLocationName, searchLocation } from "@/lib/location-service"

interface ProfileEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function ProfileEditDialog({ open, onOpenChange, user }: ProfileEditDialogProps) {
  const { updateProfile } = useUserStore()
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    location: user.location,
    preferences: user.preferences,
  })
  const [coordinates, setCoordinates] = useState<[number, number] | null>(user.coordinates || null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  // Update form data when user changes
  useEffect(() => {
    setFormData({
      name: user.name,
      bio: user.bio,
      location: user.location,
      preferences: user.preferences,
    })
    setCoordinates(user.coordinates || null)
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, location: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleGetCurrentLocation = async () => {
    setIsLocating(true)

    try {
      const coords = await getCurrentLocation()
      const locationName = await getLocationName(coords[0], coords[1])

      setCoordinates(coords)
      setFormData((prev) => ({ ...prev, location: locationName }))

      toast({
        title: "Location updated",
        description: `Location set to: ${locationName}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not get your location. Please check your browser permissions.",
        variant: "destructive",
      })
    } finally {
      setIsLocating(false)
    }
  }

  const handleSearchLocation = async () => {
    if (formData.location.trim().length < 3) {
      toast({
        title: "Error",
        description: "Please enter a valid location name",
        variant: "destructive",
      })
      return
    }

    setIsLocating(true)

    try {
      const coords = await searchLocation(formData.location)
      if (coords) {
        setCoordinates(coords)
        toast({
          title: "Location found",
          description: `Coordinates found for ${formData.location}`,
        })
      } else {
        toast({
          title: "Location not found",
          description: "Could not find coordinates for this location. Try being more specific.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for location",
        variant: "destructive",
      })
    } finally {
      setIsLocating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user profile
      updateProfile({
        ...formData,
        avatar: avatarPreview || user.avatar,
        coordinates: coordinates,
      })

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto z-[1001]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Camera className="h-4 w-4 text-white" />
                </label>
                <Input
                  type="file"
                  className="hidden"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleLocationChange}
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSearchLocation}
                disabled={isLocating || formData.location.trim().length < 3}
              >
                Find
              </Button>
              <Button type="button" variant="outline" onClick={handleGetCurrentLocation} disabled={isLocating}>
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
            {coordinates && (
              <p className="text-xs text-gray-500">
                Coordinates: {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="preferences" className="text-sm font-medium">
              Preferred Music Genres
            </label>
            <Input
              id="preferences"
              name="preferences"
              value={formData.preferences}
              onChange={handleChange}
              placeholder="e.g., Pop, Rock, Electronic"
            />
          </div>

          <DialogFooter className="pt-4 sticky bottom-0 bg-white pb-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

