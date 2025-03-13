"use client"

import { useState } from "react"
import { Header } from "@/components/navigation/header"
import { FooterNav } from "@/components/navigation/footer-nav"
import { Button } from "@/components/ui/button"
import { EventDetails } from "@/components/events/event-details"
import { MessageCircle, Share2, Flag } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MessageDialog } from "@/components/messages/message-dialog"
import { useEventStore } from "@/lib/event-store"

export default function EventPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const { getEvent } = useEventStore()
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const event = getEvent(params.id)

  const handleReport = () => {
    toast({
      title: "Report Submitted",
      description: "Thank you for your report. We'll review this event shortly.",
    })
  }

  const handleMessage = () => {
    if (event?.creator?.id) {
      // Set the creator's ID as the conversation ID
      setConversationId(event.creator.id)
      setMessageDialogOpen(true)
    } else {
      toast({
        title: "Error",
        description: "Could not find the event creator to message.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    try {
      // Get the current URL
      const url = window.location.href

      // Check if the Web Share API is available
      if (navigator.share) {
        try {
          await navigator.share({
            title: event?.title || "Check out this event",
            text: event?.description || "I found this interesting event",
            url: url,
          })
          toast({
            title: "Shared successfully",
            description: "Event has been shared",
          })
        } catch (error) {
          // Fallback to clipboard if share was cancelled or failed
          copyToClipboard(url)
        }
      } else {
        // Fallback for browsers that don't support the Web Share API
        copyToClipboard(url)
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast({
        title: "Error",
        description: "Failed to share the event",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text).then(
        () => {
          toast({
            title: "Link copied",
            description: "Event link copied to clipboard",
          })
        },
        () => {
          toast({
            title: "Failed to copy",
            description: "Could not copy the link to clipboard",
            variant: "destructive",
          })
        },
      )
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Error",
        description: "Failed to copy the link",
        variant: "destructive",
      })
    }
  }

  if (!event) {
    return (
      <div className="pb-16">
        <Header title="Event Details" showBackButton />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold mb-2">Event not found</h2>
            <p className="text-gray-500">The event you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <FooterNav />
      </div>
    )
  }

  return (
    <div className="pb-16">
      <Header title="Event Details" showBackButton />

      <main className="container mx-auto px-4 py-6">
        <EventDetails eventId={params.id} />

        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex justify-around">
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleMessage}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Message to creator
          </Button>
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleReport}>
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </main>

      {messageDialogOpen && conversationId && (
        <MessageDialog
          conversationId={conversationId}
          eventId={params.id}
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
        />
      )}

      <FooterNav />
    </div>
  )
}

