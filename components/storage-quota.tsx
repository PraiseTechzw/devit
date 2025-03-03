"use client"

import { useEffect, useState } from "react"
import { Cloud, Loader2, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface StorageQuota {
  used: number
  total: number
  percentage: number
  files: number
}

export function StorageQuota() {
  const [quota, setQuota] = useState<StorageQuota | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchStorageQuota()
  }, [])

  async function fetchStorageQuota() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/storage")
      if (!response.ok) throw new Error("Failed to fetch storage quota")
      const data = await response.json()
      setQuota(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load storage information"
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive"
    if (percentage >= 75) return "bg-warning"
    return "bg-primary"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage</CardTitle>
          <Cloud className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!quota) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Storage ({quota.files} files)</CardTitle>
        <Cloud className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={quota.percentage} className={`h-2 ${getProgressColor(quota.percentage)}`} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatSize(quota.used)} used</span>
            <span>{formatSize(quota.total)} total</span>
          </div>
          {quota.percentage >= 90 && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Storage almost full! Consider removing unused files.</AlertDescription>
            </Alert>
          )}
          {quota.percentage >= 75 && quota.percentage < 90 && (
            <Alert  className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Storage usage is high. Consider cleaning up soon.</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

