/* eslint-disable  @typescript-eslint/no-unused-vars */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic'; // Force dynamic behavior

interface AuthResponse {
  userId: string | null;
}

interface StatsResponse {
  totalMaterials: number;
  dueThisWeek: number;
  sharedWithMe: number;
  recentActivity: number;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { userId }: AuthResponse = await auth(); // Call auth() without arguments
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [totalMaterials, dueThisWeek, sharedWithMe, recentActivity]: [number, number, number, number] = await Promise.all([
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

    const response: StatsResponse = {
      totalMaterials,
      dueThisWeek,
      sharedWithMe,
      recentActivity,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}