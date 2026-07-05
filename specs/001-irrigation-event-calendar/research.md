# Research: Irrigation Event Calendar

**Feature**: 001-irrigation-event-calendar
**Date**: 2026-07-04

## Decision 1: Calendar Library

**Decision**: Use FullCalendar 6 (`@fullcalendar/react` + `@fullcalendar/timegrid`)

**Rationale**: The spec requires a time-grid calendar with:
- Day and week views with a full 24-hour vertically-scrollable grid
- Simultaneous events rendered side-by-side without obscuring one another
- Navigation controls (prev/next/today) and a view switcher

FullCalendar provides all of these out of the box via its `timeGridDay` and `timeGridWeek` plugins. Building these features from scratch would require ~1000+ lines of complex positional layout logic (column computation for overlapping events, scroll sync, touch support) and would violate Principle I (Simplicity First). FullCalendar does not duplicate Axios, Tailwind, or any other already-adopted tool.

**Alternatives considered**:
- `react-big-calendar`: Fewer timeline features, requires moment.js or date-fns as a peer dependency (adds bundle weight for no other benefit)
- Custom component: Violates Simplicity First; estimated 3–5× the development effort for equivalent functionality
- `react-calendar`: No time-grid view; day/appointment view not available without significant custom code

**FullCalendar + Tailwind coexistence strategy**: FullCalendar manages the grid CSS (time slots, column headers, event positioning). Tailwind manages the page chrome (toolbar, header, error/loading states). FullCalendar's event block color is controlled via the `backgroundColor` event property (set to the zone color). Warning states use FullCalendar's `classNames` event property to apply a Tailwind-compatible CSS class that adds a border or pattern overlay.

---

## Decision 2: Date Handling

**Decision**: Native `Date` objects only — no date library (no date-fns, no moment.js)

**Rationale**: The API returns ISO 8601 date-time strings (`format: date-time`). The browser's native `Date` constructor parses ISO 8601 correctly, and FullCalendar accepts both ISO 8601 strings and `Date` objects natively. The operations needed (parse, compare, start-of-day, end-of-day) are all achievable with native Date arithmetic without a library. Adding date-fns solely for this feature would introduce unnecessary dependency weight and contradict Principle I.

**Alternatives considered**:
- `date-fns`: Comprehensive, tree-shakeable, but unnecessary overhead for this use case
- `dayjs`: Lighter than moment.js but still an unjustified addition for simple ISO 8601 parsing

---

## Decision 3: Zone Color Assignment

**Decision**: Predefined palette of 8 visually distinct colors assigned deterministically by `deviceId % 8`

**Rationale**: The spec requires each zone to have a consistent color across all views and dates. A deterministic mapping by `deviceId` guarantees the same zone always gets the same color without requiring any stored configuration or server-side data. A palette of 8 distinct colors accommodates the expected number of irrigation zones in a residential system (typically 4–8 zones).

**Palette** (selected for contrast on white calendar backgrounds and accessibility):
```
['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#65a30d']
```
(Blue, Green, Red, Amber, Violet, Cyan, Pink, Lime)

If more than 8 zones are ever encountered, the palette wraps (zone 9 gets the same color as zone 1). This is acceptable for a residential system but noted as a limitation.

**Alternatives considered**:
- Random color generation: Non-deterministic — same zone would appear different colors across sessions
- Server-provided color config: Requires backend changes outside scope; over-engineered for single-user use

---

## Decision 4: API Base URL Configuration

**Decision**: Vite environment variable `VITE_API_BASE_URL`, defaulting to `http://localhost:3000` for development

**Rationale**: The API is a locally-hosted service on the home network. The base URL must be configurable without code changes (different home network addresses, port changes). Vite's `import.meta.env.VITE_API_BASE_URL` is the standard mechanism for this in a Vite/TypeScript project. A `.env.local` file (gitignored) holds the production value.

---

## Decision 5: Event Rendering for Incomplete Timing Data

**Decision**: Three rendering modes based on which timestamps are present:

| Warning Scenario | startTimestamp | endTimestamp | Rendering |
|---|---|---|---|
| Normal event | ✅ present | ✅ present | Block from start to end |
| Currently running | ✅ present | absent | Block from start to `new Date()` (live end); `currentlyOn` class applied |
| OFF missing, state unknown | ✅ present | absent | Block from start with 30-minute visual placeholder end; warning class applied |
| ON missing (only OFF recorded) | absent | ✅ present | Point event at endTimestamp; warning class applied |
| Neither timestamp | absent | absent | All-day event on the date derived from `title` or `deviceId`; warning class applied; placed in all-day row |

The distinction between "currently running" (`currentlyOn === true`) and "OFF missing, state unknown" (`currentlyOn` absent/false and no endTimestamp) is made explicit via the API's `warning` field values.

---

## Decision 6: Query Range Construction

**Decision**: The API call for day view passes `startTimestamp = start-of-day T00:00:00` and `endTimestamp = end-of-day T23:59:59` in ISO 8601 format, adjusted to the local timezone offset. Week view passes the start of Sunday to end of Saturday.

**Rationale**: The API requires both `startTimestamp` and `endTimestamp`. Using the full day/week boundary ensures no events near midnight are missed. FullCalendar's `datesSet` callback provides the current view's start and end `Date` objects, which are used directly to construct the query parameters.

**Important API behavior**: The API returns all events that *overlap* the requested window, not only events whose timestamps fall entirely within it. An event that started before `startTimestamp` (e.g., started at 11:00 AM when the query window starts at noon) will be included in the response so the complete event can be rendered. The UI must pass all returned events to FullCalendar at their actual timestamps — no clipping to the query window boundaries. FullCalendar handles rendering events that span outside the visible grid range correctly.
