import { useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { DatesSetArg, EventContentArg } from '@fullcalendar/core'
import { useIrrigationEvents } from '../hooks/useIrrigationEvents'

interface DateRange {
  start: Date
  end: Date
}

function WarningTooltip({ warning }: { warning: string }) {
  return (
    <span title={warning} aria-label={warning} className="ml-1 cursor-help opacity-80">
      ⚠
    </span>
  )
}

function EventContent({ info }: { info: EventContentArg }) {
  const { warning, currentlyOn } = info.event.extendedProps as {
    warning: string | null
    currentlyOn: boolean
  }
  return (
    <div className="fc-event-title-container overflow-hidden px-1 py-0.5 text-xs leading-tight">
      <span className="font-semibold">{info.event.title}</span>
      {currentlyOn && <span className="ml-1 text-[10px] opacity-80">(running)</span>}
      {warning && <WarningTooltip warning={warning} />}
    </div>
  )
}

export function IrrigationCalendar() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  const { events, loading, error } = useIrrigationEvents(dateRange)

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setDateRange({ start: arg.start, end: arg.end })
  }, [])

  return (
    <div className="relative flex h-full flex-col">
      {loading && (
        <div className="absolute inset-x-0 top-0 z-10 bg-blue-600 px-4 py-1 text-center text-sm text-white">
          Loading irrigation data…
        </div>
      )}
      {error && (
        <div className="bg-red-600 px-4 py-2 text-sm text-white" role="alert">
          Unable to load irrigation data: {error}
        </div>
      )}
      <div className={`min-h-0 flex-1 ${loading ? 'pt-7' : ''}`}>
        <FullCalendar
          plugins={[timeGridPlugin]}
          initialView="timeGridDay"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek',
          }}
          buttonText={{
            today: 'Today',
            day: 'Day',
            week: 'Week',
          }}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={true}
          height="100%"
          firstDay={0}
          events={events}
          datesSet={handleDatesSet}
          eventContent={(info) => <EventContent info={info} />}
        />
      </div>
    </div>
  )
}
