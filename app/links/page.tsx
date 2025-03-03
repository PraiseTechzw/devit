import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { WelcomeBanner } from "@/components/welcome-banner"
import { SearchFilters } from "@/components/search-filters"
import { ResourceGrid } from "@/components/resource-grid"
import { AddMaterial } from "@/components/add-material"

export default async function LinksPage({
  searchParams,
}: {
  searchParams: { query?: string; tag?: string; priority?: string; sort?: string }
}) {
  const { userId } =await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Get user's links with filters
  const materials = await prisma.material.findMany({
    where: {
      userId,
      type: "link", // Filter for links only
      ...(searchParams.query
        ? {
            OR: [
              { title: { contains: searchParams.query, mode: "insensitive" } },
              { url: { contains: searchParams.query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(searchParams.tag ? { tags: { has: searchParams.tag } } : {}),
      ...(searchParams.priority ? { priority: searchParams.priority } : {}),
    },
    orderBy: {
      ...(searchParams.sort === "oldest"
        ? { createdAt: "asc" }
        : searchParams.sort === "priority"
          ? { priority: "desc" }
          : { createdAt: "desc" }),
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  return (
    <div className="container p-4 sm:p-6 mx-auto">
      <div className="grid gap-6">
        <WelcomeBanner />
        <div className="grid gap-6">
          <h1 className="text-2xl font-bold text-[#2D3748]">Web Links</h1>
          <SearchFilters />
          <ResourceGrid initialMaterials={materials} type="link" />
        </div>
      </div>
      <AddMaterial />
    </div>
  )
}

