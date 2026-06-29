# UI Makeover Plan — TubePulse/ZeroVPN Style

**Status:** In progress — Phase 4C (TrackingScreen planning) — Phases 3A, 3B, 4A, 4B complete  
**Reference:** `D:/dev/zero-vpn/docs/TUBEPULSE_UI_REPORT.md`  
**Branch:** `ui-makeover-tubepulse-style`

## Objective

Apply the TubePulse dark-only visual language to TrailTrackerXP without changing app behaviour or features.

## Icon Pack — Integrated ✅

- **Commit:** `bf48265` — "Replace app icons with new blue icon pack"
- New launcher icon (three blue diagonal bars), notification icon (white silhouette), adaptive icon foreground (512×512).
- Splash background and adaptive icon background updated to `#0D1117`.
- Notification colour updated to `#4FC3F7`.
- Full mipmap density set stored at `android-icons/` (gitignored, for native builds).
- **Blue/cyan is now the app family identity.** Do not revisit icons unless a build issue surfaces.

## Colour Direction

- **Blue/cyan (`#4FC3F7`)** is the app accent — used for active states, highlights, links, glow.
- **Green is now semantic only:** GPS active, tracking active, success states. Green is no longer the app brand colour.
- **Dark-only.** The app should default to dark mode and not offer a light theme unless this creates unexpected risk. `userInterfaceStyle: "dark"` in `app.json`.
- **Background:** `#0D0D0D` (TubePulse standard) for runtime surfaces. The splash/adaptive icon background stays `#0D1117` (slightly navy-tinted for icon contrast) — this is intentional, not a mismatch. One coherent runtime background token: `#0D0D0D`.

## Implementation Phases

### Phase 3A — Plan update (this commit) ✅

### Phase 3B — Theme and app shell foundation
- Update `app.json` to `userInterfaceStyle: "dark"`.
- Replace colour tokens in `utils/theme.js` (or create `src/theme/colors.js`) with the TubePulse palette.
- Restyle `App.js`: header, tab bar, background, safe area.
- Lightly update shared UI components (`src/components/ui/*`) to use new tokens.
- **Do not deep-rewrite screens yet.** This pass is the app shell + theme only.

### Phase 4 — Screen migration
Migrate each screen to the new theme, starting with the simplest:
1. StatsScreen (charts, cards, sections — good candidate for shared components)
2. CalendarScreen (cards, empty state, modal)
3. ActivityDetailScreen (stats, graphs, map header)
4. SettingsScreen (longest, most modals — last to avoid risk)
5. TrackingScreen (most complex, 1800+ lines — needs careful work)

### Phase 5 — Icon/component polish
- Update `components/Icons.js` if needed to match new visual language.
- Consolidate duplicate inline SVG icons from screens into the shared icon set.

### Phase 6 — Final review
- Consistency check across all screens.
- Animations, transitions, empty states.
- Build validation.

## TubePulse Visual Language Summary

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#0D0D0D` | App background |
| `surface` | `#1A1A1A` | Cards, option buttons, placeholders |
| `text` | `#E0E0E0` | Primary text |
| `textDim` | `#666666` | Secondary text, metadata, section titles |
| `accent` | `#4FC3F7` | Active state, highlight, glow |
| `accentGlow` | `rgba(79,195,247,0.3)` | Avatar glow, section highlight |
| `border` | `#2A2A2A` | Hairline borders between sections |
| `danger` | `#EF5350` | Destructive actions |
| `success` | `#4CAF50` | GPS active, tracking active, success (semantic green) |
| `warning` | `#FF9800` | Pause, caution (existing, kept) |

- **Typography:** 15sp primary, 12sp section titles (uppercase, weight 600, letter-spacing 0.5), 12–13sp metadata
- **Buttons:** surface bg + border stroke, 8dp radius, active = accent bg + bg-colour text + weight 700
- **Spacing:** 16dp horizontal padding, hairline borders between sections
- **Dark-only.** No light theme.

See the full report at `D:/dev/zero-vpn/docs/TUBEPULSE_UI_REPORT.md` for details.

## Phase 4C — TrackingScreen Migration Plan

**Status:** Planning only — do not rewrite yet.

### Major Visual Regions in TrackingScreen

1. **Map area** (WebView, full-screen) — OSM/Google map tiles, dark/light toggle, route polyline
2. **Map loading overlay** — ActivityIndicator on `theme.surface`
3. **Recenter button** — floating circular button, top-right
4. **Controls container** — bottom overlay with activity selector, stats, track button
   - Activity selector buttons (walking/biking)
   - Stat boxes (distance, duration, speed, altitude)
   - Map style toggle + cache button
   - Track button (start/stop)
5. **Pause modal** — tracking pause/resume/save/discard
6. **Success modal** — activity saved confirmation
7. **Discard modal** — confirm discard activity
8. **Setup modal** — first-run username setup with permission instructions
9. **Recovery modal** — recover interrupted tracking session
10. **Permission/location services modal** — recenter icon, orange bg

### Which Pieces Can Use Shared Components

- **Modals** → shared `Modal` component (pause, success, discard, recovery, permission)
- **Stat boxes** → shared `StatRow` / `StatItem` (distance, duration, speed, altitude row)
- **Empty/loading states** → shared `EmptyState` (map loading overlay)
- **Cards** → shared `Card` (controls container could be a Card variant)
- **Section headers** → not directly applicable (TrackingScreen has no section headers)

### Risky Parts (GPS/Tracking State)

- **Background task definition** (lines 55-80) — `TaskManager.defineTask`, global state vars. Do NOT touch.
- **Location permission flow** (lines 148-180) — `requestPermissions`, `startForeground`. Do NOT touch.
- **Tracking start/stop logic** (lines 200-400) — `startTracking`, `stopTracking`, `pauseTracking`. Do NOT touch.
- **WebView map communication** (lines 450-470, 1150-1170) — `injectJavaScript`, `handleMapMessage`. Do NOT touch.
- **Route data management** — `backgroundRouteData`, `routeCoordinates` state. Do NOT touch.
- **Auto-save interval** — 30s AsyncStorage recovery. Do NOT touch.
- **Activity type switching** — affects `backgroundActivityType` global. Do NOT touch.
- **Recovery data flow** — `checkForRecoveryData`, `setShowRecoveryModal`. Do NOT touch.

### Hardcoded Colour Values to Replace

| Line | Current | Replacement | Notes |
|------|---------|-------------|-------|
| 124 | `#4CAF50` (CheckIcon default) | Keep (icon default, overridden by props) | |
| 131 | `#2196F3` (CacheSuccessIcon default) | `#4FC3F7` | Icon default |
| 138 | `#D32F2F` (TrashIcon default) | Keep (icon default) | |
| 327 | `#1976D2` / `#D32F2F` (activity route colour) | Keep — semantic activity-type colours | walking=blue, biking=red |
| 454 | `#4CAF50` (notification colour) | `#4FC3F7` | Should use accent |
| 1156-1166 | `#4285F4` (Google map marker) | Keep — Google Maps API default | |
| 1209 | `#4CAF50` (start marker) | Keep — semantic green = start/GPS | |
| 1409 | `#2196F3` (modal button bg) | `theme.accent` | |
| 1438 | `#2196F3` (CacheSuccessIcon) | `theme.accent` | |
| 1573 | `#FFF3E0` (modal icon bg) | `'rgba(255, 152, 0, 0.1)'` | Warning bg |
| 1574 | `#FF9800` (RecenterIcon) | `theme.warning` | |

### Icon Duplication

TrackingScreen defines 5 inline SVG icons: `RecenterIcon`, `PauseIcon`, `CheckIcon`, `CacheSuccessIcon`, `TrashIcon`. Of these:
- `CheckIcon` and `TrashIcon` are also defined in SettingsScreen (identical SVG paths)
- These should be consolidated into `components/Icons.js` **before** the TrackingScreen migration to avoid touching screen code twice
- Low risk — just moving icon definitions, no behaviour change

### Recommended Commit Breakdown for TrackingScreen

1. **Commit 1: Consolidate duplicate icons** — Move `CheckIcon`, `TrashIcon`, `RecenterIcon`, `PauseIcon` from TrackingScreen inline definitions into `components/Icons.js`. Update TrackingScreen imports. Low risk, behaviour-preserving.

2. **Commit 2: Replace hardcoded colours** — Replace `#2196F3` → `theme.accent`, `#FFF3E0` → `'rgba(255, 152, 0, 0.1)'`, `#FF9800` → `theme.warning`, `#4CAF50` (notification) → `theme.accent` in TrackingScreen. Do NOT touch activity-type colours (`#1976D2`/`#D32F2F`) or Google Maps defaults (`#4285F4`/`#4CAF50` start marker).

3. **Commit 3: Adopt shared components** — Replace modal overlays with shared `Modal` component where they match the standard pattern (pause, success, discard). Keep setup modal and recovery modal custom (they have specialized layouts). Replace stat boxes with `StatRow`/`StatItem` if the layout matches without behavioural change.

4. **Commit 4: Visual polish** — Update `createStyles` function to align with TubePulse spacing/typography. Update controls container styling. Hairline borders on stat box separators.

### Estimated Risk

- **Commit 1:** Very low — moving icon definitions
- **Commit 2:** Low — colour swaps only
- **Commit 3:** Medium — component adoption, need to verify modal behaviour is identical
- **Commit 4:** Medium — style function changes, need visual testing on device