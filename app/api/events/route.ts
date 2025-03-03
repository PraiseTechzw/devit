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
    const { title, description, startDate, endDate, type, priority, location, isOnline, meetingUrl, reminders } = body

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        type,
        priority,
        location,
        isOnline,
        meetingUrl,
        userId,
      },
    })

    // Create notifications for reminders if specified
    if (reminders && reminders.length > 0) {
      await Promise.all(
        reminders.map((reminder: number) => {
          const reminderDate = new Date(new Date(startDate).getTime() - reminder * 60 * 1000) // Convert minutes to milliseconds
            return prisma.notification.create({
            data: {
              type: "event_reminder",
              title: `Reminder: ${title}`,
              content: `Your event "${title}" starts in ${reminder} minutes`,
              userId,
              actionUrl: `/calendar?date=${new Date(startDate).toISOString()}`,
              scheduledAt: reminderDate,
            },
            })
        }),
      )
    }

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

    const upcomingEvents = await prisma.event.findMany({
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

    // Always return arrays, even if empty
    return NextResponse.json({
      events: events || [],
      upcomingEvents: upcomingEvents || [],
    })
  } catch (error) {
    console.error("[EVENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

