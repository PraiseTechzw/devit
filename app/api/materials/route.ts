import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod"; // For schema validation

// Schema for validating the request body
const MaterialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["note", "pdf", "link"]),
  content: z.string().optional(),
  url: z.string().url().optional(),
  fileId: z.string().optional(),
  fileSize: z.number().int().nonnegative().optional(), // Add fileSize validation
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  priority: z.enum(["high", "medium", "low"]),
});

// Helper function to fetch user details from Clerk
async function getClerkUser(userId: string) {
  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Clerk API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const email = data.email_addresses?.[0]?.email_address || "user@example.com";
    const name = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User Name";

    return { email, name };
  } catch (error) {
    console.error("Failed to fetch user details from Clerk:", error);
    throw new Error("Failed to fetch user details from Clerk");
  }
}

// Helper function to handle errors
function handleError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
  const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
  return new NextResponse(
    JSON.stringify({ error: "Internal Server Error", details: errorMessage }),
    { status: 500 }
  );
}

// GET handler to fetch materials
async function handleGet(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "note" | "pdf" | "link" | null;

    // Fetch materials for the user, optionally filtered by type
    const materials = await prisma.material.findMany({
      where: {
        userId,
        type: type || undefined, // If type is provided, filter by type
      },
      orderBy: {
        createdAt: "desc", // Sort by most recent
      },
      select: {
        id: true,
        title: true,
        type: true,
        content: true,
        url: true,
        fileId: true,
        fileSize: true, // Include fileSize in the response
        tags: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(materials);
  } catch (error) {
    return handleError(error, "MATERIALS_GET");
  }
}

// POST handler to create a new material
async function handlePost(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user exists in the database
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If the user doesn't exist, fetch details from Clerk and create the user
    if (!user) {
      const clerkUser = await getClerkUser(userId);

      user = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.email,
          name: clerkUser.name,
          major: "Undeclared", // Default value
          academicYear: "Freshman", // Default value
        },
      });
    }

    // Parse and validate the request body
    const body = await request.json();
    const validation = MaterialSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: "Validation Error", details: validation.error.errors }),
        { status: 400 }
      );
    }

    const { title, type, content, url, fileId, fileSize, tags, priority } = validation.data;

    // Validate type-specific fields
    if (type === "note" && !content) {
      return new NextResponse("Content is required for notes", { status: 400 });
    }
    if (type === "pdf" && !fileId) {
      return new NextResponse("File is required for PDF documents", { status: 400 });
    }
    if (type === "link" && !url) {
      return new NextResponse("URL is required for web links", { status: 400 });
    }

    // Ensure tags is always an array
    let tagsArray: string[] = [];
    if (typeof tags === "string") {
      tagsArray = tags.split(","); // Convert comma-separated string to array
    } else if (Array.isArray(tags)) {
      tagsArray = tags; // Use the array directly
    }

    // Filter out empty tags
    tagsArray = tagsArray.filter((tag) => typeof tag === "string" && tag.trim() !== "");

    // Check for duplicate materials
    const existingMaterial = await prisma.material.findFirst({
      where: {
        userId,
        OR: [
          { title },
          { fileId: fileId || undefined }, // Only check fileId if it exists
        ],
      },
    });

    if (existingMaterial) {
      return new NextResponse("Material with the same title or file already exists", { status: 409 });
    }

    // Create the material
    const material = await prisma.material.create({
      data: {
        title,
        type,
        content,
        url,
        fileId,
        fileSize, // Include fileSize
        tags: tagsArray,
        priority,
        userId,
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    return handleError(error, "MATERIALS_POST");
  }
}

export async function GET(request: Request) {
  return handleGet(request);
}

export async function POST(request: Request) {
  return handlePost(request);
}