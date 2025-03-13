"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamically import client components with no SSR
const UserProfile = dynamic(() => import("@/components/profile/user-profile-client"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-12">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm text-gray-600">Loading profile...</p>
      </div>
    </div>
  ),
})

export default function ProfileWrapper() {
  return <UserProfile />
}

