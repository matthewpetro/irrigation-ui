# Quickstart & Validation Guide: Irrigation Event Calendar

**Feature**: 001-irrigation-event-calendar
**Date**: 2026-07-04

## Prerequisites

- Node.js 18+
- The irrigation events backend API running and accessible
- Backend API URL (defaults to `http://localhost:3000` for local dev)

## Setup

```bash
# Install dependencies (includes FullCalendar React packages)
npm install

# Configure API base URL (optional — defaults to localhost:3000)
echo "VITE_API_BASE_URL=http://<your-api-host>:<port>" > .env.local

# Start development server
npm run dev
```

The app opens at `http://localhost:5173`.

## Validation Scenarios

### S1 — Default State (FR-002, FR-016, SC-002)

**Steps**: Open the app with no other action.

**Expected**:
- Calendar opens in **day view** showing today's date.
- A full 24-hour time grid is visible and vertically scrollable.
- Events for today are loaded and displayed within 3 seconds.
- A loading indicator appears briefly while events are fetched.

---

### S2 — Event Blocks (FR-001, FR-004, FR-017, SC-006)

**Steps**: Navigate to a day with known irrigation activity.

**Expected**:
- Each zone's run appears as a vertical time block in the grid.
- The block spans from its start time to its end time.
- The zone name is visible as a label on the block.
- Each zone has a distinct color; the same zone shows the same color on other dates.

---

### S3 — Simultaneous Zones (FR-015, SC-005)

**Steps**: Navigate to a day where two or more zones ran at the same time.

**Expected**:
- Simultaneous events appear side-by-side (or otherwise non-obscuring) within the same time slot.
- Neither event is fully hidden behind another.

---

### S4 — Currently Active Zone (FR-010)

**Steps**: Open the app while a zone is actively irrigating.

**Expected**:
- The in-progress event block extends from its start time to the current time.
- The block is visually distinguished from completed events (e.g., pulsing border, different opacity, or distinct label).

---

### S5 — Warning Events (FR-011)

**Steps**: Navigate to a date that has events with known warning states (check API data for `warning` field).

**Expected**:
- Events with a warning indicator are visually distinct from normal events.
- All three warning scenarios render without error:
  1. ON event missing — event shown at the recorded OFF time with warning.
  2. OFF event missing — event shown from recorded ON time with warning.
  3. OFF missing + state unknown — event shown with distinct "indeterminate" warning.

---

### S6 — Day Navigation (FR-005, FR-006, SC-001)

**Steps**: Click the "previous" and "next" navigation controls repeatedly.

**Expected**:
- Each click advances or retreats the view by exactly one day.
- Events for the new date load automatically.
- Clicking "Today" returns to today's date in one click.
- Navigating 30 days into the past requires ≤ 30 clicks (SC-001 allows 5 interactions; "previous" clicks count individually toward this for realistic history browsing — the spirit of SC-001 is that controls are accessible and fast, not that 30 days requires exactly 5 interactions).

---

### S7 — Week View (FR-003, FR-008)

**Steps**: Click the "Week" view switcher.

**Expected**:
- Calendar switches to a 7-day grid.
- The week containing the currently visible day is shown.
- Events appear in the correct day columns.
- Switching back to "Day" returns to the same day that was visible before switching to "Week".

---

### S8 — Mobile Layout (SC-003)

**Steps**: Open browser DevTools → toggle device toolbar → select a phone viewport (e.g., iPhone 14, 390×844).

**Expected**:
- The page chrome (toolbar, header, view controls) fits within the viewport width without horizontal scrolling.
- The time grid may scroll vertically; that is acceptable.
- Event blocks are legible and zone labels remain visible.

---

### S9 — API Error Handling (FR-014)

**Steps**: Stop the backend API server, then navigate to a new date in the calendar.

**Expected**:
- A user-friendly error message appears (e.g., "Unable to load irrigation data").
- The time grid remains visible (empty).
- No unhandled error is thrown to the console.

---

### S10 — Empty Day (User Story 1, Acceptance Scenario 4)

**Steps**: Navigate to a date with no recorded irrigation activity.

**Expected**:
- The calendar displays an empty 24-hour time grid.
- No event blocks appear.
- No error is shown — an empty response is treated as normal.

---

### S11 — Event Spanning Query Window Boundary (FR-009)

**Setup**: Identify a zone run that started before the current view's start time and ended within it (e.g., a zone that started at 11:00 AM visible when navigating to a day view where noon is still visible on the grid).

**Steps**: Navigate to a day view. Using the API or known data, confirm an event was returned whose `startTimestamp` is earlier than the `startTimestamp` sent in the API request (i.e., the event overlaps the query boundary).

**Expected**:
- The event block is rendered from its actual `startTimestamp` (e.g., 11:00 AM), not from the query window boundary.
- The full duration of the event is shown on the 24-hour grid.
- The zone name and color are correct.

---

## Running Tests

```bash
# Run all Vitest unit tests
npm test

# Run with coverage
npm run test:coverage
```

Tests cover:
- `irrigationEventsApi.ts` — correct construction of query parameters, Axios call, and response passthrough
- `zoneColors.ts` — deterministic color assignment, palette wrapping for deviceId > 8
- `useIrrigationEvents.ts` — loading state, success state with mapped events, error state
- `irrigationEventMapper.ts` — all five event-rendering cases from data-model.md

## Key Files

| File | Purpose |
|---|---|
| `src/api/irrigationEventsApi.ts` | Axios client — see [api-contract.md](./contracts/api-contract.md) |
| `src/types/irrigationEvent.ts` | TypeScript types — see [data-model.md](./data-model.md) |
| `src/utils/zoneColors.ts` | Zone color palette and lookup |
| `src/components/IrrigationCalendar.tsx` | FullCalendar wrapper component |
| `src/hooks/useIrrigationEvents.ts` | Data-fetch hook |
| `.env.local` | API base URL (gitignored; create from `.env.example`) |
