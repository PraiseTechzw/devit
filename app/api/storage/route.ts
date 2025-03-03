import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/appwrite";

const STORAGE_LIMIT = 5 * 1024 * 1024 * 1024; // 5GB in bytes

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all materials for the user
    const materials = await prisma.material.findMany({
      where: {
        userId,
      },
      select: {
        fileId: true,
        fileSize: true, // Include fileSize from the database
      },
    });

    let totalSize = 0;

    // Fetch file sizes from Appwrite if not available in the database
    const fileSizePromises = materials.map(async (material) => {
      if (material.fileId) {
        try {
          // If fileSize is already stored in the database, use it
          if (material.fileSize) {
            return material.fileSize;
          }

          // Otherwise, fetch the file size from Appwrite
          const file = await storage.getFile(
            process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!,
            material.fileId
          );
          return file.sizeOriginal;
        } catch (error) {
          console.error(`Error getting file size for ${material.fileId}:`, error);
          return 0;
        }
      }
      return 0;
    });

    const fileSizes = await Promise.all(fileSizePromises);
    totalSize = fileSizes.reduce((sum, size) => sum + size, 0);

    return NextResponse.json({
      used: totalSize,
      total: STORAGE_LIMIT,
      percentage: (totalSize / STORAGE_LIMIT) * 100,
    });
  } catch (error) {
    console.error("[STORAGE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}