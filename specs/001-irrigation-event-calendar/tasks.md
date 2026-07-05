# Tasks: Irrigation Event Calendar

**Input**: Design documents from `specs/001-irrigation-event-calendar/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api-contract.md ✅

**Tests**: Vitest unit tests are required per constitution Principle III for all API communication and business logic modules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1–US4, maps to spec.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Vite/React/TypeScript project and install all required dependencies.

- [ ] T001 Initialize Vite React TypeScript project in repo root: `npm create vite@latest . -- --template react-ts` and verify `npm run dev` starts
- [ ] T002 Install and configure Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`, run `npx tailwindcss init -p`, configure `tailwind.config.ts` content paths, add Tailwind directives to `src/index.css`
- [ ] T003 [P] Install and configure Vitest with jsdom and React Testing Library: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event`, create `vitest.config.ts` with jsdom environment, add `"test": "vitest"` script to `package.json`
- [ ] T004 [P] Install Axios: `npm install axios`, verify import resolves in TypeScript
- [ ] T005 [P] Install FullCalendar packages: `npm install @fullcalendar/react @fullcalendar/timegrid @fullcalendar/core`
- [ ] T006 Create `src/env.d.ts` declaring `VITE_API_BASE_URL` on `ImportMetaEnv` and create `.env.example` with `VITE_API_BASE_URL=http://localhost:3000`; add `.env.local` to `.gitignore`
- [ ] T007 Remove Vite boilerplate: delete `src/App.css`, `src/assets/`, clear `src/App.tsx` and `src/index.css` body content (keep Tailwind directives in `index.css`)

**Checkpoint**: `npm run dev` starts; `npm test` runs (zero tests, exits cleanly); Tailwind classes render in browser.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, utilities, API layer, and data hook that all user story components depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T008 Define TypeScript types in `src/types/irrigationEvent.ts`: `IrrigationWarning` union type (3 enum string values from API), `IrrigationEventDto` interface (all optional/required fields per API spec), `CalendarEventProps` interface (FullCalendar event shape with extendedProps), `IrrigationEventsQueryParams` interface — see `data-model.md`
- [ ] T009 [P] Create zone color utility in `src/utils/zoneColors.ts`: define `ZONE_COLOR_PALETTE` (8 colors from `data-model.md`), export `getZoneColor(deviceId: number): string` using `(deviceId - 1) % palette.length`
- [ ] T010 [P] Write Vitest unit tests in `src/utils/zoneColors.test.ts`: test deterministic color assignment for deviceId 1–8, palette wrap-around for deviceId 9+, and stability (same deviceId always same color)
- [ ] T011 Create event mapper utility in `src/utils/irrigationEventMapper.ts`: export `toCalendarEvents(dtos: IrrigationEventDto[], viewDate: Date): CalendarEventProps[]` implementing all 5 mapping cases from `data-model.md` (both timestamps, currentlyOn, OFF missing + unknown, ON missing, neither timestamp); timestamps passed through unclipped (actual values from DTO); zone color via `getZoneColor`; classNames set per warning/active state
- [ ] T012 Write Vitest unit tests in `src/utils/irrigationEventMapper.test.ts`: one test per mapping case from `data-model.md` (both timestamps present, currentlyOn=true, warning OFF+unknown, warning ON missing, neither timestamp); assert `start`/`end`/`allDay`/`classNames`/`backgroundColor` for each case; verify timestamps are NOT clipped to any window boundary
- [ ] T013 Create shared Axios instance in `src/api/axiosInstance.ts`: `axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000' })`; export as default singleton
- [ ] T014 Create API client in `src/api/irrigationEventsApi.ts`: export `getEvents(params: IrrigationEventsQueryParams): Promise<IrrigationEventDto[]>` using the shared Axios instance; GET `/irrigation-events` with startTimestamp/endTimestamp query params; return typed array
- [ ] T015 Write Vitest unit tests in `src/api/irrigationEventsApi.test.ts`: mock Axios instance; assert correct endpoint called with correct params; assert typed response returned; assert error propagated on non-2xx
- [ ] T016 Create `useIrrigationEvents` hook in `src/hooks/useIrrigationEvents.ts`: accepts `{ start: Date; end: Date }`; returns `{ events: CalendarEventProps[]; loading: boolean; error: string | null }`; calls `getEvents`, maps through `toCalendarEvents`, sets state; re-fetches when start/end change; catches errors and sets error state
- [ ] T017 Write Vitest unit tests in `src/hooks/useIrrigationEvents.test.ts`: use `renderHook` from `@testing-library/react`; mock `irrigationEventsApi`; test: initial loading=true, success state with mapped events, error state on API failure, re-fetch when date range changes
- [ ] T018 Run `npm test` and confirm all Vitest tests pass before proceeding

**Checkpoint**: All unit tests pass. The API layer, event mapper, and hook are fully tested and ready for integration.

---

## Phase 3: User Stories 1 & 3 — View Daily Irrigation History + Navigation (P1) 🎯 MVP

**Goal**: A working day view calendar that displays today's events as time blocks with zone names and colors, proper loading/error/warning states, and prev/next/today navigation.

**Independent Test**: Open the app; navigate to a day with known irrigation activity; confirm events appear as colored time blocks with zone names; confirm prev/next/today controls navigate correctly. Validate quickstart.md scenarios S1–S6, S8–S9.

- [ ] T019 [US1] Create `src/components/IrrigationCalendar.tsx` shell: import FullCalendar with `timeGridPlugin`; configure `initialView="timeGridDay"`, `slotMinTime="00:00:00"`, `slotMaxTime="24:00:00"`, `allDaySlot={true}`, `height="100%"`, `datesSet` callback that extracts `start`/`end` from FullCalendar's `DatesSetArg` and stores them in local state to trigger the data hook
- [ ] T020 [US1][US3] Add FullCalendar `headerToolbar` in `IrrigationCalendar.tsx`: `left: "prev,next today"`, `center: "title"`, `right: ""` (view switcher added in Phase 4); `titleFormat` set to show single day name + date for day view
- [ ] T021 [US1] Connect `useIrrigationEvents` hook in `IrrigationCalendar.tsx`: pass `events` array to FullCalendar `events` prop; show a full-width loading banner (`"Loading..."` or spinner) when `loading` is true, positioned above the calendar grid using Tailwind (`relative`/`absolute` overlay or conditional render)
- [ ] T022 [US1] Configure FullCalendar event display in `IrrigationCalendar.tsx`: use `eventColor` to apply zone color (each event in `CalendarEventProps` carries `backgroundColor`); FullCalendar reads per-event `backgroundColor` and `borderColor` automatically from event objects; verify zone name appears as event title label
- [ ] T023 [US1] Add CSS for warning and active event visual states in `src/index.css`: `.event-warning` rule adds a dashed white border and reduced opacity; `.event-active` rule adds a subtle pulse animation (`@keyframes pulse`) to indicate zone is currently running; these classes are applied via FullCalendar's `eventClassNames` property using the `classNames` field on `CalendarEventProps`
- [ ] T024 [US1] Add error display in `IrrigationCalendar.tsx`: when `error` is non-null, render a Tailwind-styled alert banner (red background, white text) above the calendar with the message "Unable to load irrigation data"; grid remains visible below the banner (FR-014)
- [ ] T025 [US1] Mount `IrrigationCalendar` in `src/App.tsx`: render a full-viewport-height container (`h-screen flex flex-col overflow-hidden`) with `IrrigationCalendar` filling the remaining space; no horizontal overflow on mobile (SC-003)
- [ ] T026 [US1][US3] Manually validate quickstart.md S1 (default state), S2 (event blocks), S3 (simultaneous zones), S4 (currently active zone), S6 (day navigation), S8 (mobile layout), S9 (API error handling), S10 (empty day), S11 (event spanning query boundary)

**Checkpoint**: Day view fully functional. Events display with correct colors, labels, and warning states. Navigation works. Loading and error states display correctly. Passes all S1–S6, S8–S11 scenarios.

---

## Phase 4: User Stories 2 & 4 — Week View + View Switching (P2)

**Goal**: Add a 7-day week view and a Day/Week view toggle. The same events appear correctly in both views; switching preserves the current date context.

**Independent Test**: Click the Week button; confirm a 7-column Sun–Sat grid appears with events in correct day columns; click Day to return to the day that was visible before switching. Validate quickstart.md S7 (week view) and S4 (view switching).

- [ ] T027 [US2][US4] Import `timeGridPlugin` already handles both day and week views — confirm `@fullcalendar/timegrid` exposes `timeGridWeek`; no additional package install needed
- [ ] T028 [US2][US4] Update FullCalendar `headerToolbar` in `IrrigationCalendar.tsx`: add `right: "timeGridDay,timeGridWeek"` to render Day/Week toggle buttons; FullCalendar manages view switching and preserves date context automatically
- [ ] T029 [US2] Configure week view in `IrrigationCalendar.tsx`: set `firstDay={0}` (Sunday start per spec assumption) and `views={{ timeGridWeek: { titleFormat: { month: 'short', day: 'numeric', year: 'numeric' } } }}` for a readable week range label
- [ ] T030 [US4] Verify date context is preserved on view switch: FullCalendar natively preserves the active date when switching between `timeGridDay` and `timeGridWeek`; confirm in browser that clicking Week then Day returns to the same day; if FullCalendar doesn't preserve context automatically, store `activeDate` in state and pass as `initialDate` on re-render
- [ ] T031 [US2][US4] Manually validate quickstart.md S7 (week view events) and verify view toggle (Day ↔ Week) preserves date context per quickstart.md S4 definition

**Checkpoint**: Week view shows 7-day grid with correct events. Day/Week toggle works. Switching views returns to the same date. All quickstart scenarios S1–S11 pass.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, mobile verification, and any cross-cutting cleanup.

- [ ] T032 [P] Run full Vitest test suite (`npm test`) and confirm all tests still pass after Phase 3 and 4 changes
- [ ] T033 [P] Verify mobile layout: open Chrome DevTools → device toolbar → iPhone 14 (390×844); confirm no horizontal scrolling of page chrome; confirm calendar grid scrolls vertically; confirm event labels readable (SC-003)
- [ ] T034 Run complete quickstart.md validation: execute all scenarios S1–S11 against the running app; document any deviations
- [ ] T035 [P] Verify zone color consistency: navigate across multiple days and confirm the same zone (`deviceId`) always shows the same color in both day and week views (FR-017, SC-006)
- [ ] T036 [P] Verify simultaneous zone rendering: navigate to a day where two zones ran at the same time; confirm both event blocks are visible without one obscuring the other (FR-015, SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user story phases
- **Phase 3 (US1+US3)**: Depends on Phase 2 — can start immediately after
- **Phase 4 (US2+US4)**: Depends on Phase 3 — adds to IrrigationCalendar.tsx built in Phase 3
- **Polish (Phase 5)**: Depends on Phase 4 completion

### Within Phase 2 (dependency order)

```
T008 (types) → T009, T013 (parallel, both depend on T008)
T009 → T010 (color tests)
T009 + T008 → T011 (mapper, depends on types + colors)
T011 → T012 (mapper tests)
T008 + T013 → T014 (API client, depends on types + axios instance)
T014 → T015 (API tests)
T011 + T014 → T016 (hook, depends on mapper + API)
T016 → T017 (hook tests)
T015 + T017 → T018 (verify all pass)
```

### Within Phase 3 (dependency order)

```
T019 (calendar shell) → T020 (toolbar) → T021 (hook wire) → T022 (colors) → T023 (CSS) → T024 (errors) → T025 (App mount) → T026 (validation)
```

---

## Parallel Opportunities

### Phase 1

```
T003 (Vitest setup)
T004 (Axios install)       ← all parallel after T001+T002
T005 (FullCalendar install)
T006 (env config)
```

### Phase 2

```
T009 (zoneColors.ts) + T010 (zoneColors test)   ← parallel after T008
T013 (axiosInstance.ts)                          ← parallel after T001
```

### Phase 5

```
T032 (tests) + T033 (mobile) + T035 (colors) + T036 (simultaneous) ← all parallel
```

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + 3 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (all tests green)
3. Complete Phase 3: Day view + navigation
4. **STOP and VALIDATE**: Run quickstart.md S1–S6, S8–S11
5. Day view is fully usable as MVP — the homeowner can review today's irrigation history

### Incremental Delivery

1. Phase 1 + 2 → Foundation with full test coverage
2. Phase 3 → MVP: day view fully functional (US1 + US3)
3. Phase 4 → Enhancement: week view + view switching (US2 + US4)
4. Phase 5 → Final validation pass

---

## Notes

- `[P]` tasks target different files with no shared incomplete dependencies
- `[US1]`–`[US4]` labels map to user stories in `specs/001-irrigation-event-calendar/spec.md`
- Tests are required per constitution Principle III for all non-UI modules (API client, mapper, colors utility, hook)
- Commit after each phase checkpoint at minimum
- Event timestamps are never clipped to the query window — the mapper passes actual DTO timestamps to FullCalendar (see `data-model.md` mapping rules note)
- The FullCalendar `datesSet` callback fires after every view change and navigation, making it the correct trigger point for re-fetching events
