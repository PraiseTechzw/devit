import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId } =await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name, color } = body

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
    })

    if (existingTag) {
      return new NextResponse("Tag already exists", { status: 400 })
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color,
        userId,
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error("[TAGS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } =await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      where: {
        userId,
      },
      orderBy: {
        count: "desc",
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("[TAGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

