import dayjs from 'dayjs'
import useIrrigationEvents, { IrrigationEventViewmodel } from './hooks/useIrrigationEvents'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createViewDay, createViewWeek } from '@schedule-x/calendar'
import type { CalendarEvent } from '@schedule-x/calendar'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'
import { useMemo } from 'react'

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
  return `${event.deviceId}-${event.startTimestamp ?? event.endTimestamp}`
}

function App() {
  const { data: events = [] } = useIrrigationEvents(dayjs().startOf('day'), dayjs().endOf('day'))
  const calendarEvents = useMemo(() => irrigationEventsToCalendarEvents(events), [events])

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek()],
    // events: calendarEvents,
    events: [
      {
        id: '1',
        title: 'Event 1',
        start: Temporal.ZonedDateTime.from('2025-10-17T08:00:00-07:00[America/Phoenix]'),
        end: Temporal.ZonedDateTime.from('2025-10-17T13:00:00-07:00[America/Phoenix]'),
        deviceId: 1,
      },
      {
        id: '2',
        title: 'Event 2',
        start: Temporal.ZonedDateTime.from('2025-10-18T08:00:00-07:00[America/Phoenix]'),
        end: Temporal.ZonedDateTime.from('2025-10-18T13:00:00-07:00[America/Phoenix]'),
        deviceId: 2,
      },
    ],
    timezone: 'America/Phoenix',
    plugins: [createCurrentTimePlugin()],
  })

  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  )
}

export default App
