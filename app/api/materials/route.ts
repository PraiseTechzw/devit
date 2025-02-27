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
    const { title, type, content, url, fileId, tags, priority } = body

    // Validate required fields
    if (!title || !type || !priority) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Validate type-specific fields
    switch (type) {
      case "note":
        if (!content) {
          return new NextResponse("Content is required for notes", { status: 400 })
        }
        break
      case "pdf":
        if (!fileId) {
          return new NextResponse("File is required for PDF documents", { status: 400 })
        }
        break
      case "link":
        if (!url) {
          return new NextResponse("URL is required for web links", { status: 400 })
        }
        break
      default:
        return new NextResponse("Invalid material type", { status: 400 })
    }

    const material = await prisma.material.create({
      data: {
        title,
        type,
        content,
        url,
        fileId,
        tags,
        priority,
        userId,
      },
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error("[MATERIALS_POST]", error)
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
    const type = searchParams.get("type")

    const materials = await prisma.material.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(materials)
  } catch (error) {
    console.error("[MATERIALS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

