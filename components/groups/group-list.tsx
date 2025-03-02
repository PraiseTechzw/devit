"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Plus, Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateGroupForm } from "./create-group-form"

interface Group {
  id: string
  name: string
  description: string | null
  isPrivate: boolean
  owner: {
    name: string
  }
  members: Array<{
    user: {
      name: string
    }
  }>
  _count: {
    messages: number
    sharedFiles: number
  }
}

interface GroupListProps {
  initialGroups: Group[]
  userId: string
}

export function GroupList({ initialGroups, userId }: GroupListProps) {
  const router = useRouter()
  const [groups, setGroups] = useState(initialGroups)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2D3748]">Study Groups</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <CreateGroupForm
              onSuccess={() => {
                setDialogOpen(false)
                router.refresh()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="group cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/groups/${group.id}`)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {group.name}
                    {group.isPrivate && <Badge variant="secondary">Private</Badge>}
                  </CardTitle>
                  <CardDescription>Created by {group.owner.name}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {group.description && <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{group.members.length} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{group._count.messages} messages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{group._count.sharedFiles} files</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No study groups found. Create one to get started!</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

