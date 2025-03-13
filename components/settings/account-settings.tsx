"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { useUserStore } from "@/lib/user-store"
import { Bell, Lock, Eye, EyeOff, Globe, Mail, Phone, Shield, User, LogOut } from "lucide-react"

export function AccountSettings() {
  const { currentUser, updateProfile } = useUserStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form states
  const [email, setEmail] = useState("user@example.com")
  const [phone, setPhone] = useState("+1 (555) 123-4567")
  const [password, setPassword] = useState("••••••••")
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    messageNotifications: true,
    newEventAlerts: false,
  })
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showLocation: true,
    showJoinedEvents: true,
  })

  const handleSaveProfile = async () => {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Account settings updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account settings",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleNotification = (key: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handleTogglePrivacy = (key: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  return (
    <Tabs defaultValue="account" className="space-y-6">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="account">
          <User className="h-4 w-4 mr-2" />
          Account
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="privacy">
          <Shield className="h-4 w-4 mr-2" />
          Privacy
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={currentUser.name} onChange={(e) => updateProfile({ name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-gray-500" />
                <Input
                  id="location"
                  value={currentUser.location}
                  onChange={(e) => updateProfile({ location: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={() => handleToggleNotification("emailNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications on your device</p>
              </div>
              <Switch
                checked={notificationSettings.pushNotifications}
                onCheckedChange={() => handleToggleNotification("pushNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Event Reminders</h4>
                <p className="text-sm text-gray-500">Get reminders before your events</p>
              </div>
              <Switch
                checked={notificationSettings.eventReminders}
                onCheckedChange={() => handleToggleNotification("eventReminders")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Message Notifications</h4>
                <p className="text-sm text-gray-500">Get notified when you receive messages</p>
              </div>
              <Switch
                checked={notificationSettings.messageNotifications}
                onCheckedChange={() => handleToggleNotification("messageNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">New Event Alerts</h4>
                <p className="text-sm text-gray-500">Get notified about new events in your area</p>
              </div>
              <Switch
                checked={notificationSettings.newEventAlerts}
                onCheckedChange={() => handleToggleNotification("newEventAlerts")}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save Notification Preferences"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="privacy">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control your privacy and data sharing preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={privacySettings.profileVisibility === "public" ? "default" : "outline"}
                  onClick={() => setPrivacySettings((prev) => ({ ...prev, profileVisibility: "public" }))}
                  className="w-full"
                >
                  Public
                </Button>
                <Button
                  variant={privacySettings.profileVisibility === "private" ? "default" : "outline"}
                  onClick={() => setPrivacySettings((prev) => ({ ...prev, profileVisibility: "private" }))}
                  className="w-full"
                >
                  Private
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {privacySettings.profileVisibility === "public"
                  ? "Anyone can view your profile"
                  : "Only people you approve can view your profile"}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Show My Location</h4>
                <p className="text-sm text-gray-500">Allow others to see your location</p>
              </div>
              <Switch
                checked={privacySettings.showLocation}
                onCheckedChange={() => handleTogglePrivacy("showLocation")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Show Joined Events</h4>
                <p className="text-sm text-gray-500">Display events you've joined on your profile</p>
              </div>
              <Switch
                checked={privacySettings.showJoinedEvents}
                onCheckedChange={() => handleTogglePrivacy("showJoinedEvents")}
              />
            </div>

            <div className="pt-4">
              <h4 className="font-medium mb-2">Data Management</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save Privacy Settings"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

