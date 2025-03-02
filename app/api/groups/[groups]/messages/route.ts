import { getAuth } from "@clerk/nextjs/server"
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { pusher } from "@/lib/pusher"

export async function POST(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const groupId = params.groupId
    const body = await request.json()
    const { content } = body

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    })

    if (!membership) {
      return new NextResponse("Not a member of this group", { status: 403 })
    }

    // Create the message
    const message = await prisma.groupMessage.create({
      data: {
        content,
        userId,
        groupId,
      },
      include: {
        user: true,
      },
    })

    // Trigger real-time update
    await pusher.trigger(`group-${groupId}`, "new-message", message)

    return NextResponse.json(message)
  } catch (error) {
    console.error("[GROUP_MESSAGES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const groupId = params.groupId

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    })

    if (!membership) {
      return new NextResponse("Not a member of this group", { status: 403 })
    }

    // Get messages with user info
    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("[GROUP_MESSAGES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

