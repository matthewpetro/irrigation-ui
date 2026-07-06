# Implementation Plan: Dockerize Application & Automated Image Publishing

**Branch**: `002-dockerize-app` | **Date**: 2026-07-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-dockerize-app/spec.md`

## Summary

Package the existing React/Vite SPA into a self-contained, multi-stage Docker image: a `node:24-alpine` (current Node.js Active LTS) stage runs the existing `npm run build`, and an `nginx:alpine` runtime stage serves the resulting static files (with SPA-fallback routing) on port 8080. A single GitHub Actions workflow builds this image on every pull request targeting `main` (validation only) and, on every push to `main`, builds a multi-architecture (`linux/amd64` + `linux/arm64`) image and publishes it to `ghcr.io` tagged with `latest` and the commit SHA, using the workflow's built-in `GITHUB_TOKEN` — no new secrets or application code changes required.

## Technical Context

**Language/Version**: Dockerfile (multi-stage) + GitHub Actions workflow YAML; wraps the existing TypeScript 5.x / Vite 6 application unchanged

**Primary Dependencies**: `node:24-alpine` (Active LTS, build stage), `nginx:alpine` (runtime stage), `docker/setup-qemu-action`, `docker/setup-buildx-action`, `docker/login-action`, `docker/metadata-action`, `docker/build-push-action` (GitHub Actions marketplace actions)

**Storage**: N/A — no persisted data; image layers and registry storage are managed by ghcr.io

**Testing**: Manual/CI validation per [quickstart.md](./quickstart.md) (local build+run smoke test, multi-arch build check, PR-triggered validation build); no new Vitest surface since no application source code changes

**Target Platform**: Linux containers (`linux/amd64`, `linux/arm64`) run via any container engine; built and published from GitHub-hosted `ubuntu-latest` Actions runners to `ghcr.io`

**Project Type**: Single-page web application (unchanged) + CI/CD and containerization infrastructure addition

**Performance Goals**: New image available in the registry within 10 minutes of a successful main-branch merge (SC-002); local build-to-running in under 5 minutes (SC-001)

**Constraints**: Final image must contain no build tools/language runtimes (FR-004); published image must be publicly pullable with no authentication (FR-012); no manually-managed registry credentials (FR-009); prior published tags must never be deleted/overwritten (FR-010)

**Scale/Scope**: One Dockerfile, one `nginx.conf`, one GitHub Actions workflow file; no changes to `src/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Standard two-stage Dockerfile + official `nginx:alpine` image + off-the-shelf `docker/*` GitHub Actions; no custom scripts or bespoke tooling introduced (see research.md) |
| II. Separation of Concerns | ✅ N/A | No React component or application logic changes; this feature is entirely deployment/CI infrastructure outside `src/` |
| III. Testability & Test Coverage for Logic | ✅ N/A | No new non-UI application logic is introduced, so no new Vitest coverage is required; correctness is instead validated via the manual/CI steps in quickstart.md |
| IV. Technology Stack Discipline | ✅ PASS | No new `package.json` dependency is added; `nginx` exists only in the container runtime stage, never as a project source dependency |
| V. Responsive, Mobile-First UI | ✅ N/A | No UI changes |
| VI. API-Driven Data Access | ✅ PASS | The existing build-time `VITE_API_BASE_URL` mechanism is reused unchanged (research.md §3); no mock data or new data-access path introduced |

*Post-Phase 1 re-check: Design artifacts (research.md, data-model.md, contracts/, quickstart.md) introduce no new dependencies or code paths beyond what's assessed above — all gates still pass with no violations to justify.*

## Project Structure

### Documentation (this feature)

```text
specs/002-dockerize-app/
├── plan.md              # This file
├── research.md          # Phase 0: web server, build strategy, multi-arch, tagging, visibility decisions
├── data-model.md        # Phase 1: Container Image / Pipeline Run / Registry concepts
├── quickstart.md        # Phase 1: local build/run and CI validation guide
├── contracts/
│   └── container-interface.md   # Phase 1: Docker image + workflow interface contract
└── tasks.md             # Phase 2 output (/speckit-tasks — not this command)
```

### Source Code (repository root)

```text
Dockerfile              # Multi-stage: node:24-alpine build → nginx:alpine runtime
.dockerignore           # Excludes node_modules, dist, .git, etc. from build context
nginx.conf              # SPA-fallback static file serving config, listens on 8080
.github/
└── workflows/
    └── docker-publish.yml   # Build on PR (validation only); build+push multi-arch on main
```

**Structure Decision**: Existing single-project SPA layout (`src/`, `package.json`, `vite.config.ts`, etc.) is unchanged. This feature only adds deployment/CI files at the repository root and under `.github/workflows/` — no new or modified files under `src/`.

## Complexity Tracking

*No Constitution Check violations — this section is intentionally empty.*
