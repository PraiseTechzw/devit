import { Suspense } from "react"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { GroupList } from "@/components/groups/group-list"
import { GroupSearch } from "@/components/groups/group-search"
import { GroupSkeleton } from "@/components/groups/group-skeleton"
import { auth } from "@clerk/nextjs/server"

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: { query?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Get all public groups and private groups where the user is a member
  const groups = await prisma.studyGroup.findMany({
    where: {
      OR: [
        { isPrivate: false },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
      ...(searchParams.query
        ? {
            OR: [
              { name: { contains: searchParams.query, mode: "insensitive" } },
              { description: { contains: searchParams.query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
          sharedFiles: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        <GroupSearch />
        <Suspense fallback={<GroupSkeleton />}>
          <GroupList initialGroups={groups} userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}

