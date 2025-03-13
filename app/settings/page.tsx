import { Header } from "@/components/navigation/header"
import { FooterNav } from "@/components/navigation/footer-nav"
import { AccountSettings } from "@/components/settings/account-settings"

export default function SettingsPage() {
  return (
    <div className="pb-16">
      <Header title="Account Settings" showBackButton />

      <main className="container mx-auto px-4 py-6">
        <AccountSettings />
      </main>

      <FooterNav />
    </div>
  )
}

