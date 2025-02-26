import { ResourceGrid } from "@/components/resource-grid"
import { SearchFilters } from "@/components/search-filters"
import { Calendar } from "@/components/calendar"
import { StorageQuota } from "@/components/storage-quota"
import { TagCloud } from "@/components/tag-cloud"
import { AddMaterial } from "@/components/add-material"
import { WelcomeBanner } from "@/components/welcome-banner"

export default function DashboardPage() {
  return (
    <div className="container p-4 sm:p-6 mx-auto">
      <div className="grid gap-6">
        <WelcomeBanner userName="Alex" notificationCount={3} />
        <div className="grid gap-6">
          <SearchFilters />
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            <ResourceGrid />
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

