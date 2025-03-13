import { Header } from "@/components/navigation/header"
import { FooterNav } from "@/components/navigation/footer-nav"
import ProfileWrapper from "./profile-wrapper"

export default function ProfilePage() {
  return (
    <div className="pb-16">
      <Header title="Profile" showBackButton />

      <main className="container mx-auto px-4 py-6">
        <ProfileWrapper />
      </main>

      <FooterNav />
    </div>
  )
}

