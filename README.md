# TrailTrackerXP

A fitness tracking app for walking, hiking, and mountain biking — built with React Native and Expo.

## Features

- **GPS Tracking** — real-time route mapping, background location, auto-save every 30s, moving time + elevation gain
- **Offline Maps** — cached map tiles, route thumbnails, mini-map previews on calendar
- **Activity Calendar** — calendar view with distance/duration/elevation, route playback
- **Statistics & Gamification** — rolling 365-day stats, XP levelling, achievement badges, weekly challenges, streaks
- **Import & Export** — GPX import/export, Strava CSV import, batch export
- **Path Overlay** — OpenStreetMap footpath/bridleway overlay for walking mode
- **Garmin Watch Companion** — Connect IQ app for Venu 4 with real-time sync and watch controls
- **Theming** — light and dark modes, custom SVG icon set, Inter font family

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo (SDK 51) |
| Navigation | React Navigation (bottom tabs + native stack) |
| Maps | react-native-maps + WebView tile caching |
| Storage | AsyncStorage + FileSystem (JSON + GPX) |
| Charts | Custom SVG (react-native-svg) |
| Fonts | Inter (@expo-google-fonts/inter) |
| Garmin | Connect IQ / Monkey C |

## Quick Start

```bash
npm install
npx expo start          # Opens Expo DevTools
# Scan QR with Expo Go on your Android phone
```

## Documentation

All project docs are in [`docs/`](docs/):

- [Development Guide](docs/DEVELOPMENT.md) — setup, project structure, data storage, Strava import, path overlay
- [Build & Release Guide](docs/BUILD_AND_RELEASE.md) — EAS build profiles, APK creation, local build
- [Garmin Companion App](docs/GARMIN_COMPANION.md) — watch app build/install, controls, phone bridge
- [Docs Index](docs/DOCS_INDEX.md) — full documentation catalogue
- [Repo Audit (Pre-Makeover)](docs/REPO_AUDIT_BEFORE_UI_MAKEOVER.md) — project audit before UI redesign
- [UI Makeover Plan](docs/UI_MAKEOVER_PLAN.md) — planned TubePulse-style visual makeover

## Project Structure

```
TrailTrackerXP/
├── App.js                        # Navigation, theming, font loading
├── app.json                      # Expo config
├── screens/                      # 5 screens (Track, Calendar, Stats, Detail, Settings)
├── utils/                        # storage, fileStorage, gamification, stravaImport, theme, garminBridge
├── components/                   # Custom SVG icons
├── assets/                       # App icons, splash, fonts
├── garmin/TrailTrackerCompanion/ # Connect IQ watch app
└── docs/                         # Project documentation
```

## License

Private project. All rights reserved.