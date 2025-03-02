import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const tag = await prisma.tag.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!tag || tag.userId !== userId) {
      return new NextResponse("Not found", { status: 404 })
    }

    await prisma.tag.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TAG_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name, color } = body

    const tag = await prisma.tag.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!tag || tag.userId !== userId) {
      return new NextResponse("Not found", { status: 404 })
    }

    const updatedTag = await prisma.tag.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        color,
      },
    })

    return NextResponse.json(updatedTag)
  } catch (error) {
    console.error("[TAG_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

