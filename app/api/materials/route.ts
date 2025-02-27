import { auth, getAuth } from "@clerk/nextjs/server"
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 🛠️ Check if the user exists in your database
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      // Optional: Auto-create the user if they don't exist
      // This depends on your use case — you could also return 400 here instead
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
        }
      }).then(res => res.json())

      user = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.email_addresses[0].email_address,
          name: `${clerkUser.first_name} ${clerkUser.last_name}`,
          major: "", // You can fill this dynamically if needed
          academicYear: ""
        }
      })
    }

    const body = await request.json()
    const { title, type, content, url, fileId, tags, priority } = body

    const material = await prisma.material.create({
      data: {
        title,
        type,
        content,
        url,
        fileId,
        tags,
        priority,
        userId,
      },
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error("[MATERIALS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
