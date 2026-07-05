import type { CalendarEventProps, IrrigationEventDto } from '../types/irrigationEvent'
import { getZoneColor } from './zoneColors'

export function toCalendarEvents(
  dtos: IrrigationEventDto[],
  viewDate: Date,
): CalendarEventProps[] {
  return dtos.map((dto) => toCalendarEvent(dto, viewDate))
}

function toCalendarEvent(dto: IrrigationEventDto, viewDate: Date): CalendarEventProps {
  const color = getZoneColor(dto.deviceId)
  const id = `${dto.deviceId}-${dto.startTimestamp ?? dto.endTimestamp ?? 'unknown'}`
  const currentlyOn = dto.currentlyOn ?? false
  const warning = dto.warning ?? null

  // Case 1: Both timestamps present
  if (dto.startTimestamp && dto.endTimestamp) {
    return {
      id,
      title: dto.title,
      start: dto.startTimestamp,
      end: dto.endTimestamp,
      allDay: false,
      backgroundColor: color,
      borderColor: color,
      classNames: currentlyOn ? ['event-active'] : [],
      extendedProps: { deviceId: dto.deviceId, currentlyOn, warning },
    }
  }

  // Case 2: Currently on — start known, end is now
  if (dto.startTimestamp && currentlyOn) {
    return {
      id,
      title: dto.title,
      start: dto.startTimestamp,
      end: new Date(),
      allDay: false,
      backgroundColor: color,
      borderColor: color,
      classNames: ['event-active'],
      extendedProps: { deviceId: dto.deviceId, currentlyOn, warning },
    }
  }

  // Case 3: OFF missing + unknown state — start known, placeholder end
  if (dto.startTimestamp && !dto.endTimestamp) {
    const placeholderEnd = new Date(new Date(dto.startTimestamp).getTime() + 30 * 60 * 1000)
    return {
      id,
      title: dto.title,
      start: dto.startTimestamp,
      end: placeholderEnd,
      allDay: false,
      backgroundColor: color,
      borderColor: color,
      classNames: ['event-warning'],
      extendedProps: { deviceId: dto.deviceId, currentlyOn, warning },
    }
  }

  // Case 4: ON missing — only endTimestamp present
  if (!dto.startTimestamp && dto.endTimestamp) {
    const pointEnd = new Date(new Date(dto.endTimestamp).getTime() + 60 * 1000)
    return {
      id,
      title: dto.title,
      start: dto.endTimestamp,
      end: pointEnd,
      allDay: false,
      backgroundColor: color,
      borderColor: color,
      classNames: ['event-warning'],
      extendedProps: { deviceId: dto.deviceId, currentlyOn, warning },
    }
  }

  // Case 5: Neither timestamp — all-day event on viewDate
  const dayStart = new Date(viewDate)
  dayStart.setHours(0, 0, 0, 0)
  return {
    id,
    title: dto.title,
    start: dayStart,
    end: null,
    allDay: true,
    backgroundColor: color,
    borderColor: color,
    classNames: ['event-warning', 'event-no-times'],
    extendedProps: { deviceId: dto.deviceId, currentlyOn, warning },
  }
}
