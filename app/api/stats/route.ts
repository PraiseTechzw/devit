import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const [totalMaterials, dueThisWeek, sharedWithMe, recentActivity] = await Promise.all([
      // Total materials count
      prisma.material.count({
        where: { userId },
      }),

      // Due this week (materials with high priority created in last 7 days)
      prisma.material.count({
        where: {
          userId,
          priority: "high",
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Shared with me (placeholder - implement sharing feature later)
      Promise.resolve(0),

      // Recent activity (created in last 24 hours)
      prisma.material.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return NextResponse.json({
      totalMaterials,
      dueThisWeek,
      sharedWithMe,
      recentActivity,
    })
  } catch (error) {
    console.error("[STATS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

