"use client"

import { useState } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const events = [
    {
      id: 1,
      title: "Biology Quiz",
      date: "2024-02-28",
      type: "exam",
      priority: "high",
    },
    {
      id: 2,
      title: "Physics Lab Report Due",
      date: "2024-02-29",
      type: "assignment",
      priority: "medium",
    },
    {
      id: 3,
      title: "Study Group Meeting",
      date: "2024-03-01",
      type: "meeting",
      priority: "low",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-[#E53E3E] text-white"
      case "medium":
        return "bg-[#319795] text-white"
      case "low":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-200"
    }
  }

  return (
    <div className="container p-4 sm:p-6 mx-auto">
      <div className="grid gap-6">
        <h1 className="text-2xl font-bold text-[#2D3748]">Calendar</h1>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Schedule</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.date}</p>
                      </div>
                      <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

