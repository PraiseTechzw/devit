import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { storage } from "@/lib/appwrite"

const STORAGE_LIMIT = 5 * 1024 * 1024 * 1024 // 5GB in bytes

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all files for the user
    const materials = await prisma.material.findMany({
      where: {
        userId,
        fileId: {
          not: null,
        },
      },
      select: {
        fileId: true,
      },
    })

    // Get file sizes from Appwrite
    let totalSize = 0
    for (const material of materials) {
      if (material.fileId) {
        try {
          const file = await storage.getFile(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, material.fileId)
          totalSize += file.sizeOriginal
        } catch (error) {
          console.error(`Error getting file size for ${material.fileId}:`, error)
        }
      }
    }

    return NextResponse.json({
      used: totalSize,
      total: STORAGE_LIMIT,
      percentage: (totalSize / STORAGE_LIMIT) * 100,
    })
  } catch (error) {
    console.error("[STORAGE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

