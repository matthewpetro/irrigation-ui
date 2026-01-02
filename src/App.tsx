import getIrrigationEvents, { IrrigationEventViewmodel } from './hooks/useIrrigationEvents'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createViewDay, createViewWeek } from '@schedule-x/calendar'
import type { CalendarEvent, CalendarConfig } from '@schedule-x/calendar'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { ZoomInPlugin } from '@starredev/schedule-x-plugins'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'

const unknownTimestampEventDurationMinutes = 30

const calendars: CalendarConfig['calendars'] = {
  test: {
    colorName: 'test',
    lightColors: {
      main: '#34A853', // left side accent color
      container: '#E6F4EA', // main container color
      onContainer: '#0F1F12', // text color
    },
  },
  frontPlants: {
    colorName: 'front-plants',
    lightColors: {
      main: '#2ECC71',
      container: '#E9F8EF',
      onContainer: '#1E7A4A',
    },
    darkColors: {
      main: '#2ECC71',
      container: '#0F2A1D',
      onContainer: '#B7EFC5',
    },
  },
  backPlants: {
    colorName: 'back-plants',
    lightColors: {
      main: '#0E8A6D',
      container: '#E2F3EF',
      onContainer: '#0A4F3E',
    },
    darkColors: {
      main: '#0E8A6D',
      container: '#0B2621',
      onContainer: '#9FE0D0',
    },
  },
  newTrees: {
    colorName: 'new-trees',
    lightColors: {
      main: '#00897B',
      container: '#E0F2F1',
      onContainer: '#004D40',
    },
    darkColors: {
      main: '#00897B',
      container: '#0A2B29',
      onContainer: '#9FE5DF',
    },
  },
  backTrees: {
    colorName: 'back-trees',
    lightColors: {
      main: '#1565C0',
      container: '#E3F0FA',
      onContainer: '#0D2F5F',
    },
    darkColors: {
      main: '#1565C0',
      container: '#0B1E36',
      onContainer: '#B3D4FF',
    },
  },
  northLawn: {
    colorName: 'north-lawn',
    lightColors: {
      main: '#2E7D32',
      container: '#E7F3E8',
      onContainer: '#1B4D20',
    },
    darkColors: {
      main: '#2E7D32',
      container: '#0E2411',
      onContainer: '#B6E3BC',
    },
  },
  southLawn: {
    colorName: 'south-lawn',
    lightColors: {
      main: '#8BC34A',
      container: '#F2F8E6',
      onContainer: '#4E6B1F',
    },
    darkColors: {
      main: '#8BC34A',
      container: '#1C2A0F',
      onContainer: '#D9F2B0',
    },
  },
  courtyardPlants: {
    colorName: 'courtyard-plants',
    lightColors: {
      main: '#7A9A01',
      container: '#F3F7E3',
      onContainer: '#4A5F00',
    },
    darkColors: {
      main: '#7A9A01',
      container: '#1E2408',
      onContainer: '#D7E89A',
    },
  },
}

const deviceIdToCalendarMap: Record<number, string> = {
  676: 'frontPlants',
  769: 'backPlants',
  675: 'newTrees', // front trees
  813: 'newTrees', // tangelo tree
  677: 'backTrees',
  768: 'northLawn',
  767: 'southLawn',
  884: 'courtyardPlants',
}

const calendarControlsPlugin = createCalendarControlsPlugin()

const calendarConfig: CalendarConfig = {
  isDark: false,
  calendars,
  views: [createViewDay(), createViewWeek()],
  timezone: 'America/Phoenix',
  plugins: [
    createCurrentTimePlugin(),
    createEventModalPlugin(),
    calendarControlsPlugin,
    new ZoomInPlugin(calendarControlsPlugin, {
      zoomFactor: 2,
      minZoom: 1,
      maxZoom: 6,
      zoomStep: 0.2,
    }),
  ],
  dayBoundaries: {
    start: '06:00',
    end: '20:00'
  },
  // weekOptions: {
  //   gridHeight: 2500,
  // },
  callbacks: {
    fetchEvents: async (range) => {
      try {
        const events = await getIrrigationEvents(range.start.toInstant(), range.end.toInstant())
        return irrigationEventsToCalendarEvents(events)
      } catch (error) {
        return [] as CalendarEvent[]
      }
    },
  },
}

const irrigationEventsToCalendarEvents = (
  irrigationEvents: IrrigationEventViewmodel[]
): CalendarEvent[] => {
  return irrigationEvents.map((event) => {
    // If we don't have a start timestamp, use the end timestamp minus the default event duration
    const startTimestamp = event.startTimestamp
      ? Temporal.Instant.from(event.startTimestamp).toZonedDateTimeISO('America/Phoenix')
      : Temporal.Instant.from(event.endTimestamp!)
          .subtract({ minutes: unknownTimestampEventDurationMinutes })
          .toZonedDateTimeISO('America/Phoenix')
    // If we don't have an end timestamp, use the start timestamp plus the default event duration
    const endTimestamp = event.endTimestamp
      ? Temporal.Instant.from(event.endTimestamp).toZonedDateTimeISO('America/Phoenix')
      : Temporal.Instant.from(event.startTimestamp!)
          .add({ minutes: unknownTimestampEventDurationMinutes })
          .toZonedDateTimeISO('America/Phoenix')
    const calendarId = deviceIdToCalendarMap[event.deviceId]
    return {
      // The device ID concatened with the start time will always be unique
      id: `${event.deviceId}-${startTimestamp.epochMilliseconds}`,
      title: event.title,
      start: startTimestamp,
      end: endTimestamp,
      deviceId: event.deviceId,
      warning: event.warning,
      calendarId,
    }
  })
}

function App() {
  const calendar = useCalendarApp(calendarConfig)

  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  )
}

export default App
