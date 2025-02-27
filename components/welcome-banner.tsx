"use client"

import { useUser } from "@clerk/nextjs"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function WelcomeBanner() {
  const { user } = useUser()
  const notificationCount = 3 // This would come from your notifications system

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "morning"
    if (hour < 17) return "afternoon"
    return "evening"
  }

  if (!user) return null

  return (
    <Card className="border-none bg-gradient-to-r from-[#2D3748] to-[#319795]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">
              Good {getTimeOfDay()}, {user.firstName}! 👋
            </CardTitle>
            <CardDescription className="text-gray-200">Ready to organize your study materials?</CardDescription>
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="bg-[#E53E3E] text-white text-xs rounded-full px-2 py-0.5">{notificationCount}</span>
            )}
            Notifications
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-gray-200">Total Materials</p>
            <p className="text-2xl font-bold text-white">24</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-gray-200">Due This Week</p>
            <p className="text-2xl font-bold text-white">5</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-gray-200">Shared With You</p>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-gray-200">Recent Activity</p>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

