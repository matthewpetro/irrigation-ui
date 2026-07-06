# Research: Dockerize Application & Automated Image Publishing

## 1. In-container web server for serving the built SPA

**Decision**: `nginx:alpine` as the runtime-stage base image, with a minimal custom `nginx.conf` that serves `/usr/share/nginx/html` and falls back unknown paths to `index.html` (SPA routing support).

**Rationale**:
- Alpine-based nginx image is ~40MB, starts in milliseconds, and has no runtime dependency beyond the binary itself — matches Constitution Principle I (Simplicity First) better than options requiring a language runtime in the final image.
- nginx has first-class, well-documented multi-arch (`linux/amd64`, `linux/arm64`) official images, satisfying the multi-architecture clarification with zero extra tooling.
- SPA fallback is a single `try_files $uri /index.html;` directive — no custom code to write or test.
- It's the de facto standard for serving static SPA builds in containers, so any future maintainer already knows how to operate it.

**Alternatives considered**:
- **Caddy**: Also simple and multi-arch, with automatic gzip/HTTP2. Rejected only because it adds a less-universally-known config format for marginal benefit over nginx for a purely static-file use case.
- **`serve` (npm package) on a `node:alpine` runtime stage**: Keeps the whole image in one ecosystem (Node), but requires shipping a full Node runtime into production just to serve static files — heavier image, and violates Simplicity First by keeping an unnecessary language runtime in the serving layer.
- **`static-web-server` / BusyBox `httpd`**: Smaller still, but far less familiar to future maintainers and less documented for SPA fallback and multi-arch builds; not worth the marginal size savings over nginx:alpine.

## 2. Multi-stage Dockerfile build strategy

**Decision**: Two-stage Dockerfile — a `node:24-alpine` (current Node.js Active LTS) **build** stage that runs `npm ci` and `npm run build` (the project's existing `tsc -b && vite build`), followed by a `nginx:alpine` **runtime** stage that copies only the `dist/` output from the build stage.

**Rationale**:
- Matches the user's explicit requirement ("run the build inside the container") while keeping the final image free of Node, npm, and `node_modules` — smaller image, smaller attack surface.
- Uses the project's existing, unmodified `npm run build` script — no new build tooling introduced (Constitution Principle IV).
- `npm ci` (not `npm install`) ensures reproducible builds from `package-lock.json`, consistent with treating the lockfile as the source of truth.
- Node.js 24 ("Krypton") is the current **Active LTS** release: it entered LTS 2025-10-28, stays Active LTS until 2026-10-20, then Maintenance LTS until EOL 2028-04-30 — confirmed via nodejs.org's release schedule and endoflife.date as of this research (2026-07-05). Node 22 ("Jod") moved to Maintenance LTS on 2025-10-21 (EOL 2027-04-30) and Node 20 reached end-of-life 2026-04-30, so neither is the right pick for a new image today. Node 26 is `Current` (not yet LTS until 2026-10-28) and is intentionally avoided for a production build stage until it becomes LTS.
- The unpinned `node:24-alpine` tag (rather than a specific `node:24-alpineX.YY` variant) tracks whichever Alpine base the Node.js Docker image maintainers currently build against, picking up Alpine security patches automatically on rebuild — the standard, low-maintenance choice for a base image that's rebuilt on every CI run rather than pinned once and forgotten.

**Sources**:
- [Node.js — Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [Node.js — End-Of-Life](https://nodejs.org/en/about/eol)
- [Node.js | endoflife.date](https://endoflife.date/nodejs)
- [node - Official Image | Docker Hub](https://hub.docker.com/_/node)

**Alternatives considered**:
- **Single-stage Node image serving via `vite preview`**: Rejected — `vite preview` is documented as a preview tool, not a production server, and would keep the entire Node toolchain in the production image.
- **Building outside the container in CI, then copying artifacts in**: Rejected — the user explicitly asked for the build to run inside the container, so the image remains fully self-contained and reproducible from source alone (satisfies FR-001/FR-004).

## 3. Build-time environment configuration (`VITE_API_BASE_URL`)

**Decision**: No new mechanism introduced. Vite already bakes `VITE_*` variables into the static bundle at build time (see `src/api/axiosInstance.ts`, which falls back to `http://localhost:3000` if unset). The Dockerfile build stage inherits this existing behavior; a build `ARG`/`ENV` can be passed at `docker build` time by whoever builds the image if a non-default API URL is needed for their deployment.

**Rationale**: The spec's Assumptions explicitly scope runtime/build configuration as already solved by the existing build process — this feature must not introduce a new injection mechanism.

**Alternatives considered**: Runtime environment substitution (e.g., an entrypoint script that rewrites the built JS with a real API URL at container start) — rejected as out of scope; adds complexity not requested by the spec, and the existing Vite build-time mechanism is sufficient for this feature's goals.

## 4. Multi-architecture build & publish mechanism

**Decision**: Use `docker/setup-qemu-action` + `docker/setup-buildx-action` + `docker/build-push-action` in the GitHub Actions workflow to build and push a single manifest list covering `linux/amd64` and `linux/arm64` in one step.

**Rationale**: This is the standard, officially-documented Docker/GitHub combination for multi-arch builds and requires no custom scripting — consistent with Simplicity First.

**Alternatives considered**: Separate self-hosted ARM runners to build each architecture natively — rejected as unnecessary operational overhead (self-hosted runner maintenance) for a low-traffic single-page app image; QEMU emulation is fast enough for this image's small build.

## 5. Image tagging & registry authentication

**Decision**: Use `docker/metadata-action` to derive tags (`latest` + short commit SHA) and `docker/login-action` with the workflow's automatically-provisioned `GITHUB_TOKEN` (scoped to `packages: write`) to authenticate to `ghcr.io`.

**Rationale**: `GITHUB_TOKEN` requires no manually-created secret (FR-009) and is the documented, supported path for publishing to `ghcr.io` from GitHub Actions. `docker/metadata-action` is the standard action for producing consistent, well-formed tags without hand-written shell logic.

**Alternatives considered**: A hand-rolled Personal Access Token stored as a repo secret — rejected; unnecessary manual credential management the spec explicitly rules out (FR-009).

## 6. Public image visibility on ghcr.io

**Decision**: After the first successful publish, the package's visibility must be set to **Public** in the repository/package settings (GitHub does not currently expose a supported, stable Actions-native way to force initial package visibility to public on first push — it is set once via the package settings UI or `gh api`, and persists for all subsequent pushes).

**Rationale**: Satisfies the public-visibility clarification. This is a one-time manual settings step (or a one-line `gh api` call documented in quickstart.md) rather than a per-run workflow step, since GHCR remembers visibility across pushes.

**Alternatives considered**: Scripting the visibility change via `gh api` on every workflow run — unnecessary once set; documented as a one-time setup step in quickstart.md instead to avoid needless repeated API calls.

## 7. Pull-request validation builds

**Decision**: The same workflow file triggers on `pull_request` targeting `main` in addition to `push` to `main`. On PRs, the job runs `docker/build-push-action` with `push: false` (build only, load into the local Buildx cache for validation) — no registry authentication is attempted for PR runs.

**Rationale**: Reuses one workflow definition (Simplicity First) instead of a second duplicate file; skipping registry login on PRs avoids granting write-capable credentials to a job that never needs to publish.

**Alternatives considered**: A separate `ci.yml` for PR validation and `publish.yml` for main — rejected as unnecessary duplication of build steps for this project's size; a single conditional workflow is simpler to maintain.
