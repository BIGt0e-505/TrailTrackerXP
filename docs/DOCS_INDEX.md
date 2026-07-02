# Documentation Index

**Last updated:** 2026-07-02

## Active Documentation

| File | Description |
|------|-------------|
| `README.md` | Project overview, screenshots, features, build, releases |
| `docs/DEVELOPMENT.md` | Dev setup, project structure, data storage, Strava import, path overlay |
| `docs/BUILD_AND_RELEASE.md` | Local build, APK creation, signing, troubleshooting |
| `docs/CHALLENGES.md` | Challenge system design: auto/selected challenges, offer filtering, XP rules |
| `docs/GARMIN_COMPANION.md` | Garmin Venu 4 companion app: build, install, controls, phone bridge |
| `docs/UI_MAKEOVER_SUMMARY.md` | Completed UI makeover summary |
| `garmin/TrailTrackerCompanion/README.md` | Garmin-specific detailed README (lives with the Connect IQ project) |

## Local-Only Docs (Untracked)

These docs are kept on disk for reference but are no longer tracked in git:

| File | Why Untracked |
|------|---------------|
| `GARMIN_SETUP_GUIDE.md` | Superseded by `docs/GARMIN_COMPANION.md` |
| `docs/REPO_AUDIT_BEFORE_UI_MAKEOVER.md` | Pre-makeover audit — historical, mentions internal names |
| `docs/UI_MAKEOVER_PLAN.md` | Planning doc — makeover complete, see `docs/UI_MAKEOVER_SUMMARY.md` |
| `docs/archive/*.md` | Archived historical docs |

## Archived Documentation

**`docs/archive/` is local-only and gitignored.** Archived markdown files are retained on disk as temporary reference material but are no longer tracked in version control.

| File | Original Location | Why Archived |
|------|-------------------|--------------|
| `PROJECT_SUMMARY.md` | root | "What I Built" narrative — historical, not workflow |
| `QUICKSTART.md` | root | Initial setup guide — superseded by `docs/DEVELOPMENT.md` |
| `BUILD_APK_GUIDE.md` | root | Verbose EAS build guide — superseded by `docs/BUILD_AND_RELEASE.md` |
| `GET_APK.md` | root | Simplified duplicate of BUILD_APK_GUIDE — merged into `docs/BUILD_AND_RELEASE.md` |
| `GARMIN_INTEGRATION_GUIDE.md` | root | Exploratory doc — superseded by `docs/GARMIN_COMPANION.md` |
| `TRACKINGSCREEN_CHANGES.md` | root | Code patch instructions — already applied |
| `FILE_STORAGE_GUIDE.md` | root | GPX storage doc — merged into `docs/DEVELOPMENT.md` |
| `PATHS_OVERLAY.md` | root | OSM path overlay doc — merged into `docs/DEVELOPMENT.md` |
| `fonts_README.md` | `assets/fonts/` | Referenced SamsungOne font — app uses Inter |