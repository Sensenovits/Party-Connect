export type Achievement = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  criteria: (user: any) => boolean
}

export const achievements: Achievement[] = [
  {
    id: "first-time-sponsor",
    name: "First Time Sponsor",
    description: "Sponsored your first event",
    icon: "🎉",
    color: "bg-blue-100 text-blue-800",
    criteria: (user) => user.sponsoredEvents && user.sponsoredEvents.length > 0,
  },
  {
    id: "community-leader",
    name: "Community Leader",
    description: "Created 3 or more events",
    icon: "👑",
    color: "bg-purple-100 text-purple-800",
    criteria: (user) => user.createdEvents && user.createdEvents.length >= 3,
  },
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Joined 5 or more events",
    icon: "🦋",
    color: "bg-pink-100 text-pink-800",
    criteria: (user) => user.joinedEvents && user.joinedEvents.length >= 5,
  },
  {
    id: "top-contributor",
    name: "Top Contributor",
    description: "Received 10 or more positive ratings",
    icon: "⭐",
    color: "bg-yellow-100 text-yellow-800",
    criteria: (user) => user.positiveRatings && user.positiveRatings >= 10,
  },
  {
    id: "event-master",
    name: "Event Master",
    description: "Successfully organized 10 events",
    icon: "🏆",
    color: "bg-green-100 text-green-800",
    criteria: (user) => user.successfulEvents && user.successfulEvents >= 10,
  },
  // Additional achievements can be added here
]

export function hasEarnedAchievement(user: any, achievementId: string): boolean {
  const achievement = achievements.find((a) => a.id === achievementId)
  if (!achievement) return false
  return achievement.criteria(user)
}

export function getUserAchievements(user: any): Achievement[] {
  return achievements.filter((achievement) => hasEarnedAchievement(user, achievement.id))
}

export function getUserAchievementIcons(user: any): Array<{
  id: string
  icon: string
  color: string
  name: string
  description: string
}> {
  if (!user) return []

  try {
    const earnedAchievements = getUserAchievements(user)
    return earnedAchievements.map((achievement) => ({
      id: achievement.id,
      icon: achievement.icon,
      color: achievement.color,
      name: achievement.name,
      description: achievement.description,
    }))
  } catch (error) {
    console.error("Error getting user achievements:", error)
    return []
  }
}

