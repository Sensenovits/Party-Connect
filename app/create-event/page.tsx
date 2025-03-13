import { Header } from "@/components/navigation/header"
import { FooterNav } from "@/components/navigation/footer-nav"
import CreateEventWrapper from "./create-event-wrapper"

export default function CreateEventPage() {
  return (
    <div className="pb-16">
      <Header title="Create Event" showBackButton />

      <main className="container mx-auto px-4 py-6">
        <CreateEventWrapper />
      </main>

      <FooterNav />
    </div>
  )
}

