"use client"

import type React from "react"
import { useState } from "react"
import { CalendarIcon, MapPin, Video, Clock, AlertTriangle } from "lucide-react"
import { format, addMinutes, isBefore } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface EventFormProps {
  onSuccess?: () => void
}

type EventType = "deadline" | "exam" | "meeting" | "study" | "other"
type Priority = "high" | "medium" | "low"

interface EventFormData {
  title: string
  description: string
  startDate: Date
  startTime: string
  endDate: Date | null
  endTime: string
  type: EventType
  priority: Priority
  location: string
  isOnline: boolean
  meetingUrl: string
  reminders: number[] // Minutes before event
  
}

export function EventForm({ onSuccess }: EventFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startDate: new Date(),
    startTime: format(new Date(), "HH:mm"),
    endDate: null,
    endTime: format(addMinutes(new Date(), 60), "HH:mm"),
    type: "deadline",
    priority: "medium",
    location: "",
    isOnline: false,
    meetingUrl: "",
    reminders: [],
  })

  const eventTypes: { value: EventType; label: string }[] = [
    { value: "deadline", label: "Deadline" },
    { value: "exam", label: "Exam" },
    { value: "meeting", label: "Meeting" },
    { value: "study", label: "Study Session" },
    { value: "other", label: "Other" },
  ]

  const reminderOptions = [
    { value: 5, label: "5 minutes before" },
    { value: 15, label: "15 minutes before" },
    { value: 30, label: "30 minutes before" },
    { value: 60, label: "1 hour before" },
    { value: 1440, label: "1 day before" },
    { value: 10080, label: "1 week before" },
  ]

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return "Title is required"
    }

    const startDateTime = new Date(`${format(formData.startDate, "yyyy-MM-dd")}T${formData.startTime}`)
    if (isBefore(startDateTime, new Date())) {
      return "Start time cannot be in the past"
    }

    if (formData.endDate) {
      const endDateTime = new Date(`${format(formData.endDate, "yyyy-MM-dd")}T${formData.endTime}`)
      if (isBefore(endDateTime, startDateTime)) {
        return "End time must be after start time"
      }
    }

    if (formData.isOnline && !formData.meetingUrl) {
      return "Meeting URL is required for online events"
    }

    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const error = validateForm()
    if (error) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error,
      })
      return
    }

    setLoading(true)

    try {
      const startDateTime = new Date(`${format(formData.startDate, "yyyy-MM-dd")}T${formData.startTime}`)
      const endDateTime = formData.endDate
        ? new Date(`${format(formData.endDate, "yyyy-MM-dd")}T${formData.endTime}`)
        : null

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime?.toISOString(),
          type: formData.type,
          priority: formData.priority,
          location: formData.isOnline ? null : formData.location,
          isOnline: formData.isOnline,
          meetingUrl: formData.isOnline ? formData.meetingUrl : null,
          reminders: formData.reminders,
        }),
      })

      if (!response.ok) throw new Error("Failed to create event")

      toast({
        title: "Success",
        description: "Event created successfully.",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const isEndDateValid = formData.endDate
    ? !isBefore(
        new Date(`${format(formData.endDate, "yyyy-MM-dd")}T${formData.endTime}`),
        new Date(`${format(formData.startDate, "yyyy-MM-dd")}T${formData.startTime}`),
      )
    : true

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter event title"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add event details"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Start Date</Label>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>End Date</Label>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate || undefined}
                    onSelect={(date) => setFormData({ ...formData, endDate: date || null })}
                    disabled={(date) => date < formData.startDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {!isEndDateValid && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>End date and time must be after start date and time</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Event Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: EventType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Location</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isOnline}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isOnline: checked,
                    location: checked ? "" : formData.location,
                    meetingUrl: checked ? formData.meetingUrl : "",
                  })
                }
              />
              <Label>Online Meeting</Label>
            </div>
          </div>

          <div className="relative">
            {formData.isOnline ? (
              <>
                <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Meeting URL"
                  type="url"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                />
              </>
            ) : (
              <>
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reminders
          </Label>
          <Select
            value={formData.reminders[0]?.toString()}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                reminders: value ? [Number(value)] : [],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Set reminder" />
            </SelectTrigger>
            <SelectContent>
              {reminderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !isEndDateValid}>
        {loading ? "Creating..." : "Create Event"}
      </Button>
    </form>
  )
}

