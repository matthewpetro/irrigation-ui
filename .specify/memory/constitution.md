<!--
Sync Impact Report
==================
Version change: [TEMPLATE] → 1.0.0
Rationale: Initial ratification of the project constitution. All placeholder
tokens replaced with concrete principles derived from project requirements
(React/Vite/TypeScript SPA, Tailwind, Axios, REST backend, mobile-first,
simplicity, separation of concerns, Vitest testing).

Modified principles: N/A (initial creation)

Added sections:
- I. Simplicity First
- II. Separation of Concerns
- III. Testability & Test Coverage for Logic
- IV. Technology Stack Discipline
- V. Responsive, Mobile-First UI
- VI. API-Driven Data Access
- Additional Constraints (Technology Stack Requirements)
- Development Workflow (Quality Gates)
- Governance

Removed sections: N/A (initial creation; all placeholders resolved)

Templates requiring updates:
- ✅ .specify/templates/plan-template.md — generic, Constitution Check gate
  references this file directly; no edits required.
- ✅ .specify/templates/spec-template.md — technology-agnostic; no edits
  required.
- ✅ .specify/templates/tasks-template.md — generic path conventions remain
  compatible with a single-project frontend layout; no edits required.
- ✅ .claude/skills/speckit-constitution — this file (no agent-specific
  references requiring change).

Follow-up TODOs: None. Ratification date set to the date this constitution
was first adopted.
-->

# New Irrigation UI Constitution

## Core Principles

### I. Simplicity First

The simplest solution that satisfies the requirement MUST be preferred over a
more general, flexible, or "clever" one. Code MUST be simple and readable
over being fancy or complicated. Do not introduce abstractions, patterns, or
configuration options for hypothetical future needs (YAGNI). Inline
documentation comments MUST be added only where code does something
non-obvious (a hidden constraint, a workaround, a subtle invariant); code
that is self-explanatory through naming and structure MUST NOT be commented.

**Rationale**: Simplicity keeps the codebase approachable, reduces the
surface area for bugs, and keeps review and onboarding costs low for a
single-purpose SPA.

### II. Separation of Concerns

React components MUST be strictly focused on presentation and UI-related
functionality (rendering, user interaction, local view state). REST API
communication and business logic MUST NOT live inside components; they MUST
be implemented in dedicated, non-UI code modules (e.g., services/hooks that
wrap API and logic, imported by components). Components MAY call into these
modules but MUST NOT contain axios calls, data transformation, or business
rules directly.

**Rationale**: Isolating business logic and API access from presentation
keeps components simple, makes logic independently testable, and prevents UI
changes from risking data-handling correctness.

### III. Testability & Test Coverage for Logic

Non-UI code (services, API clients, business logic, utilities) MUST be
structured so it is easily unit-testable in isolation from React rendering.
Tests for this code MUST be written using the Vitest framework. Every new or
modified unit of business logic or API-communication code MUST have
accompanying Vitest tests covering its primary behavior and key edge cases.

**Rationale**: Concentrating logic outside components (Principle II) only
pays off if that logic is verified by fast, reliable unit tests; Vitest is
the project's standard test runner for consistency.

### IV. Technology Stack Discipline

The project MUST use: Vite as the build tool, TypeScript for all source
code, React with functional components (no class components), Axios for
REST API communication, and Tailwind CSS for styling. New dependencies that
duplicate the responsibility of an already-adopted tool (e.g., an
alternative HTTP client, CSS framework, or state-management library) MUST
NOT be introduced without an explicit, documented justification in the
relevant plan's Complexity Tracking section.

**Rationale**: A fixed, minimal stack avoids fragmentation, keeps the
simplicity principle enforceable, and ensures contributors share the same
mental model of the codebase.

### V. Responsive, Mobile-First UI

All UI MUST be designed and implemented mobile-first: base styles target
small screens, with Tailwind responsive utilities (`sm:`, `md:`, `lg:`,
`xl:`) used to progressively enhance the layout for larger viewports up to
desktop. A UI change MUST NOT be considered complete until it has been
verified to render correctly at both mobile and desktop breakpoints.

**Rationale**: Mobile-first ensures the smallest, most constrained
experience is never an afterthought, while Tailwind's utility scale makes
scaling up to desktop straightforward.

### VI. API-Driven Data Access

All application data MUST be retrieved from and persisted to the backend
REST API; the UI MUST NOT embed mock data, local databases, or alternate
data sources as a substitute for the API in production code paths. All
REST communication MUST go through the Axios-based API layer defined under
Principle II, never directly from components.

**Rationale**: A single, well-defined data-access boundary keeps the
frontend a pure client of the backend, simplifying reasoning about state and
enabling backend changes without UI-wide ripple effects.

## Additional Constraints

- **Language**: TypeScript only; no plain JavaScript source files in
  `src/`.
- **Components**: Functional components with hooks only; no class
  components, no legacy lifecycle-method patterns.
- **Styling**: Tailwind CSS utility classes are the default styling
  mechanism; avoid hand-written CSS files or CSS-in-JS libraries unless a
  concrete Tailwind limitation is documented.
- **HTTP**: Axios is the sole HTTP client; a single shared Axios
  instance/config MUST be used for all API calls rather than ad-hoc
  instantiation per call site.
- **Testing tool**: Vitest is the sole test runner for unit and logic
  tests.

## Development Workflow

- Any pull request introducing or modifying business logic or API
  communication code MUST include or update corresponding Vitest tests.
- Reviewers MUST verify that new/changed React components contain only
  presentation concerns, with data-fetching and business logic delegated to
  non-UI modules.
- Reviewers MUST verify new UI renders correctly at a mobile breakpoint
  before a desktop one, consistent with the mobile-first approach.
- Complexity that appears to violate Simplicity First (Principle I) MUST be
  explicitly justified in the feature's plan (Complexity Tracking section)
  before merging.

## Governance

This constitution supersedes all other project practices and informal
conventions. Amendments require:

1. A documented proposal describing the change and its rationale.
2. Update of this file, including the Sync Impact Report header comment.
3. Propagation review of dependent templates
   (`.specify/templates/plan-template.md`, `spec-template.md`,
   `tasks-template.md`) and any agent guidance files to ensure they remain
   consistent with the amended principles.
4. A version bump following semantic versioning:
   - **MAJOR**: Backward-incompatible governance changes or removal/
     redefinition of a principle.
   - **MINOR**: Addition of a new principle or materially expanded
     guidance.
   - **PATCH**: Clarifications, wording fixes, or non-semantic
     refinements.

All feature plans and PR reviews MUST verify compliance with these
principles; unresolved deviations MUST be tracked in the plan's Complexity
Tracking section until resolved or explicitly accepted.

**Version**: 1.0.0 | **Ratified**: 2026-07-04 | **Last Amended**: 2026-07-04
