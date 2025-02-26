import { CalendarIcon } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Calendar() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Calendar</CardTitle>
        <CalendarIcon className="w-4 h-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <CalendarComponent mode="single" className="rounded-md border" />
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Upcoming Deadlines</h4>
          <div className="text-sm text-gray-500">No deadlines today</div>
        </div>
      </CardContent>
    </Card>
  )
}

