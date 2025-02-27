"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Stats {
  totalMaterials: number
  dueThisWeek: number
  sharedWithMe: number
  recentActivity: number
}

export function WelcomeBanner() {
  const { user } = useUser()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const notificationCount = 3 // This would come from your notifications system

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  async function fetchStats() {
    try {
      const response = await fetch("/api/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

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
          <StatCard title="Total Materials" value={stats?.totalMaterials} loading={loading} />
          <StatCard title="Due This Week" value={stats?.dueThisWeek} loading={loading} />
          <StatCard title="Shared With You" value={stats?.sharedWithMe} loading={loading} />
          <StatCard title="Recent Activity" value={stats?.recentActivity} loading={loading} />
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({ title, value, loading }: { title: string; value?: number; loading: boolean }) {
  return (
    <div className="bg-white/10 rounded-lg p-4">
      <p className="text-gray-200">{title}</p>
      {loading ? (
        <Skeleton className="h-8 w-16 bg-white/20" />
      ) : (
        <p className="text-2xl font-bold text-white">{value ?? 0}</p>
      )}
    </div>
  )
}

