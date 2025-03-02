"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Plus, Loader2 } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EventForm } from "@/components/event-form"
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  type: string
  priority: string
}

export function Calendar() {
  const [date, setDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      setLoading(true)
      const response = await fetch(`/api/events?month=${date.getMonth()}&year=${date.getFullYear()}`)
      if (!response.ok) throw new Error("Failed to fetch events")
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load events. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-primary text-primary-foreground"
      case "low":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getDayEvents = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = event.endDate ? new Date(event.endDate) : eventStart
      return day >= new Date(eventStart.setHours(0, 0, 0, 0)) && day <= new Date(eventEnd.setHours(23, 59, 59, 999))
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Calendar</CardTitle>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <Button variant="outline" size="sm" className="h-8" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
          className="rounded-md border"
          components={{
            DayContent: ({ date }) => {
              const dayEvents = getDayEvents(date)
              return (
                <div className="relative w-full h-full">
                  <div>{date.getDate()}</div>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              )
            },
          }}
        />
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Upcoming Deadlines</h4>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-2">
              {events
                .filter((event) => new Date(event.startDate) >= new Date())
                .slice(0, 3)
                .map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <p className="text-xs text-gray-500">{new Date(event.startDate).toLocaleDateString()}</p>
                    </div>
                    <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No upcoming deadlines</div>
          )}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <EventForm
            onSuccess={() => {
              setDialogOpen(false)
              fetchEvents()
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

