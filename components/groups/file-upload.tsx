"use client"

import { useState, useRef } from "react"
import { Upload, File, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/use-toast"
import { storage } from "@/lib/appwrite"
import { ID } from "appwrite"

const ACCEPTED_FILE_TYPES = {
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  image: ["image/jpeg", "image/png", "image/gif"],
  maxSize: 10 * 1024 * 1024, // 10MB
}

interface FileUploadProps {
  groupId: string
  onUploadComplete?: (fileId: string, fileName: string) => void
}

export function FileUpload({ groupId, onUploadComplete }: FileUploadProps) {
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!ACCEPTED_FILE_TYPES.document.includes(file.type) && !ACCEPTED_FILE_TYPES.image.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF, Word, PowerPoint document, or image.",
      })
      return
    }

    if (file.size > ACCEPTED_FILE_TYPES.maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 10MB.",
      })
      return
    }

    setSelectedFile(file)
  }

  const uploadFile = async () => {
    if (!selectedFile || uploading) return
    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload to Appwrite Storage
      const response = await storage.createFile(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, ID.unique(), selectedFile)

      // Create shared file record in database
      const dbResponse = await fetch(`/api/groups/${groupId}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: response.$id,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      })

      if (!dbResponse.ok) throw new Error("Failed to save file record")

      toast({
        title: "Success!",
        description: "File uploaded successfully.",
      })

      onUploadComplete?.(response.$id, selectedFile.name)
      setSelectedFile(null)
      setUploadProgress(100)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload file. Please try again.",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={uploading}>
          <Upload className="w-4 h-4 mr-2" />
          Select File
        </Button>
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
          accept={[...ACCEPTED_FILE_TYPES.document, ...ACCEPTED_FILE_TYPES.image].join(",")}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-2 border rounded-lg">
          <div className="flex items-center gap-2">
            <File className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {uploading ? (
              <Button variant="ghost" size="sm" disabled>
                <Loader2 className="w-4 h-4 animate-spin" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={uploadFile}>
                  Upload
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {uploading && <Progress value={uploadProgress} className="h-2" />}
    </div>
  )
}

