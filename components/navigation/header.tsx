"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, MessageCircle, User, Menu, X, LogIn, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileViewDialog } from "@/components/profile/profile-view-dialog"
import { useUserStore } from "@/lib/user-store"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  showNotification?: boolean
  showProfile?: boolean
}

export function Header({ title, showBackButton = false, showNotification = true, showProfile = true }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentUser } = useUserStore()
  const pathname = usePathname()
  const isLoggedIn = !!currentUser?.id

  // Get unread message count from localStorage
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Calculate actual unread messages from localStorage
    try {
      let count = 0
      // Check all event message keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes("_messages")) {
          const messages = JSON.parse(localStorage.getItem(key) || "[]")
          // Count unread messages (those not from current user and not marked as read)
          count += messages.filter((msg: any) => msg.senderId !== "currentUser" && !msg.isRead).length
        }
      }
      setUnreadCount(count)
    } catch (error) {
      console.error("Error calculating unread messages:", error)
      setUnreadCount(0)
    }
  }, [pathname])

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "/dashboard" },
    { name: "Explore", href: "/explore" },
    { name: "Create Event", href: "/create-event" },
    { name: "Messages", href: "/messages" },
  ]

  return (
    <>
      <motion.header
        className={`sticky top-0 z-30 ${
          scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-white"
        } border-b border-gray-200 transition-all duration-200`}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center">
            {showBackButton && (
              <Link href="/" className="mr-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {title ? (
              <h1 className="text-xl font-bold gradient-text gradient-blue">{title}</h1>
            ) : (
              <Link href="/dashboard" className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-2 shadow-md">
                  <span className="text-white font-bold">PC</span>
                </div>
                <span className="text-xl font-bold gradient-text gradient-blue hidden sm:inline-block">
                  Party Connect
                </span>
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === item.href ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {showNotification && (
              <Link href="/messages" className="relative">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MessageCircle className="h-5 w-5 text-gray-600 hover:text-blue-600 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {isLoggedIn && showProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full overflow-hidden hover:bg-transparent p-0">
                    <Avatar className="h-9 w-9 border-2 border-transparent hover:border-blue-500 transition-all duration-200">
                      <AvatarImage src={currentUser?.avatar || "/placeholder.svg?height=32&width=32"} alt="User" />
                      <AvatarFallback>{currentUser?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/create-event">Create Event</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login">Sign out</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <LogIn className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex items-center">
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-20 bg-white md:hidden pt-16"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col p-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`py-3 px-4 rounded-lg text-lg font-medium ${
                    pathname === item.href ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isLoggedIn ? (
                <div className="border-t border-gray-200 my-2 pt-2">
                  <Link
                    href="/profile"
                    className="py-3 px-4 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="py-3 px-4 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Settings
                  </Link>
                  <Link
                    href="/auth/login"
                    className="py-3 px-4 rounded-lg text-lg font-medium text-red-600 hover:bg-red-50 flex items-center mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Sign out
                  </Link>
                </div>
              ) : (
                <div className="border-t border-gray-200 my-2 pt-2">
                  <Link
                    href="/auth/login"
                    className="py-3 px-4 rounded-lg text-lg font-medium text-blue-600 hover:bg-blue-50 flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="py-3 px-4 rounded-lg text-lg font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showProfile && <ProfileViewDialog open={profileOpen} onOpenChange={setProfileOpen} />}
    </>
  )
}

