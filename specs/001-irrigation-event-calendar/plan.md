# Implementation Plan: Irrigation Event Calendar

**Branch**: `001-irrigation-event-calendar` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-irrigation-event-calendar/spec.md`

## Summary

Build a read-only, mobile-first React SPA that displays the history of home irrigation zone events on a FullCalendar-powered time-grid calendar with day and week views. Events are fetched from the `/irrigation-events` REST API endpoint, color-coded by zone, rendered as time-block spans on a full 24-hour vertically-scrollable grid, and accompanied by warning indicators for the three incomplete-timing scenarios defined by the API. The app opens in day view showing today by default.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 18, Vite 5, Axios, Tailwind CSS 3, FullCalendar 6 (`@fullcalendar/react`, `@fullcalendar/timegrid`), Vitest

**Storage**: N/A — all data fetched from REST API; no local persistence

**Testing**: Vitest — unit tests for API client, event-mapping utilities, and zone-color logic

**Target Platform**: Modern web browser (Chrome, Safari, Firefox); mobile-first responsive layout targeting portrait phone upward

**Project Type**: Single-page web application (SPA)

**Performance Goals**: All events for the visible date range render within 3 seconds on a home network connection (SC-002)

**Constraints**: Mobile-usable without horizontal scrolling of page chrome; read-only; single-user; no auth

**Scale/Scope**: Single-user home app; typically fewer than 20 irrigation events per day; up to 90 days of history

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | FullCalendar handles complex calendar rendering; a custom time-grid would violate this principle — see Complexity Tracking |
| II. Separation of Concerns | ✅ PASS | Axios calls isolated in `src/api/`; data transformation in `src/utils/`; calendar rendering in `src/components/` |
| III. Testability & Test Coverage | ✅ PASS | API client, zone-color utility, and event-mapping logic are non-UI modules covered by Vitest tests |
| IV. Technology Stack Discipline | ⚠️ EXCEPTION | FullCalendar added as new dependency — justified in Complexity Tracking; does not duplicate any existing tool |
| V. Responsive, Mobile-First UI | ✅ PASS | Tailwind mobile-first utility classes for page chrome; FullCalendar configured for responsive layout |
| VI. API-Driven Data Access | ✅ PASS | All event data fetched from `/irrigation-events` via the Axios API layer; no embedded mock data in production paths |

*Post-Phase 1 re-check: All gates still pass. Design does not introduce any new violations.*

## Project Structure

### Documentation (this feature)

```text
specs/001-irrigation-event-calendar/
├── plan.md              # This file
├── research.md          # Phase 0: library and approach decisions
├── data-model.md        # Phase 1: TypeScript types
├── quickstart.md        # Phase 1: validation and run guide
├── contracts/
│   └── api-contract.md  # Phase 1: API consumption contract
└── tasks.md             # Phase 2 output (created by /speckit-tasks — not this command)
```

### Source Code (repository root)

```text
src/
├── api/
│   └── irrigationEventsApi.ts       # Axios client for /irrigation-events
├── components/
│   └── IrrigationCalendar.tsx       # Calendar UI wrapper (no Axios calls)
├── hooks/
│   └── useIrrigationEvents.ts       # Data-fetch hook; bridges API layer → component state
├── utils/
│   └── zoneColors.ts                # Deterministic deviceId → color mapping
├── types/
│   └── irrigationEvent.ts           # TypeScript types for API DTO and internal models
├── App.tsx                          # Root component; mounts IrrigationCalendar
└── main.tsx                         # Vite entry point; React root
```

Tests (co-located with source, `.test.ts` suffix):

```text
src/api/irrigationEventsApi.test.ts
src/utils/zoneColors.test.ts
src/hooks/useIrrigationEvents.test.ts
```

**Structure Decision**: Single-project SPA layout. All source under `src/`. API communication isolated in `src/api/` per Principle II. Business logic (color mapping, event DTO → FullCalendar event transformation) isolated in `src/utils/`. React components in `src/components/` with zero direct Axios calls.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| FullCalendar (new dependency beyond constitution-mandated core stack) | Provides a time-grid calendar with simultaneous-event column layout, full 24-hour vertical scroll, day/week view switching, and mobile-responsive rendering — all required by the spec | Building a compliant time-grid from scratch requires ~1000+ lines of complex positional logic (column layout for overlapping events, scroll management, view transitions, touch support); this directly violates Principle I (Simplicity First). FullCalendar does not duplicate Axios, Tailwind, or any other adopted tool |
