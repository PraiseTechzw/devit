"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { Send, Smile, FileText, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/use-toast"
import { FileUpload } from "./file-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { GroupMessage, User } from "@prisma/client"
import Pusher from "pusher-js"
import { EmptyState } from "@/components/empty-states"

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
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    // Subscribe to real-time updates
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`group-${groupId}`)
    channel.bind("new-message", (data: MessageWithUser) => {
      setMessages((prev) => [...prev, data])
      if (isAtBottom) {
        scrollToBottom()
      }
    })

    return () => {
      pusher.unsubscribe(`group-${groupId}`)
    }
  }, [groupId, isAtBottom, scrollToBottom])

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      setIsAtBottom(Math.abs(scrollHeight - clientHeight - scrollTop) < 10)
    }

    scrollElement.addEventListener("scroll", handleScroll)
    return () => scrollElement.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
    }
  }, [isAtBottom, scrollToBottom])

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

  const handleFileUploadComplete = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `Shared a file: ${fileName}`,
          fileId,
          fileName,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      setUploadDialogOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to share file. Please try again.",
      })
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <EmptyState
            type="chat"
            isOwner={true} // You'll need to pass this as a prop
            onAction={() => {
              const input = document.querySelector('input[type="text"]') as HTMLInputElement
              if (input) {
                input.focus()
              }
            }}
          />
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isFirstInGroup = index === 0 || messages[index - 1].userId !== message.userId
              const isLastInGroup = index === messages.length - 1 || messages[index + 1].userId !== message.userId

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.userId === user?.id ? "flex-row-reverse" : "flex-row"}`}
                >
                  {isFirstInGroup && (
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${message.user.name}`} />
                      <AvatarFallback>{message.user.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`flex flex-col space-y-1 ${message.userId === user?.id ? "items-end" : "items-start"}`}
                  >
                    {isFirstInGroup && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{message.user.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.userId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.fileId ? (
                        <div className="flex items-center gap-2">
                          {message.fileName?.endsWith(".jpg") ||
                          message.fileName?.endsWith(".png") ||
                          message.fileName?.endsWith(".gif") ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span>{message.fileName}</span>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="flex-none">
                <FileText className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share File</DialogTitle>
                <DialogDescription>Upload and share a file with the group.</DialogDescription>
              </DialogHeader>
              <FileUpload groupId={groupId} onUploadComplete={handleFileUploadComplete} />
            </DialogContent>
          </Dialog>
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
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}

