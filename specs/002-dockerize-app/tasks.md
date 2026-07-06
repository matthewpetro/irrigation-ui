---

description: "Task list template for feature implementation"
---

# Tasks: Dockerize Application & Automated Image Publishing

**Input**: Design documents from `specs/002-dockerize-app/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/container-interface.md](./contracts/container-interface.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks are included — this feature adds no application source code (Constitution Principle III applies to non-UI application logic, of which there is none here). Correctness is instead verified via the manual/CI validation steps in `quickstart.md`, referenced directly as tasks below.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single project, infrastructure-only change: all new files live at the repository root and under `.github/workflows/`. No changes to `src/` (see plan.md → Project Structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal shared prerequisite for the Docker build

- [X] T001 [P] Create `.dockerignore` at repo root excluding `node_modules`, `dist`, `.git`, `.env*`, `coverage/`, and other non-build files, so the Docker build context stays small (supports FR-004)

---

## Phase 2: Foundational (Blocking Prerequisites)

*No dedicated foundational tasks.* Setup (Phase 1) is the only prerequisite shared across stories. User Story 2 depends directly on User Story 1's `Dockerfile` (see User Story Dependencies below) rather than on a separate foundational phase.

---

## Phase 3: User Story 1 - Consistent, Portable Build (Priority: P1) 🎯 MVP

**Goal**: A single self-contained Docker image that builds the app and serves it via a lightweight web server, with no host tooling beyond a container engine.

**Independent Test**: `docker build -t irrigation-ui .` then `docker run -p 8080:8080 irrigation-ui`; confirm the app loads at `http://localhost:8080` and a direct deep-link path also loads the app instead of a 404.

### Implementation for User Story 1

- [X] T002 [P] [US1] Create multi-stage `Dockerfile` at repo root: build stage `FROM node:24-alpine`, `npm ci`, `npm run build`; runtime stage `FROM nginx:alpine` copying `dist/` output and `nginx.conf`, `EXPOSE 8080` (FR-001, FR-002, FR-004)
- [X] T003 [P] [US1] Create `nginx.conf` at repo root: listen on port `8080` (unprivileged), serve `/usr/share/nginx/html`, and add `try_files $uri /index.html;` SPA fallback for unknown paths (FR-002, FR-003)
- [X] T004 [US1] Validate User Story 1 end-to-end per [quickstart.md](./quickstart.md) Step 1 — build the image, run it, confirm the app loads and a deep-link path does not 404 (depends on T002, T003)
- [X] T005 [P] [US1] Validate multi-arch buildability of the Dockerfile per [quickstart.md](./quickstart.md) Step 2 (`docker buildx build --platform linux/amd64,linux/arm64 ...`) (depends on T002, T003)

**Checkpoint**: User Story 1 is fully functional and testable independently — the app can be built and run from Docker alone.

---

## Phase 4: User Story 2 - Automated Image Publishing on Main (Priority: P2)

**Goal**: A GitHub Actions workflow that builds a multi-arch image on every push to `main` and publishes it to `ghcr.io`, and runs a build-only validation on pull requests, without ever publishing a broken image.

**Independent Test**: Open a PR targeting `main` (build-only check runs, nothing published); merge to `main` and confirm a new `latest` + `sha-<shortsha>` tagged image appears in the repo's ghcr.io packages within ~10 minutes, with no manual steps.

### Implementation for User Story 2

- [X] T006 [US2] Create `.github/workflows/docker-publish.yml` with triggers `push` (branches: `main`) and `pull_request` (branches: `main`), job-level `permissions: contents: read, packages: write`, and a checkout step (FR-005, FR-009, FR-013)
- [X] T007 [US2] Add `docker/setup-qemu-action` and `docker/setup-buildx-action` steps to the job in `.github/workflows/docker-publish.yml` (depends on T006)
- [X] T008 [US2] Add a `docker/metadata-action` step to `.github/workflows/docker-publish.yml` computing `latest` and `sha-<shortsha>` tags for `ghcr.io/<owner>/irrigation-ui` (FR-007) (depends on T006)
- [X] T009 [US2] Add a `docker/login-action` step to `.github/workflows/docker-publish.yml` authenticating to `ghcr.io` with the built-in `GITHUB_TOKEN`, conditioned to run only on the `push` event (FR-009, FR-013) (depends on T006)
- [X] T010 [US2] Add a `docker/build-push-action` step to `.github/workflows/docker-publish.yml` building from the root `Dockerfile` for `linux/amd64,linux/arm64`, using the tags from T008, with `push` true only on `push`-to-`main` events and false for `pull_request` events (FR-006, FR-008, FR-011, FR-013, FR-014) (depends on T007, T008, T009, and Dockerfile from T002)
- [X] T011 [US2] Validate User Story 2 end-to-end per [quickstart.md](./quickstart.md) Step 3 — open a PR (confirm build-only check, no publish), merge to `main` (confirm image published), then intentionally break a throwaway build to confirm the workflow fails visibly and does not publish (FR-008) (depends on T010)

**Checkpoint**: User Stories 1 AND 2 both work independently — pushes to `main` now produce a published, pullable image automatically.

---

## Phase 5: User Story 3 - Traceable Image Versions (Priority: P3)

**Goal**: Confirm published images can always be traced back to their source commit, and that prior versions remain retrievable.

**Independent Test**: After at least two merges to `main`, inspect the ghcr.io package page and confirm each image tag maps to a specific commit and that older `sha-*` tags remain pullable after `latest` moves.

### Implementation for User Story 3

- [X] T012 [P] [US3] Validate User Story 3 per [quickstart.md](./quickstart.md) Step 3, item 3 — confirm the ghcr.io package page lists multiple `sha-<shortsha>` tags, `latest` points at the newest, and the older tag remains pullable (FR-007, FR-010) (depends on T011 having published at least once)

**Checkpoint**: All three user stories are independently functional — the tagging scheme built in User Story 2 is confirmed traceable and non-destructive over multiple releases.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: One-time repository setup and final end-to-end verification

- [X] T013 Set the `irrigation-ui` ghcr.io package visibility to Public (one-time, after the first successful publish from T011), per [quickstart.md](./quickstart.md) Step 4 (FR-012) (depends on T011)
- [X] T014 Run the complete [quickstart.md](./quickstart.md) guide end-to-end as final verification that all functional requirements and success criteria (SC-001 through SC-005) are met (depends on T004, T005, T011, T012, T013)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Empty for this feature — no tasks block on it
- **User Story 1 (Phase 3)**: Depends on Setup (T001) for `.dockerignore`; otherwise no dependencies
- **User Story 2 (Phase 4)**: Depends on User Story 1's `Dockerfile` (T002) existing to build against
- **User Story 3 (Phase 5)**: Depends on User Story 2 (T011) having published at least once to validate against
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1) — no dependencies on other stories
- **User Story 2 (P2)**: Requires User Story 1's `Dockerfile` to exist (the workflow builds it) — not independently buildable before US1
- **User Story 3 (P3)**: Requires User Story 2's tagging mechanism to exist and to have run at least twice — purely a validation story, no new code

### Parallel Opportunities

- T002 and T003 (Dockerfile, nginx.conf) can be written in parallel — different files
- T004 and T005 (local run validation, multi-arch build validation) can run in parallel once T002/T003 are done
- T006–T010 all edit the same workflow file and must be done sequentially, in order
- T012 (US3 validation) can run in parallel with T013 (visibility setup) once T011 is done

---

## Parallel Example: User Story 1

```bash
# Launch both User Story 1 file-creation tasks together:
Task: "Create multi-stage Dockerfile at repo root"
Task: "Create nginx.conf at repo root with SPA fallback"

# Once both exist, launch both validation tasks together:
Task: "Validate local build+run per quickstart.md Step 1"
Task: "Validate multi-arch buildability per quickstart.md Step 2"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 3: User Story 1 (T002–T005)
3. **STOP and VALIDATE**: Confirm the app builds and runs from Docker alone
4. This is a usable MVP — anyone can now build and run the app in a container, even without the CI automation

### Incremental Delivery

1. Setup → User Story 1 → validate → usable MVP (manual `docker build`/`docker run`)
2. Add User Story 2 → validate → automated publishing to ghcr.io on every merge to `main`
3. Add User Story 3 → validate → confirmed traceability/retention across releases
4. Polish → one-time public-visibility setup, full quickstart re-run

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test-framework tasks are included; validation is via `quickstart.md` steps run directly against the built Dockerfile/workflow, per the Tests note above
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- T006–T010 intentionally share one file (`.github/workflows/docker-publish.yml`) and are NOT marked `[P]`
