import { auth, currentUser } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    const user = await currentUser()

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { major, academicYear } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 })
    }

    // Create new user
    const dbUser = await prisma.user.create({
      data: {
        id: userId,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        major,
        academicYear,
      },
    })

    // Create default tags
    const defaultTags = ["Homework", "Exam", "Notes", "Research"]
    await Promise.all(
      defaultTags.map((name) =>
        prisma.tag.create({
          data: {
            name,
            userId,
          },
        }),
      ),
    )

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error("[ONBOARDING_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

