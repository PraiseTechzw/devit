"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Users, Settings, Lock, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface GroupHeaderProps {
  group: any // Type this properly based on your Prisma schema
  isMember: boolean
  isOwner: boolean
}

export function GroupHeader({ group, isMember, isOwner }: GroupHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [joining, setJoining] = useState(false)

  async function joinGroup() {
    if (joining) return
    setJoining(true)

    try {
      const response = await fetch(`/api/groups/${group.id}/join`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to join group")

      toast({
        title: "Success!",
        description: "You have joined the study group.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join group. Please try again.",
      })
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.isPrivate ? (
            <Badge variant="secondary">
              <Lock className="w-3 h-3 mr-1" />
              Private
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Globe className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">{group.description}</p>
      </div>

      <div className="flex items-center gap-2">
        {!isMember && !group.isPrivate && (
          <Button onClick={joinGroup} disabled={joining}>
            <Users className="w-4 h-4 mr-2" />
            {joining ? "Joining..." : "Join Group"}
          </Button>
        )}

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Group</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete Group</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

