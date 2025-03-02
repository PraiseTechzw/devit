"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Send, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/use-toast"
import type { GroupMessage, User } from "@prisma/client"
import Pusher from "pusher-js"

type MessageWithUser = GroupMessage & {
  user: User
}

interface GroupChatProps {
  groupId: string
  initialMessages: MessageWithUser[]
}

export function GroupChat({ groupId, initialMessages }: GroupChatProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [messages, setMessages] = useState<MessageWithUser[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Subscribe to real-time updates
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`group-${groupId}`)
    channel.bind("new-message", (data: MessageWithUser) => {
      setMessages((prev) => [...prev, data])
    })

    return () => {
      pusher.unsubscribe(`group-${groupId}`)
    }
  }, [groupId])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || loading) return

    setLoading(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      setNewMessage("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.userId === user?.id ? "flex-row-reverse" : "flex-row"}`}
            >
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${message.user.name}`} />
                <AvatarFallback>{message.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className={`flex flex-col space-y-1 ${message.userId === user?.id ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{message.user.name}</span>
                  <span className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleTimeString()}</span>
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    message.userId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-none"
            onClick={() => toast({ title: "Coming soon!", description: "Emoji picker will be available soon." })}
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

