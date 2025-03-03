"use client"

import { useState, useEffect, useCallback } from "react"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  AlertTriangle,
  Clock,
  BookOpen,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EventForm } from "@/components/event-form"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Event {
  id: string
  title: string
  description?: string | null
  startDate: Date
  endDate?: Date | null
  type: "deadline" | "exam" | "meeting" | "other"
  priority: "high" | "medium" | "low"
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/calendar?month=${date.getMonth()}&year=${date.getFullYear()}`)
      if (!response.ok) throw new Error("Failed to fetch events")
      const data = await response.json()
      setEvents(
        data.events.map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
        })),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load events"
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }, [date, toast])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deadline":
        return <Clock className="h-4 w-4" />
      case "exam":
        return <BookOpen className="h-4 w-4" />
      case "meeting":
        return <Users className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const formatEventTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return events
      .filter((event) => {
        const eventDate = new Date(event.startDate)
        return eventDate >= now && eventDate <= nextWeek
      })
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        // Then by date
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      })
      .slice(0, 5) // Show only top 5 upcoming events
  }

  if (error) {
    return (
      <div className="container p-4 sm:p-6 mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(date)
                      newDate.setMonth(date.getMonth() - 1)
                      setDate(newDate)
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(date)
                      newDate.setMonth(date.getMonth() + 1)
                      setDate(newDate)
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
                components={{
                  DayContent: ({ date }) => {
                    const dayEvents = events.filter((event) => {
                      const eventStart = new Date(event.startDate)
                      const eventEnd = event.endDate ? new Date(event.endDate) : eventStart
                      return (
                        date >= new Date(eventStart.setHours(0, 0, 0, 0)) &&
                        date <= new Date(eventEnd.setHours(23, 59, 59, 999))
                      )
                    })

                    return (
                      <div className="relative w-full h-full">
                        <div>{date.getDate()}</div>
                        {dayEvents.length > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5">
                            {dayEvents.slice(0, 3).map((event, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(event.priority).split(" ")[0]}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  },
                }}
              />
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
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getUpcomingEvents().map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getPriorityColor(event.priority)}`}>
                            {getTypeIcon(event.type)}
                          </div>
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.startDate).toLocaleDateString()} • {formatEventTime(event.startDate)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                      </div>
                    ))}
                    {getUpcomingEvents().length === 0 && (
                      <div className="text-center py-6">
                        <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No upcoming events</p>
                        <Button variant="link" className="mt-2" onClick={() => setDialogOpen(true)}>
                          Add your first event
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
    </div>
  )
}

