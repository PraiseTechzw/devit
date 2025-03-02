import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { title, description, startDate, endDate, type, priority } = body

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        type,
        priority,
        userId,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("[EVENTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { userId } =await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    let startDate = new Date()
    let endDate = new Date()

    if (month && year) {
      startDate = new Date(Number.parseInt(year), Number.parseInt(month), 1)
      endDate = new Date(Number.parseInt(year), Number.parseInt(month) + 1, 0)
    } else {
      // Default to current month
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
    }

    const events = await prisma.event.findMany({
      where: {
        userId,
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      orderBy: {
        startDate: "asc",
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("[EVENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

