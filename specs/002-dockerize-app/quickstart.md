# Quickstart: Validate Dockerize Application & Automated Image Publishing

## Prerequisites

- Docker (or a compatible container engine) installed locally, with Buildx available for multi-arch builds.
- Repo checked out at this feature's branch (`002-dockerize-app`).

## 1. Build and run locally (validates User Story 1)

Time this from the moment you start the build to the moment the app loads in a browser (e.g. prefix with `time`, or note wall-clock start/end).

```bash
docker build -t irrigation-ui .
docker run --rm -p 8080:8080 irrigation-ui
```

Expected:
- Total time from starting the build to the app loading in a browser is under 5 minutes (SC-001).
- Build completes with no host-installed Node/npm required (only Docker).
- `http://localhost:8080` loads the app, functioning identically to `npm run dev`/`npm run preview`.
- Navigating directly to a nested path (e.g. `http://localhost:8080/anything`) still loads the app shell rather than a 404 (see [contracts/container-interface.md](contracts/container-interface.md)).
- Compare against `npm run dev` (or `npm run preview`) side by side and confirm identical behavior across the app's primary flows (SC-005):
  - Day view loads today's events by default
  - Switching to Week view and back to Day view
  - Prev/Next navigation changes the visible date range
  - A warning icon/tooltip renders for an event with an incomplete ON/OFF pair

## 2. Validate multi-arch build (validates FR-014)

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t irrigation-ui:multiarch .
```

Expected: build succeeds for both platforms without platform-specific errors.

## 3. Validate the GitHub Actions workflow (validates User Stories 2 & 3)

1. Open a pull request targeting `main` with any change.
   - Expected: the workflow runs a build-only job (no publish); it appears as a status check on the PR.
2. Merge the pull request to `main`.
   - Expected: within ~10 minutes, a new image tag (`latest` and `sha-<shortsha>`) appears under the repo's ghcr.io packages tab.
3. Merge a second, separate change to `main`.
   - Expected: a new `sha-<shortsha>` tag for this second commit appears, `latest` now points to it, and the first commit's `sha-<shortsha>` tag from step 2 is still listed and still pullable (`docker pull ghcr.io/<owner>/irrigation-ui:sha-<first-shortsha>` succeeds).
4. Intentionally break the build (e.g. a syntax error) on a throwaway branch/PR and confirm the workflow run fails and no new tag is published, and that `latest` still points at the last good image.

## 4. One-time repository setup: make the package public

After the very first successful publish to ghcr.io, the package defaults to private. Set it to public once (per research.md §6):

1. Go to the repository's GitHub page → **Packages** (or `https://github.com/users/<owner>/packages/container/package/irrigation-ui`).
2. Package **Settings** → **Change visibility** → **Public**.

Confirm with:

```bash
docker pull ghcr.io/<owner>/irrigation-ui:latest
```

Expected: the pull succeeds with no `docker login` performed beforehand (validates FR-012).
