"use client"

import { useState } from "react"
import { MessageSquare, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function GroupsPage() {
  const [groups] = useState([
    {
      id: 1,
      name: "Biology Study Group",
      description: "Weekly study sessions for Biology 101",
      members: 5,
      messages: 12,
    },
    {
      id: 2,
      name: "Physics Lab Team",
      description: "Collaboration for physics lab reports",
      members: 4,
      messages: 8,
    },
    {
      id: 3,
      name: "Math Help",
      description: "Peer tutoring for calculus",
      members: 8,
      messages: 24,
    },
  ])

  return (
    <div className="container p-4 sm:p-6 mx-auto">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#2D3748]">Study Groups</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#319795] hover:bg-[#2C7A7B]">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Study Group</DialogTitle>
                <DialogDescription>Create a new study group to collaborate with your peers.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input id="name" placeholder="Enter group name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the purpose of your group" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-[#319795] hover:bg-[#2C7A7B]">Create Group</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="group">
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{group.members} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{group.messages} messages</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

