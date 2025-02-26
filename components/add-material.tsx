"use client"

import { useState } from "react"
import { File, Link2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { storage } from "@/lib/appwrite"
import { ID } from "appwrite"
import type { Material } from "@/types"
import { useRef } from "react"

export function AddMaterial() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [materialType, setMaterialType] = useState<Material["type"]>()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    url: "",
    tags: [] as string[],
    priority: "medium" as Material["priority"],
  })
  const fileInput = useRef<HTMLInputElement>(null)
  const [suggestedTags, setSuggestedTags] = useState(["Biology", "Chemistry", "Physics", "Lab Work", "Research"])

  async function handleSubmit() {
    if (!user) return
    setLoading(true)

    try {
      let fileId
      if (materialType === "pdf" && fileInput.current?.files?.[0]) {
        const file = fileInput.current.files[0]
        const uploadedFile = await storage.createFile(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, ID.unique(), file)
        fileId = uploadedFile.$id
      }

      const response = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.$id,
          title: formData.title,
          type: materialType,
          content: formData.content,
          url: formData.url,
          fileId,
          tags: formData.tags,
          priority: formData.priority,
        }),
      })

      if (!response.ok) throw new Error("Failed to create material")

      // Reset form and close dialog
      setStep(1)
      setMaterialType(undefined)
      setFormData({
        title: "",
        content: "",
        url: "",
        tags: [],
        priority: "medium",
      })
    } catch (error) {
      console.error("Error creating material:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 shadow-lg bg-[#319795] hover:bg-[#2C7A7B]" size="lg">
          <Upload className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>Upload your study materials and organize them efficiently.</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer transition-colors hover:border-[#319795] ${
                  materialType === "note" ? "border-[#319795]" : ""
                }`}
                onClick={() => setMaterialType("note")}
              >
                <CardHeader className="text-center">
                  <File className="w-8 h-8 mx-auto text-[#319795]" />
                  <CardTitle className="text-sm">Text Note</CardTitle>
                </CardHeader>
              </Card>
              <Card
                className={`cursor-pointer transition-colors hover:border-[#319795] ${
                  materialType === "pdf" ? "border-[#319795]" : ""
                }`}
                onClick={() => setMaterialType("pdf")}
              >
                <CardHeader className="text-center">
                  <File className="w-8 h-8 mx-auto text-[#319795]" />
                  <CardTitle className="text-sm">PDF Document</CardTitle>
                </CardHeader>
              </Card>
              <Card
                className={`cursor-pointer transition-colors hover:border-[#319795] ${
                  materialType === "link" ? "border-[#319795]" : ""
                }`}
                onClick={() => setMaterialType("link")}
              >
                <CardHeader className="text-center">
                  <Link2 className="w-8 h-8 mx-auto text-[#319795]" />
                  <CardTitle className="text-sm">Web Link</CardTitle>
                </CardHeader>
              </Card>
            </div>
            <Button className="bg-[#319795] hover:bg-[#2C7A7B]" disabled={!materialType} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter material title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {materialType === "note" && (
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your notes here..."
                    className="h-32"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
              )}

              {materialType === "pdf" && (
                <div className="grid gap-2">
                  <Label htmlFor="file">Upload PDF</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Drag and drop your PDF here, or click to browse</p>
                    <Input id="file" type="file" className="hidden" accept=".pdf" ref={fileInput} />
                  </div>
                </div>
              )}

              {materialType === "link" && (
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label>Subject</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as Material["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Suggested Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-[#319795] hover:text-white"
                      onClick={() => {
                        if (formData.tags.includes(tag)) {
                          setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
                        } else {
                          setFormData({ ...formData, tags: [...formData.tags, tag] })
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="bg-[#319795] hover:bg-[#2C7A7B]" onClick={handleSubmit} disabled={loading}>
                Save Material
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

