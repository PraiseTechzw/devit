import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TagCloud() {
  const tags = [
    { name: "Biology", count: 12 },
    { name: "Chemistry", count: 8 },
    { name: "Physics", count: 6 },
    { name: "Mathematics", count: 10 },
    { name: "Lab Work", count: 4 },
    { name: "Research", count: 7 },
    { name: "Homework", count: 15 },
    { name: "Projects", count: 9 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Popular Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.name} variant="secondary" className="cursor-pointer hover:bg-[#319795] hover:text-white">
              {tag.name} ({tag.count})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

