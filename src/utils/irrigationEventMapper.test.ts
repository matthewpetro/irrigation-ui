import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { toCalendarEvents } from './irrigationEventMapper'
import type { IrrigationEventDto } from '../types/irrigationEvent'

const VIEW_DATE = new Date('2026-07-04T00:00:00-05:00')

describe('toCalendarEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-04T10:00:00-05:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('case 1: both timestamps — maps start/end directly', () => {
    const dto: IrrigationEventDto = {
      title: 'Front Lawn',
      deviceId: 1,
      startTimestamp: '2026-07-04T06:00:00-05:00',
      endTimestamp: '2026-07-04T06:15:00-05:00',
    }
    const [event] = toCalendarEvents([dto], VIEW_DATE)
    expect(event.start).toBe('2026-07-04T06:00:00-05:00')
    expect(event.end).toBe('2026-07-04T06:15:00-05:00')
    expect(event.allDay).toBe(false)
    expect(event.classNames).toEqual([])
    expect(event.backgroundColor).toBe('#2563eb')
  })

  it('case 1: currently on with both timestamps — gets event-active class', () => {
    const dto: IrrigationEventDto = {
      title: 'Front Lawn',
      deviceId: 1,
      startTimestamp: '2026-07-04T06:00:00-05:00',
      endTimestamp: '2026-07-04T06:15:00-05:00',
      currentlyOn: true,
    }
    const [event] = toCalendarEvents([dto], VIEW_DATE)
    expect(event.classNames).toContain('event-active')
  })

  it('case 2: currentlyOn true, no endTimestamp — end is now', () => {
    const dto: IrrigationEventDto = {
      title: 'Back Garden',
      deviceId: 2,
      startTimestamp: '2026-07-04T09:00:00-05:00',
      currentlyOn: true,
    }
    const [event] = toCalendarEvents([dto], VIEW_DATE)
    expect(event.start).toBe('2026-07-04T09:00:00-05:00')
    expect(event.end).toEqual(new Date('2026-07-04T10:00:00-05:00'))
    expect(event.allDay).toBe(false)
    expect(event.classNames).toContain('event-active')
  })

  it('case 3: startTimestamp only, not currentlyOn — 30-min placeholder end', () => {
    const dto: IrrigationEventDto = {
      title: 'Side Beds',
      deviceId: 3,
      startTimestamp: '2026-07-04T07:00:00-05:00',
      warning: 'The OFF event is missing and the current device state cannot be determined.',
    }
    const [event] = toCalendarEvents([dto], VIEW_DATE)
    expect(event.start).toBe('2026-07-04T07:00:00-05:00')
    const expectedEnd = new Date('2026-07-04T07:00:00-05:00').getTime() + 30 * 60 * 1000
    expect((event.end as Date).getTime()).toBe(expectedEnd)
    expect(event.allDay).toBe(false)
    expect(event.classNames).toContain('event-warning')
  })

  it('case 4: endTimestamp only, ON missing — 1-min point span', () => {
    const dto: IrrigationEventDto = {
      title: 'Drip Zone',
      deviceId: 4,
      endTimestamp: '2026-07-04T05:45:00-05:00',
      warning: 'The ON event is missing. The time shown is the OFF time.',
    }
    const [event] = toCalendarEvents([dto], VIEW_DATE)
    expect(event.start).toBe('2026-07-04T05:45:00-05:00')
    const expectedEnd = new Date('2026-07-04T05:45:00-05:00').getTime() + 60 * 1000
    expect((event.end as Date).getTime()).toBe(expectedEnd)
    expect(event.allDay).toBe(false)
    expect(event.classNames).toContain('event-warning')
  })

  it('case 5: no timestamps — all-day event on viewDate', () => {
    const dto: IrrigationEventDto = {
      title: 'Unknown Zone',
      deviceId: 5,
    }
    const [event] = toCalendarEvents([dto], VIEW_DATE)
    expect(event.allDay).toBe(true)
    expect(event.classNames).toContain('event-warning')
    expect(event.classNames).toContain('event-no-times')
    expect(event.end).toBeNull()
  })

  it('timestamps are never clipped — start before view boundary is passed through', () => {
    const dto: IrrigationEventDto = {
      title: 'Front Lawn',
      deviceId: 1,
      startTimestamp: '2026-07-04T11:00:00-05:00',
      endTimestamp: '2026-07-04T13:00:00-05:00',
    }
    const [event] = toCalendarEvents([dto], VIEW_DATE)
    expect(event.start).toBe('2026-07-04T11:00:00-05:00')
    expect(event.end).toBe('2026-07-04T13:00:00-05:00')
  })

  it('assigns correct zone colors by deviceId', () => {
    const events = toCalendarEvents(
      [
        { title: 'Zone 1', deviceId: 1, startTimestamp: 's', endTimestamp: 'e' },
        { title: 'Zone 2', deviceId: 2, startTimestamp: 's', endTimestamp: 'e' },
      ],
      VIEW_DATE,
    )
    expect(events[0].backgroundColor).toBe('#2563eb')
    expect(events[1].backgroundColor).toBe('#16a34a')
  })
})
