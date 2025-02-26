"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Clock, Download, Eye, MessageSquare, Share2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function MaterialDetail() {
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Alex Kim",
      content: "Great notes! Could you clarify the part about mitochondria?",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: "Sarah Chen",
      content: "I added some additional references in section 3.",
      timestamp: "1 day ago",
    },
  ])

  const versions = [
    {
      id: 1,
      user: "You",
      action: "Updated content",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: "Sarah Chen",
      action: "Added comments",
      timestamp: "1 day ago",
    },
    {
      id: 3,
      user: "You",
      action: "Created document",
      timestamp: "2 days ago",
    },
  ]

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
        <Link href="/dashboard" className="hover:text-[#319795]">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/notes" className="hover:text-[#319795]">
          Notes
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">Biology Chapter 5</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">Biology Chapter 5 - Cell Structure</h1>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="secondary">Biology</Badge>
            <Badge variant="secondary">Semester 4</Badge>
            <Badge className="bg-[#E53E3E] text-white">High Priority</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="prose max-w-none">
                  <h2>Introduction to Cell Structure</h2>
                  <p>
                    The cell is the basic structural, functional, and biological unit of all known living organisms. A
                    cell is the smallest unit of life that can replicate independently.
                  </p>
                  <h3>Key Components:</h3>
                  <ul>
                    <li>Cell membrane</li>
                    <li>Nucleus</li>
                    <li>Cytoplasm</li>
                    <li>Mitochondria</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="comments" className="mt-4 space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-[#319795] flex items-center justify-center text-white">
                        {comment.user[0]}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">{comment.user}</CardTitle>
                        <CardDescription className="text-xs">{comment.timestamp}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
            <div className="flex items-center space-x-2">
              <Textarea placeholder="Add a comment..." />
              <Button className="bg-[#319795] hover:bg-[#2C7A7B]">Post</Button>
            </div>
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {versions.map((version) => (
                    <div key={version.id} className="flex items-center space-x-4">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{version.user}</p>
                        <p className="text-xs text-gray-500">
                          {version.action} • {version.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-gray-500">Feb 24, 2024</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Modified</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Views</p>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">24</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Comments</p>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">{comments.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

