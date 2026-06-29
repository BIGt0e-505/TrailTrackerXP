# UI Makeover Plan — TubePulse/ZeroVPN Style

**Status:** Pending — not yet started  
**Reference:** `D:/dev/zero-vpn/docs/TUBEPULSE_UI_REPORT.md`  
**Branch:** `ui-makeover-tubepulse-style`

## Objective

Apply the TubePulse dark-only visual language to TrailTrackerXP without changing app behaviour or features.

## Key Decisions Needed

1. **Light mode:** Drop it and go dark-only (TubePulse is dark-only)? Set `userInterfaceStyle: "dark"` in `app.json`.
2. **Colour identity:** Replace the current green primary (`#4CAF50`) with the TubePulse accent (`#4FC3F7` light blue on near-black), or adapt the palette to keep some green identity?
3. **Shared components:** Phase 2B should extract shared UI components first (AppScreen, Card, SectionHeader, Button, etc.) so the restyle is consistent across screens.

## Planned Approach

1. **Phase 2B (prerequisite):** Extract shared UI components and style constants (behaviour-preserving, no visual change).
2. **Phase 3 — Theme swap:** Replace colour tokens in `utils/theme.js` with the TubePulse palette.
3. **Phase 4 — Component restyle:** Update shared components to match TubePulse button/card/section treatment.
4. **Phase 5 — Screen restyle:** Restyle each screen using the new shared components, starting with `App.js` (header + tab bar), then TrackingScreen, StatsScreen, SettingsScreen, CalendarScreen, ActivityDetailScreen.
5. **Phase 6 — Icons:** Update `components/Icons.js` if needed to match the new visual language.
6. **Phase 7 — Polish:** Animations, transitions, empty states, final review.

## TubePulse Visual Language Summary

- **Palette:** bg `#0D0D0D`, surface `#1A1A1A`, text `#E0E0E0`, textDim `#666666`, accent `#4FC3F7`, border `#2A2A2A`, danger `#EF5350`
- **Typography:** 15sp primary, 12sp section titles (uppercase, weight 600, letter-spacing 0.5), 12–13sp metadata
- **Buttons:** surface bg + border stroke, 8dp radius, active = accent bg + bg-colour text + weight 700
- **Spacing:** 16dp horizontal padding, hairline borders between sections
- **No light theme, no custom font** (system default / Roboto)

See the full report at `D:/dev/zero-vpn/docs/TUBEPULSE_UI_REPORT.md` for details.