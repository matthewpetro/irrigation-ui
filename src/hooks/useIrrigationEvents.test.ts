import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useIrrigationEvents } from './useIrrigationEvents'
import * as api from '../api/irrigationEventsApi'

vi.mock('../api/irrigationEventsApi')

const mockedGetEvents = vi.mocked(api.getEvents)

const RANGE = {
  start: new Date('2026-07-04T00:00:00Z'),
  end: new Date('2026-07-04T23:59:59Z'),
}

describe('useIrrigationEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with loading=true when range is provided', () => {
    mockedGetEvents.mockResolvedValue([])
    const { result } = renderHook(() => useIrrigationEvents(RANGE))
    expect(result.current.loading).toBe(true)
    expect(result.current.events).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('sets events and loading=false on success', async () => {
    mockedGetEvents.mockResolvedValue([
      { title: 'Zone 1', deviceId: 1, startTimestamp: '2026-07-04T06:00:00Z', endTimestamp: '2026-07-04T06:15:00Z' },
    ])
    const { result } = renderHook(() => useIrrigationEvents(RANGE))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].title).toBe('Zone 1')
    expect(result.current.error).toBeNull()
  })

  it('sets error and loading=false on API failure', async () => {
    mockedGetEvents.mockRejectedValue(new Error('Network Error'))
    const { result } = renderHook(() => useIrrigationEvents(RANGE))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Network Error')
    expect(result.current.events).toEqual([])
  })

  it('returns empty state when range is null', () => {
    const { result } = renderHook(() => useIrrigationEvents(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.events).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('re-fetches when date range changes', async () => {
    mockedGetEvents.mockResolvedValue([])
    const { rerender } = renderHook(
      ({ range }: { range: typeof RANGE }) => useIrrigationEvents(range),
      { initialProps: { range: RANGE } },
    )
    await waitFor(() => expect(mockedGetEvents).toHaveBeenCalledTimes(1))

    const newRange = {
      start: new Date('2026-07-05T00:00:00Z'),
      end: new Date('2026-07-05T23:59:59Z'),
    }
    rerender({ range: newRange })
    await waitFor(() => expect(mockedGetEvents).toHaveBeenCalledTimes(2))
  })
})
