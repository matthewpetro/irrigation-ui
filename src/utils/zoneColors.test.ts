import { describe, it, expect } from 'vitest'
import { getZoneColor } from './zoneColors'

describe('getZoneColor', () => {
  it('returns blue for deviceId 1', () => {
    expect(getZoneColor(1)).toBe('#2563eb')
  })

  it('returns green for deviceId 2', () => {
    expect(getZoneColor(2)).toBe('#16a34a')
  })

  it('returns lime for deviceId 8', () => {
    expect(getZoneColor(8)).toBe('#65a30d')
  })

  it('wraps back to blue for deviceId 9', () => {
    expect(getZoneColor(9)).toBe('#2563eb')
  })

  it('wraps correctly for deviceId 16', () => {
    expect(getZoneColor(16)).toBe('#65a30d')
  })

  it('returns the same color for the same deviceId each call', () => {
    expect(getZoneColor(3)).toBe(getZoneColor(3))
  })
})
