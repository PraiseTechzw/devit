import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

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

    // Get events for the specified month
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

    // Get upcoming events (next 7 days)
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const upcomingDeadlines = await prisma.event.findMany({
      where: {
        userId,
        startDate: {
          gte: now,
          lte: nextWeek,
        },
      },
      orderBy: [
        {
          priority: "desc", // High priority first
        },
        {
          startDate: "asc",
        },
      ],
      take: 5,
    })

    return NextResponse.json({
      events,
      upcomingDeadlines,
    })
  } catch (error) {
    console.error("[CALENDAR_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

