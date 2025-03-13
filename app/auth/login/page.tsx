"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Mail, Lock, Facebook, Loader2 } from "lucide-react"
import { useUserStore } from "@/lib/user-store"
import { loginWithEmail } from "@/lib/auth-service"
import { type OAuthProvider, simulateCompleteOAuthFlow } from "@/lib/oauth-service"

export default function LoginPage() {
  const router = useRouter()
  const { updateProfile } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authProvider, setAuthProvider] = useState<OAuthProvider | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get user data from email login
      const userData = await loginWithEmail(email, password)

      // Update user profile with the returned data
      updateProfile({
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        email: userData.email,
        bio: "I love connecting with people and attending events!",
        location: "Los Angeles, CA",
        coordinates: [34.0522, -118.2437], // Los Angeles coordinates
        preferences: "Pop, Rock, Electronic",
      })

      toast({
        title: "Welcome back!",
        description: `You've successfully signed in as ${userData.name}`,
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setIsLoading(true)
    setAuthProvider(provider)

    try {
      // In a real app, this would redirect to the provider's auth page
      // and then handle the callback in a separate route
      const userData = await simulateCompleteOAuthFlow(provider)

      // Update user profile with the returned data
      updateProfile({
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        email: userData.email,
        bio: `Event enthusiast using ${provider} to connect with others!`,
        location: "Los Angeles, CA",
        coordinates: [34.0522, -118.2437], // Los Angeles coordinates
        preferences: "Pop, Rock, Electronic",
      })

      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Successful`,
        description: `Welcome, ${userData.name}!`,
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: `Failed to login with ${provider}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setAuthProvider(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-block">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-xl font-bold">PC</span>
              </div>
            </div>
            <h1 className="mt-4 text-3xl font-bold gradient-text gradient-blue">Party Connect</h1>
          </Link>
          <p className="mt-2 text-gray-600">Connect with others and organize great events</p>
        </div>

        <Card className="border-none shadow-xl glass-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="social" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="social">Social Login</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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

                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="social">
                <div className="space-y-4">
                  <Button
                    onClick={() => handleOAuthLogin("google")}
                    className="w-full bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading && authProvider === "google" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                        />
                      </svg>
                    )}
                    {isLoading && authProvider === "google" ? "Authenticating with Google..." : "Continue with Google"}
                  </Button>

                  <Button
                    onClick={() => handleOAuthLogin("facebook")}
                    className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading && authProvider === "facebook" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Facebook className="w-5 h-5 mr-2" />
                    )}
                    {isLoading && authProvider === "facebook"
                      ? "Authenticating with Facebook..."
                      : "Continue with Facebook"}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setIsLoading(true)
                      setTimeout(() => {
                        updateProfile({
                          id: "guest-user",
                          name: "Guest User",
                          avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
                          email: "guest@example.com",
                          bio: "Just browsing around!",
                          location: "Los Angeles, CA",
                          coordinates: [34.0522, -118.2437],
                          preferences: "Pop, Rock, Electronic",
                        })
                        toast({
                          title: "Guest Access Granted",
                          description: "You're now browsing as a guest user",
                        })
                        router.push("/dashboard")
                        setIsLoading(false)
                      }, 1500)
                    }}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && !authProvider && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue as Guest
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

