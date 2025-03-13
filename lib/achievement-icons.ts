export function getUserAchievementIcons(user: any): Array<{
  id: string
  icon: string
  color: string
  name: string
  description: string
}> {
  const earnedAchievements = getUserAchievements(user)
  return earnedAchievements.map((achievement) => ({
    id: achievement.id,
    icon: achievement.icon,
    color: achievement.color,
    name: achievement.name,
    description: achievement.description,
  }))
}

