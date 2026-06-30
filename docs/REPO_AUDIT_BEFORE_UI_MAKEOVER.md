# TrailTrackerXP — Repo Audit Before UI Makeover

**Date:** 2026-06-29  
**Branch:** `ui-makeover-tubepulse-style` (created from `main` @ `b8aeb2f`)  
**Latest commit on main:** `b8aeb2f Rewrite README to describe main app features instead of Garmin-only`

---

## Project type / framework

- **Framework:** React Native + Expo (SDK 51)
- **Language:** JavaScript (no TypeScript)
- **Navigation:** React Navigation (bottom tabs + native stack)
- **Build system:** EAS Build ( Expo cloud), local `npm install`
- **Target platform:** Android (permissions in `app.json`, no iOS config)

## Project structure

```
TrailTrackerXP/
├── App.js                    # Entry point — NavigationContainer, TabNavigator, CustomHeader
├── app.json                  # Expo config (slug, version, permissions, splash)
├── babel.config.js           # babel-preset-expo
├── eas.json                   # EAS build profiles (development / preview / production)
├── package.json              # Dependencies + scripts
├── .gitignore                # Updated (see below)
├── assets/                   # App icons, splash, notification icons
│   └── fonts/README.md       # Font dir (Inter loaded via @expo-google-fonts/inter)
├── components/
│   └── Icons.js              # Custom SVG icon set (react-native-svg)
├── screens/
│   ├── TrackingScreen.js     # 1807 lines — main GPS tracking screen
│   ├── CalendarScreen.js     # 528 lines — activity calendar
│   ├── StatsScreen.js        # 1164 lines — stats + gamification
│   ├── SettingsScreen.js     # 1401 lines — settings + import/export
│   └── ActivityDetailScreen.js # 621 lines — detail view
├── utils/
│   ├── theme.js              # 485 lines — ThemeProvider, light/dark colours, settings storage
│   ├── storage.js            # 485 lines — AsyncStorage helpers
│   ├── fileStorage.js        # 822 lines — FileSystem-based GPX/JSON storage
│   ├── gamification.js       # 1181 lines — XP, levels, achievements, challenges
│   ├── garminBridge.js       # 170 lines — Garmin companion sync
│   └── stravaImport.js       # 572 lines — Strava CSV import
├── garmin/
│   └── TrailTrackerCompanion/  # Garmin Venu 4 Connect IQ app (Monkey C)
│       ├── source/             # .mc source files (KEEP)
│       ├── resources/          # drawables, strings (KEEP)
│       ├── manifest.xml         # (KEEP)
│       ├── monkey.jungle        # (KEEP)
│       └── bin/                 # BUILD OUTPUT (removed from git, .gitignore'd)
├── build-apk.bat              # Windows EAS build helper script
├── build-apk.sh               # Linux/macOS EAS build helper (has encoding issues)
├── *.md (10 doc files)         # Various guides + README
├── TrailTrackerXP-v1.5.0.apk  # 64 MB APK on disk (untracked, .gitignore'd)
└── releases/                   # Old release zips (removed from git, .gitignore'd)
```

## Important UI files and screens

| File | Lines | Role |
|------|-------|------|
| `App.js` | ~170 | App shell — `ThemeProvider` wrapper, `TabNavigator` (Track/Calendar/Stats/Settings), `CustomHeader` with gradient + circular icon, `Stack.Navigator` for ActivityDetail |
| `screens/TrackingScreen.js` | 1807 | Main GPS tracking — start/stop/pause, live map, stats display |
| `screens/CalendarScreen.js` | 528 | Calendar view of activities, tap for detail |
| `screens/StatsScreen.js` | 1164 | Rolling 365-day stats, charts, XP/level display, achievements |
| `screens/SettingsScreen.js` | 1401 | Dark mode toggle, map style, distance unit, username, import/export |
| `screens/ActivityDetailScreen.js` | 621 | Per-activity detail — map, elevation, speed data |
| `components/Icons.js` | ~200 | All custom SVG icons (Track, Calendar, Stats, Settings, Play, Stop, etc.) |
| `utils/theme.js` | 485 | `ThemeProvider`, `useTheme()` hook, colour definitions for light + dark |

## Current theme / styling approach

- **Theme system:** `utils/theme.js` exports `ThemeProvider` + `useTheme()` context.
  - `colors.light` and `colors.dark` objects with ~20 colour tokens each.
  - Settings persisted via AsyncStorage (`@trail_tracker_settings`).
  - App defaults to **dark mode** (`appDarkMode: true`).
- **Colours (dark):** background `#121212`, surface `#1E1E1E`, primary `#4CAF50` (green), accent `#64B5F6` (blue), text `#FFFFFF`, border `#3D3D3D`.
- **Colours (light):** background `#FFFFFF`, surface `#F5F5F5`, primary `#2E7D32` (dark green), accent `#1976D2`.
- **Font:** Inter (400/500/600/700) via `@expo-google-fonts/inter`.
- **Header:** Custom `LinearGradient` header with green tones, circular app icon, `Inter_600SemiBold` title.
- **Tab bar:** Bottom tabs with custom SVG icons, 65dp height, active tint = `theme.iconActive`.
- **Splash:** `#121212` background.
- **No shared component library** — each screen defines its own `StyleSheet.create` styles inline.

### TubePulse report comparison

The TubePulse UI report (`D:/dev/zero-vpn/docs/TUBEPULSE_UI_REPORT.md`) defines a dark-only palette:
- bg `#0D0D0D`, surface `#1A1A1A`, text `#E0E0E0`, textDim `#666666`, accent `#4FC3F7`, border `#2A2A2A`, danger `#EF5350`.
- Section titles: 12sp, weight 600, uppercase, letter-spacing 0.5.
- 16dp horizontal padding, hairline borders between sections.
- Button treatment: surface bg + border stroke, 8dp radius, active = accent bg + bg text.

TrailTrackerXP's current green-themed palette and light/dark dual mode is quite different. The makeover will need to reconcile or replace the green identity with the TubePulse dark-only visual language.

## What was cleaned

### Removed from git tracking (files still on disk, now .gitignore'd)

| Item | Why | Size |
|------|-----|------|
| `.wget-hsts` | wget cache file, machine-local, no project relevance | tiny |
| `releases/TrailTrackerXP-v1.0.4.zip` | Binary release archive | ~unknown |
| `releases/TrailTrackerXP-v1.0.6.zip` | Binary release archive | ~unknown |
| `garmin/TrailTrackerCompanion/bin/` (13 files) | Garmin Connect IQ build output — `.prg`, `.mir`, `.mbc`, `.mcgen` are all compiler-generated | ~various |

### .gitignore additions

Added patterns for:
- `.wget-hsts` — wget HSTS cache
- `releases/` — release binary archives
- `garmin/*/bin/` — Garmin build output directory

### Already untracked (no action needed)

- `TrailTrackerXP-v1.5.0.apk` (64 MB) — already covered by existing `*.apk` in .gitignore.
- `node_modules/` — already in .gitignore.
- `.expo/` — already in .gitignore.

## What was left alone

| Item | Reason |
|------|--------|
| `build-apk.bat` / `build-apk.sh` | Build helper scripts — not generated, may be useful. `build-apk.sh` has encoding issues (mojibake emoji) but not a cleanup target. |
| 10 root-level `.md` docs (`BUILD_APK_GUIDE.md`, `FILE_STORAGE_GUIDE.md`, `GARMIN_INTEGRATION_GUIDE.md`, `GARMIN_SETUP_GUIDE.md`, `GET_APK.md`, `PATHS_OVERLAY.md`, `PROJECT_SUMMARY.md`, `QUICKSTART.md`, `TRACKINGSCREEN_CHANGES.md`) | Some may be stale (e.g. `TRACKINGSCREEN_CHANGES.md` looks like a changelog), but determining staleness requires Aaron's input. Left for now. |
| `package-lock.json` | Kept tracked (deterministic installs). Added a commented-out .gitignore line in case Aaron wants to untrack it later. |
| `garmin/TrailTrackerCompanion/` source + resources | Source code, not build output. Keep. |
| `assets/fonts/README.md` | Placeholder doc, harmless. |
| All screen/util JS files | App source — no changes. |

## Validation results

| Command | Result |
|---------|--------|
| `npm install` | ✅ Exit code 0. 1188 packages audited. 46 vulnerabilities (2 low, 22 moderate, 20 high, 2 critical) — pre-existing dependency issues, not caused by cleanup. |

No build/lint was attempted — this is an Expo project that requires EAS cloud builds or a local Android build environment. `npx expo start` would need a running device/emulator. `npm install` is the safest validation that confirms `package.json` + `package-lock.json` are consistent.

## Risks / issues noticed

1. **No TypeScript.** All source is plain JavaScript. For a UI makeover of this scale, TypeScript would help with refactoring safety, but that's a separate decision.
2. **Large screen files.** `TrackingScreen.js` (1807 lines) and `SettingsScreen.js` (1401 lines) are very large — styles are inline per screen. The makeover will need to either edit these in place or extract shared components first.
3. **Dual theme (light + dark).** TubePulse is dark-only. TrailTrackerXP currently supports both. The makeover should decide: drop light mode entirely, or keep it as a secondary option.
4. **Green identity.** The app has a strong green theme (`#4CAF50` primary, `#2E7D32` light primary, green gradient headers). TubePulse uses `#4FC3F7` (light blue) accent on near-black. This is the biggest visual shift.
5. **Custom SVG icons.** All icons are hand-drawn SVG via `react-native-svg`. The TubePulse report doesn't specify icon style — we may want to update icon treatment to match.
6. **`build-apk.sh` has encoding issues.** The file contains mojibake (broken UTF-8 emoji). Not a cleanup target but worth noting.
7. **Root-level doc sprawl.** 10 `.md` files in the root, some likely stale. Consider consolidating into `docs/` during or after the makeover.
8. **`app.json` has `userInterfaceStyle: "automatic"`.** TubePulse uses `"dark"` only. This will need to change.
9. **Pre-existing npm vulnerabilities (46).** Not caused by cleanup, but should be addressed separately — 2 critical.

## Suggested next steps for the TubePulse/ZeroVPN-style makeover

1. **Decide on light mode.** Recommend dropping it and going dark-only to match the TubePulse visual language. Set `userInterfaceStyle: "dark"` in `app.json`.
2. **Create a shared theme file.** Extract all colour tokens into a single `utils/theme.js` replacement that uses the TubePulse palette (or an adapted version that keeps some green identity — Aaron's call).
3. **Extract shared UI components.** Before restyling 5 screens individually, build shared `Button`, `Card`, `SectionTitle`, `StatRow` components to reduce duplication and ensure consistency.
4. **Restyle `App.js` first.** The header and tab bar are the app's visual frame. Get those right, then work through screens.
5. **Restyle screens in order:** TrackingScreen → StatsScreen → SettingsScreen → CalendarScreen → ActivityDetailScreen (by complexity/visibility).
6. **Update icons** in `components/Icons.js` if needed to match the new visual language.
7. **Consolidate docs** — move the 10 root-level `.md` files into `docs/` (or remove stale ones) as a separate hygiene pass.
8. **Address npm vulnerabilities** — at minimum `npm audit fix` (non-breaking).

---

**Commit:** `Prepare TrailTrackerXP for UI makeover`  
**Files changed:** `.gitignore` (updated), 15 files removed from git tracking (`.wget-hsts`, `releases/*`, `garmin/*/bin/*`), `docs/REPO_AUDIT_BEFORE_UI_MAKEOVER.md` (this file).