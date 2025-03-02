"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Grid2X2,
  List,
  MoreVertical,
  Eye,
  Download,
  Star,
  Pencil,
  Trash2,
  FileText,
  Code,
  LinkIcon,
  File,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { MaterialViewer } from "@/components/material-viewer"
import { storage } from "@/lib/appwrite"
import type { Material } from "@prisma/client"

interface ResourceGridProps {
  initialMaterials: Material[]
}

export function ResourceGrid({ initialMaterials }: ResourceGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [materials] = useState(initialMaterials || [])
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const handleView = (material: Material) => {
    setSelectedMaterial(material)
    setViewerOpen(true)
  }

  const handleDownload = async (material: Material) => {
    try {
      if (!material.fileId) {
        throw new Error("No file associated with this material")
      }

      const result = await storage.getFileDownload(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, material.fileId)

      // Create a download link
      const url = URL.createObjectURL(result)
      const a = document.createElement("a")
      a.href = url
      a.download = material.title
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "File downloaded successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download file.",
      })
    }
  }

  const handleDelete = async (material: Material) => {
    try {
      // If it's a file, delete from storage first
      if (material.fileId) {
        await storage.deleteFile(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, material.fileId)
      }

      const response = await fetch(`/api/materials/${material.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete material")

      toast({
        title: "Success",
        description: "Material deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete material.",
      })
    }
  }

  const getTypeIcon = (type: string, fileType?: string) => {
    switch (type) {
      case "note":
        return <FileText className="h-5 w-5" />
      case "pdf":
        return <File className="h-5 w-5" />
      case "link":
        return <LinkIcon className="h-5 w-5" />
      default:
        if (fileType?.includes("word")) {
          return <FileText className="h-5 w-5" />
        }
        if (fileType?.match(/\.(js|ts|py|java|cpp|cs|html|css|json)$/)) {
          return <Code className="h-5 w-5" />
        }
        return <File className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-primary text-primary-foreground"
      case "low":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode("grid")}
          className={viewMode === "grid" ? "bg-muted" : ""}
        >
          <Grid2X2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode("list")}
          className={viewMode === "list" ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {!materials?.length ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No materials found. Click the "Add Material" button to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}
        >
          {materials.map((material) => (
            <motion.div key={material.id} variants={item}>
              <Card className="group hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex-1 cursor-pointer space-y-2" onClick={() => handleView(material)}>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(material.type)}
                      <h3 className="font-medium leading-none line-clamp-1">{material.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {material.type === "note"
                        ? material.content
                        : material.type === "link"
                          ? material.url
                          : `${material.type.toUpperCase()} Document`}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(material)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      {material.fileId && (
                        <DropdownMenuItem onClick={() => handleDownload(material)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Add to Favorites
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push(`/materials/${material.id}/edit`)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(material)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {material.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString())
                          params.set("tag", tag)
                          router.push(`/dashboard?${params.toString()}`)
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge className={getPriorityColor(material.priority)}>{material.priority}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </span>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          {selectedMaterial && <MaterialViewer material={selectedMaterial} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

