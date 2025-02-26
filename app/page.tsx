import { ResourceGrid } from "@/components/resource-grid"
import { SearchFilters } from "@/components/search-filters"
import { Calendar } from "@/components/calendar"

export default function DashboardPage() {
  return (
    <div className="container p-6 mx-auto">
      <div className="grid gap-6">
        <SearchFilters />
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <ResourceGrid />
          <Calendar />
        </div>
      </div>
    </div>
  )
}

