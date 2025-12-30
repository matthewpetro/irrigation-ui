import dayjs from 'dayjs'
import useIrrigationEvents, { IrrigationEventViewmodel } from './hooks/useIrrigationEvents'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createViewDay, createViewWeek } from '@schedule-x/calendar'
import type { CalendarEvent } from '@schedule-x/calendar'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'
import { useEffect, useMemo } from 'react'
import { createEventsServicePlugin } from '@schedule-x/events-service'

const unknownTimestampEventDurationMinutes = 30

const irrigationEventsToCalendarEvents = (
  irrigationEvents: IrrigationEventViewmodel[]
): CalendarEvent[] => {
  return irrigationEvents.map((event) => ({
    id: generateEventId(event),
    title: event.title,
    // If we don't have a start timestamp, use the end timestamp minus the default event duration
    start: event.startTimestamp
      ? Temporal.Instant.from(event.startTimestamp).toZonedDateTimeISO('America/Phoenix')
      : Temporal.Instant.from(event.endTimestamp!)
          .subtract({ minutes: unknownTimestampEventDurationMinutes })
          .toZonedDateTimeISO('America/Phoenix'),
    // If we don't have an end timestamp, use the start timestamp plus the default event duration
    end: event.endTimestamp
      ? Temporal.Instant.from(event.endTimestamp).toZonedDateTimeISO('America/Phoenix')
      : Temporal.Instant.from(event.startTimestamp!)
          .add({ minutes: unknownTimestampEventDurationMinutes })
          .toZonedDateTimeISO('America/Phoenix'),
    deviceId: event.deviceId,
    warning: event.warning,
  }))
}

const generateEventId = (event: IrrigationEventViewmodel): string => {
  const timestamp = Temporal.Instant.from(
    event.startTimestamp ?? event.endTimestamp!
  ).epochMilliseconds
  return `${event.deviceId}-${timestamp}`
}

function App() {
  const eventsServicePlugin = useMemo(() => createEventsServicePlugin(), [])
  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek()],
    events: [],
    // events: [
    //   {
    //     id: '1',
    //     title: 'Event 1',
    //     start: Temporal.ZonedDateTime.from('2025-12-29T08:00:00-07:00[America/Phoenix]'),
    //     end: Temporal.ZonedDateTime.from('2025-12-29T13:00:00-07:00[America/Phoenix]'),
    //     deviceId: 1,
    //   },
    //   {
    //     id: '2',
    //     title: 'Event 2',
    //     start: Temporal.ZonedDateTime.from('2025-12-29T14:00:00-07:00[America/Phoenix]'),
    //     end: Temporal.ZonedDateTime.from('2025-12-29T14:30:00-07:00[America/Phoenix]'),
    //     deviceId: 2,
    //   },
    // ],
    timezone: 'America/Phoenix',
    plugins: [createCurrentTimePlugin(), eventsServicePlugin],
  })

  const { data: irrigationEvents = [] } = useIrrigationEvents(
    dayjs().startOf('day'),
    dayjs().endOf('day')
  )
  useEffect(() => {
    eventsServicePlugin.set(irrigationEventsToCalendarEvents(irrigationEvents))
  }, [irrigationEvents, eventsServicePlugin])

  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  )
}

export default App
