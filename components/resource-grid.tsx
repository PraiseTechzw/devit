"use client"

import { useEffect, useState } from "react"
import { BookOpen, FileText, Globe, Grid2X2, List, MoreVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import type { Material } from "@/types"

export function ResourceGrid() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMaterials()
    }
  }, [user])

  async function fetchMaterials() {
    try {
      const response = await fetch(`/api/materials?userId=${user?.$id}`)
      if (!response.ok) throw new Error("Failed to fetch materials")
      const data = await response.json()
      setMaterials(data.documents)
    } catch (error) {
      console.error("Error fetching materials:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
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

      <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
        {materials.map((resource) => (
          <Card
            key={resource.$id}
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
                <MoreVertical className="w-4 h-4" />
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
              <span className="text-sm text-gray-500">{resource.date}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

