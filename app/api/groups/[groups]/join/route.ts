import { getAuth } from "@clerk/nextjs/server"
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const groupId = params.groupId

    // Check if group exists and if it's private
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
    })

    if (!group) {
      return new NextResponse("Group not found", { status: 404 })
    }

    if (group.isPrivate) {
      return new NextResponse("Cannot join private group directly", { status: 403 })
    }

    // Check if already a member
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    })

    if (existingMembership) {
      return new NextResponse("Already a member", { status: 400 })
    }

    // Add user as member
    const membership = await prisma.groupMember.create({
      data: {
        userId,
        groupId,
        role: "member",
      },
    })

    // Create notification for group owner
    await prisma.notification.create({
      data: {
        type: "group_join",
        title: "New Member",
        content: `A new member has joined your study group: ${group.name}`,
        userId: group.ownerId,
        groupId,
      },
    })

    return NextResponse.json(membership)
  } catch (error) {
    console.error("[GROUP_JOIN_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

