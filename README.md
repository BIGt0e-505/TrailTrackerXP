# TrailTrackerXP

A fitness tracking app for walking, hiking, and mountain biking — built with React Native and Expo.

## Features

### 📍 GPS Tracking
- Real-time route mapping with GPS
- Background location tracking (continues when screen is locked)
- Auto-save every 30 seconds so you never lose a route
- Supports walking, hiking, and mountain biking activity types
- Moving time calculation (excludes paused time)
- Elevation gain tracking

### 🗺️ Offline Maps
- Cached map tiles for offline use
- Route thumbnails generated from GPS coordinates
- Mini-map previews on calendar entries

### 📅 Activity Calendar
- Calendar view of all activities
- See distance, duration, and elevation at a glance
- Tap any day to view activity details
- Route playback on the map

### 📊 Statistics & Gamification
- Rolling 365-day stats with custom cutoff dates
- Distance, duration, and elevation charts
- XP-based levelling system
- Achievement badges (walking, mountain biking, general, streaks)
- Weekly challenges that update based on your progress
- Current streak and best streak tracking
- Distance comparisons ("you've walked the length of the UK!")

### 📤 Import & Export
- GPX file import (from Strava, Garmin, or any GPS device)
- GPX export for sharing routes
- Batch export of all activities
- Strava CSV import support

### 🎨 Theming
- Light and dark modes
- Textured gradient headers
- Custom icon set (no external icon library dependency)

### ⌚ Garmin Watch Companion
- Standalone Garmin Venu 4 app with simulated data
- Real-time phone sync (orange/green connection indicator)
- Start/stop/pause tracking from your wrist
- Activity type switching on watch
- See `garmin_integration/` for setup guide

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo |
| Navigation | React Navigation (bottom tabs + native stack) |
| Maps | react-native-maps + WebView tile caching |
| Storage | AsyncStorage + FileSystem (JSON + GPX) |
| Charts | Custom SVG (react-native-svg) |
| Fonts | Inter (Google Fonts) |
| Garmin | Connect IQ / Monkey C |

## Project Structure

```
TrailTrackerXP/
├── App.js                    # Navigation setup, theming, fonts
├── app.json                  # Expo config
├── screens/
│   ├── TrackingScreen.js     # GPS tracking + map view
│   ├── CalendarScreen.js     # Activity calendar + history
│   ├── StatsScreen.js        # Charts, achievements, challenges
│   ├── ActivityDetailScreen.js # Route playback + details
│   └── SettingsScreen.js     # Preferences, import/export, Garmin
├── utils/
│   ├── storage.js            # Activity CRUD, distance calc, GPX export
│   ├── fileStorage.js        # File-based storage for routes
│   ├── gamification.js       # XP, levels, achievements, challenges
│   ├── stravaImport.js       # GPX/CSV import
│   └── theme.js              # Light/dark theme provider
├── components/
│   └── Icons.js              # Custom SVG icon set
├── assets/
│   ├── icon.png
│   └── splash.png
└── garmin_integration/       # Watch companion app
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo run:android
```

## Garmin Watch Setup

See `garmin_integration/GARMIN_SETUP_GUIDE.md` for full instructions on building and installing the watch companion app.

## License

Private project. All rights reserved.