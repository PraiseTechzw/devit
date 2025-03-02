"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/appwrite"
import { useToast } from "@/components/use-toast"
import type { Material } from "@prisma/client"

interface MaterialViewerProps {
  material: Material
}

export function MaterialViewer({ material }: MaterialViewerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedText, setSelectedText] = useState("")
  const [highlights, setHighlights] = useState<string[]>([])

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelectedText(selection.toString())
    }
  }

  const handleHighlight = () => {
    if (selectedText && !highlights.includes(selectedText)) {
      setHighlights([...highlights, selectedText])
      setSelectedText("")
    }
  }

  const handleDownload = async () => {
    try {
      if (!material.fileId) {
        throw new Error("No file associated with this material")
      }

      const fileUrl = await storage.getFileDownload(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, material.fileId)
      const response = await fetch(fileUrl)
      const blob = await response.blob()

      // Create a download link
      const url = URL.createObjectURL(blob)
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{material.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{material.type}</Badge>
            {material.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {material.type === "pdf" && (
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => router.push(`/materials/${material.id}/edit`)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 border rounded-lg p-4" onMouseUp={handleTextSelection}>
        {material.type === "note" ? (
          <div className="prose max-w-none">
            {material.content?.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        ) : material.type === "link" ? (
          material.url ? (
            <iframe src={material.url} className="w-full h-full" />
          ) : (
            <p className="text-muted-foreground">No URL provided.</p>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">PDF viewer coming soon!</p>
          </div>
        )}
      </ScrollArea>

      {selectedText && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-popover border rounded-lg shadow-lg p-4">
          <Button onClick={handleHighlight}>Highlight Selection</Button>
        </div>
      )}

      {highlights.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Highlights</h3>
          <div className="space-y-2">
            {highlights.map((highlight, index) => (
              <div key={index} className="bg-yellow-100 p-2 rounded">
                {highlight}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

