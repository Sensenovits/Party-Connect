// This file simulates OAuth authentication with Google and Facebook
// In a real application, you would use libraries like next-auth or firebase-auth

import { toast } from "@/components/ui/use-toast"

// Types for OAuth providers
export type OAuthProvider = "google" | "facebook"

interface OAuthUser {
  id: string
  name: string
  email: string
  avatar: string
  accessToken: string
  provider: OAuthProvider
}

// Simulated OAuth configuration
// In a real app, these would be environment variables
const OAUTH_CONFIG = {
  google: {
    client_id: "your-google-client-id.apps.googleusercontent.com",
    redirect_uri: "http://localhost:3000/api/auth/callback/google",
    scope: "profile email",
    auth_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  },
  facebook: {
    client_id: "your-facebook-app-id",
    redirect_uri: "http://localhost:3000/api/auth/callback/facebook",
    scope: "email,public_profile",
    auth_endpoint: "https://www.facebook.com/v12.0/dialog/oauth",
  },
}

// Mock user data for simulation
const MOCK_USERS = {
  google: {
    id: "google-123456789",
    name: "Alex Johnson",
    email: "alex.johnson@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    accessToken: "mock-google-access-token",
    provider: "google" as OAuthProvider,
  },
  facebook: {
    id: "facebook-987654321",
    name: "Emma Davis",
    email: "emma.davis@example.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    accessToken: "mock-facebook-access-token",
    provider: "facebook" as OAuthProvider,
  },
}

/**
 * Initiates the OAuth flow for the specified provider
 * In a real app, this would redirect to the provider's authorization page
 */
export function initiateOAuthLogin(provider: OAuthProvider): void {
  // In a real app, this would construct the OAuth URL and redirect the browser
  const config = OAUTH_CONFIG[provider]

  // Construct the authorization URL
  const authUrl = new URL(config.auth_endpoint)
  authUrl.searchParams.append("client_id", config.client_id)
  authUrl.searchParams.append("redirect_uri", config.redirect_uri)
  authUrl.searchParams.append("scope", config.scope)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("state", generateRandomState())

  console.log(`[OAuth Simulation] Redirecting to ${provider} authorization: ${authUrl.toString()}`)

  // For simulation, we'll just show a toast and then simulate a successful callback
  toast({
    title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login`,
    description: `Redirecting to ${provider} for authentication...`,
  })

  // Simulate the OAuth redirect and callback
  simulateOAuthCallback(provider)
}

/**
 * Simulates the OAuth callback process
 * In a real app, this would be handled by a server route that exchanges the code for tokens
 */
function simulateOAuthCallback(provider: OAuthProvider): Promise<OAuthUser> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate successful authentication
      const user = MOCK_USERS[provider]
      console.log(`[OAuth Simulation] ${provider} authentication successful:`, user)
      resolve(user)
    }, 1500)
  })
}

/**
 * Exchanges an authorization code for access tokens and user data
 * In a real app, this would be a server-side API call
 */
export async function handleOAuthCallback(provider: OAuthProvider, code: string): Promise<OAuthUser> {
  // In a real app, this would make a POST request to exchange the code for tokens
  console.log(`[OAuth Simulation] Exchanging code for ${provider} tokens`)

  // Simulate the token exchange and user info fetch
  return await simulateOAuthCallback(provider)
}

/**
 * Generates a random state parameter for CSRF protection
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Simulates the complete OAuth flow for a provider
 * This is a convenience method for our simulation
 */
export async function simulateCompleteOAuthFlow(provider: OAuthProvider): Promise<OAuthUser> {
  // In a real app, this would be split across multiple requests and redirects
  console.log(`[OAuth Simulation] Starting complete ${provider} OAuth flow`)

  // Simulate a delay for the authorization redirect
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate the callback with a random code
  const mockCode = Math.random().toString(36).substring(2, 15)
  return await handleOAuthCallback(provider, mockCode)
}

