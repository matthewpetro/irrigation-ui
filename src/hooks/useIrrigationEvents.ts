import { useState, useEffect } from 'react'
import { getEvents } from '../api/irrigationEventsApi'
import { toCalendarEvents } from '../utils/irrigationEventMapper'
import type { CalendarEventProps } from '../types/irrigationEvent'

interface DateRange {
  start: Date
  end: Date
}

interface IrrigationEventsState {
  events: CalendarEventProps[]
  loading: boolean
  error: string | null
}

export function useIrrigationEvents(range: DateRange | null): IrrigationEventsState {
  const [events, setEvents] = useState<CalendarEventProps[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!range) return

    let cancelled = false
    setLoading(true)
    setError(null)

    getEvents({
      startTimestamp: range.start.toISOString(),
      endTimestamp: range.end.toISOString(),
    })
      .then((dtos) => {
        if (!cancelled) {
          setEvents(toCalendarEvents(dtos, range.start))
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load irrigation data')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [range?.start.toISOString(), range?.end.toISOString()])  // eslint-disable-line react-hooks/exhaustive-deps

  return { events, loading, error }
}
