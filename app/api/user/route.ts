import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth, currentUser } from "@clerk/nextjs/server"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { major, academicYear } = body

    const dbUser = await prisma.user.create({
      data: {
        id: userId,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        major,
        academicYear,
      },
    })

    // Create default tags for the user
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
    console.error("[USER_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        tags: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USER_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

