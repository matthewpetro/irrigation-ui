# Contract: Container Image & CI Workflow Interface

This documents the external interface this feature exposes — what a user of the Dockerfile or consumer of the published image can rely on. It is not code; the implementation (Dockerfile, `nginx.conf`, workflow YAML) is created during `/speckit-tasks` + implementation.

## Docker Image Interface

| Aspect | Contract |
|---|---|
| Build command | `docker build -t irrigation-ui .` from the repo root — no other flags required to produce a runnable image (FR-004) |
| Exposed port | `8080` (unprivileged nginx listen port, so the container can run as a non-root user) |
| Run command | `docker run -p 8080:8080 irrigation-ui`, then the app is reachable at `http://localhost:8080` |
| Routing behavior | Any path (e.g. `http://localhost:8080/some/deep/link`) MUST return the app shell (`index.html`), not a 404 (FR-003) |
| Environment/build args | None required. Optional: `--build-arg VITE_API_BASE_URL=<url>` may be added by the builder to override the API endpoint baked in at build time (existing Vite mechanism — see research.md §3) |
| Image tags (published) | `ghcr.io/<owner>/irrigation-ui:latest`, `ghcr.io/<owner>/irrigation-ui:sha-<shortsha>` |
| Platforms (published) | `linux/amd64`, `linux/arm64` under the same tag (FR-014) |
| Visibility (published) | Public — `docker pull ghcr.io/<owner>/irrigation-ui:latest` MUST succeed with no authentication (FR-012) |

## GitHub Actions Workflow Interface

| Aspect | Contract |
|---|---|
| Triggers | `push` to `main`; `pull_request` targeting `main` |
| Push to `main` behavior | Build multi-arch image → publish to ghcr.io under `latest` + `sha-<shortsha>` tags (FR-005, FR-006, FR-007) |
| Pull request behavior | Build multi-arch image only — no push/publish, no registry authentication attempted (FR-013) |
| Required permissions | `packages: write`, `contents: read` (via the run's built-in `GITHUB_TOKEN` — FR-009) |
| Failure behavior | Any build failure MUST fail the workflow run visibly in the GitHub Actions UI and MUST NOT publish any image (FR-008) |
| Required repository setup (one-time, manual) | Package visibility for `irrigation-ui` on ghcr.io must be set to Public after the first successful publish (see research.md §6; documented step-by-step in quickstart.md) |
