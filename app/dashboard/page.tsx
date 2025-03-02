import { Suspense } from "react"
import { ResourceGrid } from "@/components/resource-grid"
import { SearchFilters } from "@/components/search-filters"
import { Calendar } from "@/components/calendar"
import { StorageQuota } from "@/components/storage-quota"
import { TagCloud } from "@/components/tag-cloud"
import { AddMaterial } from "@/components/add-material"
import { WelcomeBanner } from "@/components/welcome-banner"
import { MaterialSkeleton } from "@/components/material-skeleton"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { query?: string; type?: string; tag?: string; priority?: string; sort?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Get user's materials with filters
  const materials = await prisma.material.findMany({
    where: {
      userId,
      ...(searchParams.type ? { type: searchParams.type } : {}),
      ...(searchParams.query
        ? {
            OR: [
              { title: { contains: searchParams.query, mode: "insensitive" } },
              { content: { contains: searchParams.query, mode: "insensitive" } },
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
          <SearchFilters />
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            <Suspense fallback={<MaterialSkeleton />}>
              <ResourceGrid initialMaterials={materials} />
            </Suspense>
            <div className="space-y-6">
              <Calendar />
              <StorageQuota />
              <TagCloud />
            </div>
          </div>
        </div>
      </div>
      <AddMaterial />
    </div>
  )
}

