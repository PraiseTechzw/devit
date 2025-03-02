import { BookOpen, Users, MessageSquare, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EmptyStateProps {
  type: "chat" | "files" | "members"
  isOwner: boolean
  onAction?: () => void
}

export function EmptyState({ type, isOwner, onAction }: EmptyStateProps) {
  const content = {
    chat: {
      icon: MessageSquare,
      title: "Start the Conversation",
      description: "Break the ice! Share study materials, ask questions, or plan your next study session.",
      tips: [
        "Share your current study goals",
        "Ask questions about difficult topics",
        "Schedule virtual study sessions",
        "Share helpful resources you've found",
      ],
      actionLabel: "Send First Message",
    },
    files: {
      icon: FileText,
      title: "Share Study Materials",
      description: "Upload notes, assignments, or helpful resources to collaborate with your group.",
      tips: [
        "Share class notes and summaries",
        "Upload practice problems",
        "Share study guides",
        "Add relevant research papers",
      ],
      actionLabel: "Upload First File",
    },
    members: {
      icon: Users,
      title: "Grow Your Study Group",
      description: "Invite classmates to join and make studying more effective.",
      tips: [
        "Invite classmates from your courses",
        "Share the group link with study partners",
        "Assign roles to help organize",
        "Welcome new members with an introduction",
      ],
      actionLabel: "Invite Members",
    },
  }

  const { icon: Icon, title, description, tips, actionLabel } = content[type]

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <Icon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Study Tips
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          {isOwner && onAction && (
            <Button onClick={onAction} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

