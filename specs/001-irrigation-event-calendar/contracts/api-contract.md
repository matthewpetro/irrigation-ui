# API Consumption Contract: Irrigation Events

**Feature**: 001-irrigation-event-calendar
**Date**: 2026-07-04
**Source**: `irrigation-events-server-api.yaml`

This document describes what the Irrigation Event Calendar UI expects from the backend API. It is a consumption contract — the UI is the consumer; the backend is the provider.

---

## Endpoint: GET /irrigation-events

### Purpose

Retrieve all irrigation zone events within a given time range for display on the calendar.

### Request

```
GET /irrigation-events?startTimestamp={iso8601}&endTimestamp={iso8601}
```

| Parameter | Type | Required | Format | Example |
|---|---|---|---|---|
| `startTimestamp` | string | Yes | ISO 8601 date-time | `2026-07-04T00:00:00-05:00` |
| `endTimestamp` | string | Yes | ISO 8601 date-time | `2026-07-04T23:59:59-05:00` |

The UI always passes the full day boundary (midnight to 23:59:59) for day view, and Sunday 00:00:00 to Saturday 23:59:59 for week view, in the local timezone.

### Response

**Status 200 — Success**

```json
[
  {
    "title": "Zone 1 - Front Lawn",
    "deviceId": 1,
    "startTimestamp": "2026-07-04T06:00:00-05:00",
    "endTimestamp": "2026-07-04T06:15:00-05:00"
  },
  {
    "title": "Zone 2 - Back Garden",
    "deviceId": 2,
    "startTimestamp": "2026-07-04T06:15:00-05:00",
    "currentlyOn": true
  },
  {
    "title": "Zone 3 - Side Beds",
    "deviceId": 3,
    "endTimestamp": "2026-07-04T05:45:00-05:00",
    "warning": "The ON event is missing. The time shown is the OFF time."
  }
]
```

### Response Schema

Each element in the array is an `IrrigationEventViewmodelDto`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | **Yes** | Zone display name shown on the event block |
| `deviceId` | number (integer ≥ 1) | **Yes** | Uniquely identifies the zone; used for color assignment |
| `startTimestamp` | string (ISO 8601) | No | Absent when the ON event was not recorded |
| `endTimestamp` | string (ISO 8601) | No | Absent when the zone is still running or OFF event not recorded |
| `currentlyOn` | boolean | No | `true` when the zone is actively irrigating right now |
| `warning` | string (enum) | No | One of three values — see Warning Values below |

### Warning Values

| Value | Meaning | UI Behavior |
|---|---|---|
| `"The ON event is missing. The time shown is the OFF time."` | Only the zone's stop time is known | Render event anchored at `endTimestamp`; show warning indicator |
| `"The OFF event is missing. The time shown is the ON time."` | Only the zone's start time is known; zone is no longer active | Render event from `startTimestamp` with open-ended visual; show warning indicator |
| `"The OFF event is missing and the current device state cannot be determined."` | Start time known; cannot determine if zone is still running | Render event from `startTimestamp` with uncertain-end visual; show distinct warning |

### UI Contract Requirements

The UI **requires** the following guarantees from the API:

1. `title` is always a non-empty string that human-readably identifies the zone.
2. `deviceId` is a stable identifier — the same physical zone always returns the same `deviceId`.
3. Timestamps, when present, are valid ISO 8601 date-time strings parseable by `new Date()`.
4. The response is a flat array (no pagination); all relevant events are returned in a single response.
5. A response of `[]` (empty array) is valid and means no events overlap the requested range.
6. **Overlap semantics**: The API returns events that *overlap* the requested window, not only events whose timestamps fall entirely within `startTimestamp`–`endTimestamp`. An event that started before `startTimestamp` (or ends after `endTimestamp`) will be included if it overlaps the requested range. The UI renders all returned events at their actual timestamps without clipping.

### Error Responses

| Status | UI Behavior |
|---|---|
| 4xx / 5xx | Display user-friendly error message; time grid remains visible |
| Network timeout / unreachable | Display "Unable to load irrigation data" message |

---

## Base URL Configuration

The API base URL is configured via the Vite environment variable `VITE_API_BASE_URL`.

- **Development default**: `http://localhost:3000`
- **Production**: Set in `.env.local` (gitignored), e.g., `http://192.168.1.100:3000`

All API calls from `src/api/irrigationEventsApi.ts` use a single shared Axios instance configured with this base URL.
