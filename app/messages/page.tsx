import { Header } from "@/components/navigation/header"
import { FooterNav } from "@/components/navigation/footer-nav"
import { MessagesTab } from "@/components/messages/messages-tab"

export default function MessagesPage() {
  return (
    <div className="pb-16">
      <Header title="Messages" showBackButton />

      <main className="container mx-auto px-4 py-6">
        <MessagesTab />
      </main>

      <FooterNav />
    </div>
  )
}

