"use client"

import { useState, useEffect, useCallback } from "react"
import {
  CalendarIcon,
  Plus,
  Loader2,
  AlertTriangle,
  Clock,
  BookOpen,
  Users,
  CalendarDaysIcon as CalendarDayIcon,
} from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EventForm } from "@/components/event-form"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Event {
  id: string
  title: string
  description?: string | null
  startDate: Date
  endDate?: Date | null
  type: "deadline" | "exam" | "meeting" | "other"
  priority: "high" | "medium" | "low"
}

export function Calendar() {
  const [date, setDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Event[]>([])
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
      setUpcomingDeadlines(
        data.upcomingDeadlines.map((event: any) => ({
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
        return <CalendarDayIcon className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const formatEventTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const getDayEvents = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = event.endDate ? new Date(event.endDate) : eventStart
      return day >= new Date(eventStart.setHours(0, 0, 0, 0)) && day <= new Date(eventEnd.setHours(23, 59, 59, 999))
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calendar</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Calendar</CardTitle>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <Button variant="outline" size="sm" className="h-8" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
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
                    <div
                      className={
                        isToday(date)
                          ? "bg-primary text-primary-foreground rounded-full w-6 h-6 mx-auto flex items-center justify-center"
                          : ""
                      }
                    >
                      {date.getDate()}
                    </div>
                    {dayEvents.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5">
                            {dayEvents.slice(0, 3).map((event, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(event.priority).split(" ")[0]}`}
                              />
                            ))}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            {dayEvents.map((event) => (
                              <div key={event.id} className="text-xs">
                                {event.title}
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )
              },
            }}
          />
        </TooltipProvider>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Upcoming Events</h4>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : upcomingDeadlines.length > 0 ? (
            <div className="space-y-2">
              {upcomingDeadlines.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getPriorityColor(event.priority)}`}>
                      {getTypeIcon(event.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getTypeLabel(event.type)}</span>
                        <span>•</span>
                        <span>{getRelativeTime(event.startDate)}</span>
                        <span>•</span>
                        <span>{formatEventTime(event.startDate)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <CalendarDayIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
              <p>No upcoming events</p>
              <Button variant="link" className="mt-2" onClick={() => setDialogOpen(true)}>
                Add your first event
              </Button>
            </div>
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

