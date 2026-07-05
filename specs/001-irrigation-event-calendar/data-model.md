# Data Model: Irrigation Event Calendar

**Feature**: 001-irrigation-event-calendar
**Date**: 2026-07-04

## Types (src/types/irrigationEvent.ts)

### IrrigationWarning

The three warning states returned by the API as a string enum:

```typescript
export type IrrigationWarning =
  | 'The ON event is missing. The time shown is the OFF time.'
  | 'The OFF event is missing. The time shown is the ON time.'
  | 'The OFF event is missing and the current device state cannot be determined.';
```

### IrrigationEventDto

Direct mapping from the `IrrigationEventViewmodelDto` schema in `irrigation-events-server-api.yaml`:

```typescript
export interface IrrigationEventDto {
  startTimestamp?: string;    // ISO 8601 date-time; absent when ON event not recorded
  endTimestamp?: string;      // ISO 8601 date-time; absent when zone still running or OFF not recorded
  title: string;              // Zone display name (always present)
  deviceId: number;           // Zone identifier, integer >= 1 (always present)
  currentlyOn?: boolean;      // True when zone is actively running right now
  warning?: IrrigationWarning;
}
```

### CalendarEventProps

Internal model passed to FullCalendar's `events` array. Derived from `IrrigationEventDto` by the mapping utility:

```typescript
export interface CalendarEventProps {
  id: string;                 // `${deviceId}-${startTimestamp ?? endTimestamp ?? 'unknown'}`
  title: string;              // Zone name (from dto.title)
  start: string | Date;       // Derived: startTimestamp if present; else endTimestamp
  end: string | Date | null;  // Derived: endTimestamp if present; else Date.now() if currentlyOn; else null
  allDay: boolean;            // True only when neither timestamp is present
  backgroundColor: string;    // Zone color from palette (by deviceId)
  borderColor: string;        // Same as backgroundColor (or accent color for warning states)
  classNames: string[];       // Tailwind/custom CSS classes (e.g., 'event-warning', 'event-active')
  extendedProps: {
    deviceId: number;
    currentlyOn: boolean;     // Defaults to false when absent in DTO
    warning: IrrigationWarning | null;
  };
}
```

### ApiQueryParams

Parameters sent to `GET /irrigation-events`:

```typescript
export interface IrrigationEventsQueryParams {
  startTimestamp: string;    // ISO 8601 date-time (start of visible range)
  endTimestamp: string;      // ISO 8601 date-time (end of visible range)
}
```

## Event Mapping Rules (src/utils/irrigationEventMapper.ts)

All `start` and `end` values are passed directly from the DTO's actual timestamps — they are **never clipped** to the query window boundaries. The API may return events whose timestamps extend outside the queried range (overlap semantics); FullCalendar renders them at their real position on the 24-hour grid.

| Input condition | `start` value | `end` value | `allDay` | `classNames` |
|---|---|---|---|---|
| Both timestamps present | `startTimestamp` (actual) | `endTimestamp` (actual) | `false` | `[]` or `['event-active']` if `currentlyOn` |
| `currentlyOn === true`, no endTimestamp | `startTimestamp` (actual) | `new Date()` | `false` | `['event-active']` |
| Warning: OFF missing + unknown state | `startTimestamp` (actual) | 30-min visual placeholder | `false` | `['event-warning']` |
| Warning: ON missing (only endTimestamp) | `endTimestamp` (actual) | same as start + 1 min | `false` | `['event-warning']` |
| Neither timestamp | today's date | — | `true` | `['event-warning', 'event-no-times']` |

## Zone Color Palette (src/utils/zoneColors.ts)

```typescript
const ZONE_COLOR_PALETTE = [
  '#2563eb',  // Blue
  '#16a34a',  // Green
  '#dc2626',  // Red
  '#d97706',  // Amber
  '#7c3aed',  // Violet
  '#0891b2',  // Cyan
  '#be185d',  // Pink
  '#65a30d',  // Lime
];

// getZoneColor(deviceId: number): string
// Returns ZONE_COLOR_PALETTE[(deviceId - 1) % ZONE_COLOR_PALETTE.length]
```

Assignment is deterministic and stable: the same `deviceId` always maps to the same color regardless of session, view, or date.

## State Managed by useIrrigationEvents Hook

```typescript
interface IrrigationEventsState {
  events: CalendarEventProps[];  // Mapped events ready for FullCalendar
  loading: boolean;
  error: string | null;
}
```

The hook accepts a date range (start, end as `Date`) and re-fetches when the range changes. It calls `irrigationEventsApi.getEvents(params)` and maps the response through `irrigationEventMapper.toCalendarEvents(dtos)`.
