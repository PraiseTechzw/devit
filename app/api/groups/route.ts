import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name, description, isPrivate } = body

    // Create the study group
    const group = await prisma.studyGroup.create({
      data: {
        name,
        description,
        isPrivate,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
      include: {
        members: true,
      },
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error("[GROUPS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

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
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error("[GROUPS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

