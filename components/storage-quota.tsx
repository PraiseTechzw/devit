import { Cloud } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StorageQuota() {
  const usedStorage = 2.5 // GB
  const totalStorage = 5 // GB
  const usagePercentage = (usedStorage / totalStorage) * 100

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Storage</CardTitle>
        <Cloud className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {usedStorage}GB of {totalStorage}GB used
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

