/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { BookOpen, FileText, Globe, Grid2X2, List, MoreVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Material } from "@/types"

export function ResourceGrid() {
  const pathname = usePathname()
  const { user } = useUser()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  // Determine material type based on current route
  const getTypeFromPath = () => {
    switch (pathname) {
      case "/notes":
        return "note"
      case "/documents":
        return "pdf"
      case "/links":
        return "link"
      default:
        return undefined // All types for dashboard
    }
  }

  useEffect(() => {
    if (user) {
      fetchMaterials()
    }
  }, [user, pathname])

  async function fetchMaterials() {
    try {
      const type = getTypeFromPath()
      const url = type ? `/api/materials?type=${type}` : "/api/materials"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch materials")
      const data = await response.json()
      setMaterials(data)
    } catch (error) {
      console.error("Error fetching materials:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "note":
        return <FileText className="w-4 h-4" />
      case "pdf":
        return <BookOpen className="w-4 h-4" />
      case "link":
        return <Globe className="w-4 h-4" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-[#E53E3E] text-white"
      case "medium":
        return "bg-[#319795] text-white"
      case "low":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-200"
    }
  }

  if (loading) {
    return (
      <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="group">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-6 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode("grid")}
          className={viewMode === "grid" ? "bg-gray-100" : ""}
        >
          <Grid2X2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode("list")}
          className={viewMode === "list" ? "bg-gray-100" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No materials found. Click the "Add Material" button to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
          {materials.map((resource) => (
            <Card
              key={resource.id}
              className={`group ${viewMode === "list" ? "flex flex-col sm:flex-row sm:items-center" : ""}`}
            >
              <CardHeader
                className={`flex flex-row items-start justify-between space-y-0 ${viewMode === "list" ? "flex-1" : ""}`}
              >
                <div className="flex items-center space-x-2">
                  {getIcon(resource.type)}
                  <span className="font-medium">{resource.title}</span>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className={viewMode === "list" ? "hidden sm:block" : ""}>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className={`flex justify-between ${viewMode === "list" ? "sm:w-48" : ""}`}>
                <Badge className={getPriorityColor(resource.priority)}>{resource.priority}</Badge>
                <span className="text-sm text-gray-500">{new Date(resource.createdAt).toLocaleDateString()}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

