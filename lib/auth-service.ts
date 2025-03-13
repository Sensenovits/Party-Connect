// Simulated social login service
interface SocialUserData {
  id: string
  name: string
  email: string
  avatar: string
  provider: string
}

// Mock data for social providers
const mockSocialUsers = {
  google: {
    id: "google-user-123",
    name: "Alex Johnson",
    email: "alex.johnson@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    provider: "Google",
  },
  facebook: {
    id: "facebook-user-456",
    name: "Emma Davis",
    email: "emma.davis@facebook.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    provider: "Facebook",
  },
  github: {
    id: "github-user-789",
    name: "Sam Wilson",
    email: "sam.wilson@github.com",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    provider: "GitHub",
  },
}

export async function loginWithSocialProvider(provider: "google" | "facebook" | "github"): Promise<SocialUserData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Return mock data for the selected provider
  return mockSocialUsers[provider]
}

// For email login/signup
export async function loginWithEmail(email: string, password: string): Promise<SocialUserData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate a consistent avatar based on email
  const emailHash = email.toLowerCase().trim()
  const avatarIndex = Math.abs(emailHash.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100)

  // Return user data based on email
  return {
    id: `email-user-${emailHash}`,
    name: email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    email: email,
    avatar: `https://randomuser.me/api/portraits/${avatarIndex % 2 === 0 ? "men" : "women"}/${avatarIndex}.jpg`,
    provider: "Email",
  }
}

export async function signupWithEmail(name: string, email: string, password: string): Promise<SocialUserData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate a consistent avatar based on email
  const emailHash = email.toLowerCase().trim()
  const avatarIndex = Math.abs(emailHash.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100)

  // Return user data
  return {
    id: `email-user-${emailHash}`,
    name: name,
    email: email,
    avatar: `https://randomuser.me/api/portraits/${avatarIndex % 2 === 0 ? "men" : "women"}/${avatarIndex}.jpg`,
    provider: "Email",
  }
}

