"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating?: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(rating)

  // Ensure rating is a valid number
  const safeRating = typeof rating === "number" && !isNaN(rating) ? rating : 0
  const safeSelectedRating = typeof selectedRating === "number" && !isNaN(selectedRating) ? selectedRating : 0

  const handleClick = (index: number) => {
    if (!interactive) return

    const newRating = index + 1
    setSelectedRating(newRating)
    if (onRatingChange) {
      onRatingChange(newRating)
    }
  }

  const handleMouseEnter = (index: number) => {
    if (!interactive) return
    setHoverRating(index + 1)
  }

  const handleMouseLeave = () => {
    if (!interactive) return
    setHoverRating(0)
  }

  const currentRating = hoverRating || safeSelectedRating || safeRating

  // Size classes
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const starSize = sizeClasses[size]

  return (
    <div className={`flex ${className}`}>
      {[...Array(maxRating)].map((_, index) => (
        <span
          key={index}
          onClick={() => handleClick(index)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          className={`${interactive ? "cursor-pointer" : ""} ${index > 0 ? "-ml-0.5" : ""}`}
        >
          <Star
            className={`${starSize} ${
              index < currentRating ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-300"
            } transition-colors`}
          />
        </span>
      ))}
    </div>
  )
}

