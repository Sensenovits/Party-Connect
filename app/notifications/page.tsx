import { Header } from "@/components/navigation/header"
import { FooterNav } from "@/components/navigation/footer-nav"
import { NotificationsList } from "@/components/notifications/notifications-list"

export default function NotificationsPage() {
  return (
    <div className="pb-16">
      <Header title="Notifications" showBackButton />

      <main className="container mx-auto px-4 py-6">
        <NotificationsList />
      </main>

      <FooterNav />
    </div>
  )
}

