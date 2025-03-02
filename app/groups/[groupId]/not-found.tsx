import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function GroupNotFound() {
  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Group Not Found</CardTitle>
          </div>
          <CardDescription>
            The study group you're looking for doesn't exist or you don't have access to it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/groups">Back to Groups</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

