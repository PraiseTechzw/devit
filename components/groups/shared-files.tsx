"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Download, FileText, ImageIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { storage } from "@/lib/appwrite"
import { FileUpload } from "./file-upload"

interface SharedFile {
  id: string
  fileId: string
  fileName: string
  fileType: string
  fileSize: number
  userId: string
  createdAt: string
  user: {
    name: string
  }
}

interface SharedFilesProps {
  groupId: string
  isOwner: boolean
}

export function SharedFiles({ groupId, isOwner }: SharedFilesProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [files, setFiles] = useState<SharedFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [])

  async function fetchFiles() {
    try {
      const response = await fetch(`/api/groups/${groupId}/files`)
      if (!response.ok) throw new Error("Failed to fetch files")
      const data = await response.json()
      setFiles(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load shared files.",
      })
    } finally {
      setLoading(false)
    }
  }

  async function downloadFile(fileId: string, fileName: string) {
    try {
      const result = await storage.getFileDownload(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, fileId)

      // Create a download link
      const blob = new Blob([result])
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download file.",
      })
    }
  }

  async function deleteFile(fileId: string, storageFileId: string) {
    try {
      // Delete from Appwrite storage
      await storage.deleteFile(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, storageFileId)

      // Delete from database
      const response = await fetch(`/api/groups/${groupId}/files/${fileId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete file")

      toast({
        title: "Success",
        description: "File deleted successfully.",
      })

      fetchFiles()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete file.",
      })
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4" />
    }
    return <FileText className="w-4 h-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FileUpload
            groupId={groupId}
            onUploadComplete={() => {
              fetchFiles()
              router.refresh()
            }}
          />

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.fileType)}
                    <div>
                      <p className="text-sm font-medium">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        Shared by {file.user.name} • {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => downloadFile(file.fileId, file.fileName)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    {isOwner && (
                      <Button variant="ghost" size="icon" onClick={() => deleteFile(file.id, file.fileId)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {files.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-4">No files shared yet</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

