import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic'; // Force dynamic behavior

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth(); // Call auth() without arguments
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [totalMaterials, dueThisWeek, sharedWithMe, recentActivity] = await Promise.all([
      prisma.material.count({
        where: { userId },
      }),
      prisma.material.count({
        where: {
          userId,
          priority: "high",
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      Promise.resolve(0), // Placeholder for sharedWithMe
      prisma.material.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalMaterials,
      dueThisWeek,
      sharedWithMe,
      recentActivity,
    });
  } catch (error) {
    console.error("[STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}