import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getEvents } from './irrigationEventsApi'
import axiosInstance from './axiosInstance'

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockedGet = vi.mocked(axiosInstance.get)

describe('getEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls GET /irrigation-events with correct params', async () => {
    mockedGet.mockResolvedValue({ data: [] })
    await getEvents({ startTimestamp: '2026-07-04T00:00:00Z', endTimestamp: '2026-07-04T23:59:59Z' })
    expect(mockedGet).toHaveBeenCalledWith('/irrigation-events', {
      params: {
        startTimestamp: '2026-07-04T00:00:00Z',
        endTimestamp: '2026-07-04T23:59:59Z',
      },
    })
  })

  it('returns the typed array from the response', async () => {
    const mockData = [{ title: 'Zone 1', deviceId: 1, startTimestamp: '2026-07-04T06:00:00Z' }]
    mockedGet.mockResolvedValue({ data: mockData })
    const result = await getEvents({ startTimestamp: 's', endTimestamp: 'e' })
    expect(result).toEqual(mockData)
  })

  it('propagates errors on non-2xx responses', async () => {
    mockedGet.mockRejectedValue(new Error('Network Error'))
    await expect(getEvents({ startTimestamp: 's', endTimestamp: 'e' })).rejects.toThrow('Network Error')
  })
})
