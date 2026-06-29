# UI Makeover Plan — TubePulse/ZeroVPN Style

**Status:** In progress — Phase 3B (theme + app shell) next  
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