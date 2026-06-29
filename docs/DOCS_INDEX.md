# Documentation Index

**Last updated:** 2026-06-29

## Active Documentation

| File | Description |
|------|-------------|
| `README.md` | Project overview, features, tech stack, quick start |
| `docs/DEVELOPMENT.md` | Dev setup, project structure, data storage, Strava import, path overlay |
| `docs/BUILD_AND_RELEASE.md` | EAS build profiles, APK creation, local build, troubleshooting |
| `docs/GARMIN_COMPANION.md` | Garmin Venu 4 companion app: build, install, controls, phone bridge |
| `docs/REPO_AUDIT_BEFORE_UI_MAKEOVER.md` | Pre-makeover audit (2026-06-29): project structure, theme analysis, cleanup |
| `docs/UI_MAKEOVER_PLAN.md` | Planned TubePulse-style visual makeover (pending) |
| `garmin/TrailTrackerCompanion/README.md` | Garmin-specific detailed README (lives with the Connect IQ project) |

## Archived Documentation

**`docs/archive/` is local-only and gitignored.** Archived markdown files are retained on disk as temporary reference material but are no longer tracked in version control. The active project documentation is the tracked docs in `docs/`, plus `README.md`, plus the Garmin companion README.

| File | Original Location | Why Archived |
|------|-------------------|--------------|
| `PROJECT_SUMMARY.md` | root | "What I Built" narrative from initial construction — historical, not workflow |
| `QUICKSTART.md` | root | Initial setup guide, references placeholder images and Expo Go — superseded by `docs/DEVELOPMENT.md` |
| `BUILD_APK_GUIDE.md` | root | Verbose EAS build guide with deprecated `expo build:android` — superseded by `docs/BUILD_AND_RELEASE.md` |
| `GET_APK.md` | root | Simplified duplicate of BUILD_APK_GUIDE — merged into `docs/BUILD_AND_RELEASE.md` |
| `GARMIN_INTEGRATION_GUIDE.md` | root | Exploratory "is it possible?" doc with 3 options — superseded by actual implementation in `docs/GARMIN_COMPANION.md` |
| `TRACKINGSCREEN_CHANGES.md` | root | Code patch instructions for Garmin integration — already applied, no longer needed |
| `FILE_STORAGE_GUIDE.md` | root | GPX storage system doc (v0.3.1 changelog) — merged into `docs/DEVELOPMENT.md` |
| `PATHS_OVERLAY.md` | root | OSM path overlay feature doc — merged into `docs/DEVELOPMENT.md` (path overlay section) |
| `fonts_README.md` | `assets/fonts/` | Referenced SamsungOne font, but app uses Inter — stale |

## File Operations Log (2026-06-29)

### Moved to `docs/`
- `PATHS_OVERLAY.md` → `docs/archive/PATHS_OVERLAY.md` (content merged into `docs/DEVELOPMENT.md`)

### Moved to `docs/archive/`
- `BUILD_APK_GUIDE.md` → `docs/archive/BUILD_APK_GUIDE.md`
- `GET_APK.md` → `docs/archive/GET_APK.md`
- `QUICKSTART.md` → `docs/archive/QUICKSTART.md`
- `PROJECT_SUMMARY.md` → `docs/archive/PROJECT_SUMMARY.md`
- `GARMIN_INTEGRATION_GUIDE.md` → `docs/archive/GARMIN_INTEGRATION_GUIDE.md`
- `TRACKINGSCREEN_CHANGES.md` → `docs/archive/TRACKINGSCREEN_CHANGES.md`
- `FILE_STORAGE_GUIDE.md` → `docs/archive/FILE_STORAGE_GUIDE.md`

### Moved to `docs/archive/` (from subdirectory)
- `assets/fonts/README.md` → `docs/archive/fonts_README.md`

### Deleted
- None. All docs preserved in archive.

### Created
- `docs/DEVELOPMENT.md` — consolidated dev guide
- `docs/BUILD_AND_RELEASE.md` — consolidated build guide
- `docs/GARMIN_COMPANION.md` — consolidated Garmin guide
- `docs/DOCS_INDEX.md` — this file
- `docs/UI_MAKEOVER_PLAN.md` — placeholder for upcoming makeover

### Kept in place
- `README.md` — updated with new docs/ references
- `garmin/TrailTrackerCompanion/README.md` — stays with Garmin project