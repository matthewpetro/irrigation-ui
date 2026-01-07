import getIrrigationEvents, { IrrigationEventViewmodel } from './getIrrigationEvents'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'

const unknownTimestampEventDurationMinutes = 30

// const irrigationEventsToCalendarEvents = (
//   irrigationEvents: IrrigationEventViewmodel[]
// ): CalendarEvent[] => {
//   return irrigationEvents.map((event) => {
//     // If we don't have a start timestamp, use the end timestamp minus the default event duration
//     const startTimestamp = event.startTimestamp
//       ? Temporal.Instant.from(event.startTimestamp).toZonedDateTimeISO('America/Phoenix')
//       : Temporal.Instant.from(event.endTimestamp!)
//           .subtract({ minutes: unknownTimestampEventDurationMinutes })
//           .toZonedDateTimeISO('America/Phoenix')
//     // If we don't have an end timestamp, use the start timestamp plus the default event duration
//     const endTimestamp = event.endTimestamp
//       ? Temporal.Instant.from(event.endTimestamp).toZonedDateTimeISO('America/Phoenix')
//       : Temporal.Instant.from(event.startTimestamp!)
//           .add({ minutes: unknownTimestampEventDurationMinutes })
//           .toZonedDateTimeISO('America/Phoenix')
//     const calendarId = deviceIdToCalendarMap[event.deviceId]
//     return {
//       // The device ID concatened with the start time will always be unique
//       id: `${event.deviceId}-${startTimestamp.epochMilliseconds}`,
//       title: event.title,
//       start: startTimestamp,
//       end: endTimestamp,
//       deviceId: event.deviceId,
//       warning: event.warning,
//       calendarId,
//     }
//   })
// }

function App() {
  return (
    <div>
      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay',
        }}
        events
      />
    </div>
  )
}

export default App
