import { NextResponse } from "next/server"
import { databases } from "@/lib/appwrite"
import { ID } from "appwrite"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, title, type, content, url, fileId, tags, priority } = body

    const material = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_MATERIALS_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        title,
        type,
        content,
        url,
        fileId,
        tags,
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    )

    return NextResponse.json(material)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create material" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const type = searchParams.get("type")

    const query = [`userId=${userId}`]
    if (type) {
      query.push(`type=${type}`)
    }

    const materials = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_MATERIALS_COLLECTION_ID!,
      query,
    )

    return NextResponse.json(materials)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 })
  }
}

