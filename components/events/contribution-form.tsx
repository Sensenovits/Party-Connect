"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useEventStore } from "@/lib/event-store"
import { useUserStore } from "@/lib/user-store"

interface ContributionFormProps {
  eventId: string
  onClose: () => void
}

export function ContributionForm({ eventId, onClose }: ContributionFormProps) {
  const { contributeToEvent } = useEventStore()
  const { currentUser } = useUserStore()
  const [contributionType, setContributionType] = useState("")
  const [details, setDetails] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      setImageFile(file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error handling image change:", error)
      toast({
        title: "Error",
        description: "Failed to process the selected image",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contributionType) {
      toast({
        title: "Error",
        description: "Please select a contribution type",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Validate current user
      if (!currentUser || !currentUser.id) {
        throw new Error("User information is missing")
      }

      // Create contribution object
      const contribution = {
        id: `contribution-${Date.now()}`,
        userId: currentUser.id,
        name: currentUser.name || "Anonymous",
        avatar: currentUser.avatar || "/placeholder.svg?height=40&width=40",
        role: contributionType,
        details: details,
        image: imagePreview,
        rating: 0,
        timestamp: new Date(),
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add contribution to event
      contributeToEvent(eventId, contribution)

      toast({
        title: "Success",
        description: "Your contribution has been submitted",
      })

      onClose()
    } catch (error) {
      console.error("Error submitting contribution:", error)
      toast({
        title: "Error",
        description: "Failed to submit contribution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Offer Contribution</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 overflow-y-auto flex-1 pr-2">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Contribution Type
            </label>
            <Select value={contributionType} onValueChange={setContributionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="drinks">Drinks</SelectItem>
                <SelectItem value="venue">Venue</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="details" className="text-sm font-medium">
              Contribution Details
            </label>
            <Textarea
              id="details"
              placeholder="Describe your contribution..."
              className="resize-none"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Photo (Optional)</label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Contribution preview"
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
                <Input type="file" className="hidden" id="photo-upload" accept="image/*" onChange={handleImageChange} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                >
                  Select File
                </Button>
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="pt-4 border-t mt-auto">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? "Submitting..." : "Submit Contribution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

