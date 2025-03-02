"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Crown, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GroupMembersProps {
  members: any[] // Type this properly based on your Prisma schema
  groupId: string
  isOwner: boolean
}

export function GroupMembers({ members, groupId, isOwner }: GroupMembersProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function removeMember(memberId: string) {
    if (loading) return
    setLoading(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove member")

      toast({
        title: "Success!",
        description: "Member has been removed from the group.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove member. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  async function promoteToAdmin(memberId: string) {
    if (loading) return
    setLoading(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "admin" }),
      })

      if (!response.ok) throw new Error("Failed to promote member")

      toast({
        title: "Success!",
        description: "Member has been promoted to admin.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to promote member. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${member.user.name}`} />
                    <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {member.role === "owner" ? (
                        <>
                          <Crown className="w-3 h-3" /> Owner
                        </>
                      ) : member.role === "admin" ? (
                        <>
                          <Shield className="w-3 h-3" /> Admin
                        </>
                      ) : (
                        "Member"
                      )}
                    </p>
                  </div>
                </div>

                {isOwner && member.role !== "owner" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={loading}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role !== "admin" && (
                        <DropdownMenuItem onClick={() => promoteToAdmin(member.id)}>Promote to Admin</DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => removeMember(member.id)}>
                        Remove from Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

