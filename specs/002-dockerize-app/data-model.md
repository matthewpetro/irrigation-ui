# Data Model: Dockerize Application & Automated Image Publishing

This feature is infrastructure/CI tooling — it introduces no application data, TypeScript types, or persisted records. The "entities" below are configuration/metadata concepts realized as build artifacts and workflow state, not runtime data structures.

## Container Image

Represents one built artifact of the application.

| Attribute | Description |
|---|---|
| `repository` | `ghcr.io/<owner>/irrigation-ui` |
| `tags` | `latest` (moving) + `sha-<short-commit-sha>` (immutable, per FR-007) |
| `platforms` | `linux/amd64`, `linux/arm64` (single manifest list, per FR-014) |
| `visibility` | Public (per Clarifications) |
| `source_commit` | The exact commit on `main` the image was built from |
| `created_at` | Build timestamp, recorded by the registry |

**Lifecycle**: created on a successful main-branch build → published to ghcr.io → superseded (but not deleted) by the next successful build, which moves the `latest` tag.

## Build/Publish Pipeline Run

Represents one execution of the GitHub Actions workflow.

| Attribute | Description |
|---|---|
| `trigger` | `push` to `main` (build + publish) or `pull_request` targeting `main` (build only) |
| `triggering_commit` | SHA of the commit/PR head that triggered the run |
| `status` | `success` \| `failure` |
| `published_image_tags` | Populated only for successful `push`-triggered runs (per FR-008); empty for PR runs |

**Lifecycle**: queued on trigger → build stage → (main only) publish stage → terminal `success`/`failure` status visible in the GitHub Actions UI.

## Container Registry

External system (ghcr.io) — not modeled or persisted by this project; referenced only as the destination for published Container Images per FR-011.
