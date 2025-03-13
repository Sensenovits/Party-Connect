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
import { Eye, EyeOff, Mail, Lock, Facebook, Loader2, User } from "lucide-react"
import { useUserStore } from "@/lib/user-store"
import { signupWithEmail } from "@/lib/auth-service"
import { type OAuthProvider, simulateCompleteOAuthFlow } from "@/lib/oauth-service"

export default function SignupPage() {
  const router = useRouter()
  const { updateProfile } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [authProvider, setAuthProvider] = useState<OAuthProvider | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (!agreedToTerms) {
      toast({
        title: "Error",
        description: "You must agree to the terms and conditions",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get user data from email signup
      const userData = await signupWithEmail(name, email, password)

      // Update user profile with the returned data
      updateProfile({
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        email: userData.email,
        bio: "I'm excited to join Party Connect and meet new people!",
        location: "Los Angeles, CA",
        coordinates: [34.0522, -118.2437], // Los Angeles coordinates
        preferences: "Pop, Rock, Electronic",
      })

      toast({
        title: "Account created!",
        description: `Welcome to Party Connect, ${userData.name}!`,
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignup = async (provider: OAuthProvider) => {
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
        bio: `New to Party Connect! Connected via ${provider}.`,
        location: "Los Angeles, CA",
        coordinates: [34.0522, -118.2437], // Los Angeles coordinates
        preferences: "Pop, Rock, Electronic",
      })

      toast({
        title: "Account created!",
        description: `Welcome to Party Connect, ${userData.name}!`,
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: `Failed to sign up with ${provider}. Please try again.`,
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
          <Link href="/" className="inline-block">
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
            <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">Sign up to start organizing and joining events</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="social">Social Signup</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

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
                    <Label htmlFor="password">Password</Label>
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
                    <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow"
                    disabled={isLoading || !agreedToTerms}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="social">
                <div className="space-y-4">
                  <Button
                    onClick={() => handleOAuthSignup("google")}
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
                    {isLoading && authProvider === "google" ? "Authenticating with Google..." : "Sign up with Google"}
                  </Button>

                  <Button
                    onClick={() => handleOAuthSignup("facebook")}
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
                      : "Sign up with Facebook"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

