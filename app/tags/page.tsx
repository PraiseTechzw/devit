"use client"

import { useState } from "react"
import { Hash, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TagsPage() {
  const [newTag, setNewTag] = useState("")

  const tags = [
    { id: 1, name: "Biology", count: 12 },
    { id: 2, name: "Chemistry", count: 8 },
    { id: 3, name: "Physics", count: 6 },
    { id: 4, name: "Mathematics", count: 10 },
    { id: 5, name: "Lab Work", count: 4 },
    { id: 6, name: "Research", count: 7 },
    { id: 7, name: "Homework", count: 15 },
    { id: 8, name: "Projects", count: 9 },
  ]

  return (
    <div className="container p-4 sm:p-6 mx-auto">
      <div className="grid gap-6">
        <h1 className="text-2xl font-bold text-[#2D3748]">Tags</h1>

        <Card>
          <CardHeader>
            <CardTitle>Create New Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="pl-9"
                  placeholder="Enter tag name"
                />
              </div>
              <Button className="bg-[#319795] hover:bg-[#2C7A7B]">
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{tag.name}</span>
                    <Badge variant="secondary">{tag.count}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#E53E3E]">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

