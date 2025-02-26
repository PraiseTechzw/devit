import { WelcomeBanner } from "@/components/welcome-banner"
import { SearchFilters } from "@/components/search-filters"
import { ResourceGrid } from "@/components/resource-grid"
import { AddMaterial } from "@/components/add-material"

export default function NotesPage() {
  return (
    <div className="container p-4 sm:p-6 mx-auto">
      <div className="grid gap-6">
        <WelcomeBanner userName="Alex" notificationCount={3} />
        <div className="grid gap-6">
          <h1 className="text-2xl font-bold text-[#2D3748]">Text Notes</h1>
          <SearchFilters />
          <ResourceGrid />
        </div>
      </div>
      <AddMaterial />
    </div>
  )
}

