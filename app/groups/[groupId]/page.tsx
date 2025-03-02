import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { GroupChat } from "@/components/groups/group-chat"
import { GroupMembers } from "@/components/groups/group-members"
import { GroupHeader } from "@/components/groups/group-header"
import { SharedFiles } from "@/components/groups/shared-files"
import { RandomStudyTip } from "@/components/study-tips"
import { auth } from "@clerk/nextjs/server"

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const group = await prisma.studyGroup.findUnique({
    where: { id: params.groupId },
    include: {
      owner: true,
      members: {
        include: {
          user: true,
        },
      },
      messages: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      sharedFiles: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!group) {
    notFound()
  }

  // Check if user is a member
  const isMember = group.members.some((member) => member.userId === userId)
  if (!isMember && group.isPrivate) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        <GroupHeader group={group} isMember={isMember} isOwner={group.ownerId === userId} />

        {/* Show random study tip for new groups */}
        {(group.messages.length === 0 || group.sharedFiles.length === 0) && <RandomStudyTip />}

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            <GroupChat groupId={group.id} initialMessages={group.messages} isOwner={group.ownerId === userId} />
            <SharedFiles groupId={group.id} isOwner={group.ownerId === userId} />
          </div>
          <GroupMembers members={group.members} groupId={group.id} isOwner={group.ownerId === userId} />
        </div>
      </div>
    </div>
  )
}

