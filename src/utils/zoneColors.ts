const ZONE_COLOR_PALETTE = [
  '#2563eb', // Blue
  '#16a34a', // Green
  '#dc2626', // Red
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#0891b2', // Cyan
  '#be185d', // Pink
  '#65a30d', // Lime
]

export function getZoneColor(deviceId: number): string {
  return ZONE_COLOR_PALETTE[(deviceId - 1) % ZONE_COLOR_PALETTE.length]
}
