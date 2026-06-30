# Garmin Companion App

TrailTrackerXP includes a Garmin Venu 4 companion app built with Connect IQ (Monkey C).

## Overview

The companion app runs on the watch and communicates with TrailTrackerXP on the phone via Garmin Connect Mobile. Features:

- Real-time status display: activity type, distance, duration, pace/speed, altitude
- Progress arc showing distance to next mile/km
- Start/stop/pause tracking from the wrist
- Activity type switching (walking ↔ biking) via UP/DOWN or swipe
- Dynamic units (miles/km based on phone app setting)
- Connection indicator: 🟢 green = connected, 🟠 orange = standalone mode

## Project Location

```
garmin/TrailTrackerCompanion/
├── manifest.xml                 # App manifest (app ID, permissions)
├── monkey.jungle                # Build configuration
├── source/
│   ├── TrailTrackerApp.mc       # Main app + phone communication
│   ├── TrailTrackerView.mc      # Watch UI (progress arc, icons, status)
│   ├── TrailTrackerDelegate.mc  # Input handling + stop menu
│   └── TrackingData.mc          # Data model with dynamic units
├── resources/
│   ├── strings/strings.xml
│   └── drawables/
│       ├── drawables.xml
│       ├── launcher_icon.png    # 60×60 app icon
│       ├── walking_icon.png     # 30×30 walking figure
│       └── biking_icon.png      # 30×30 cyclist
└── README.md                     # Detailed Garmin-specific README
```

## Watch Controls

| Control | Action |
|---------|--------|
| SELECT | Start tracking / Open stop menu |
| UP/DOWN | Switch activity (walking ↔ biking) |
| BACK | Pause/Resume while tracking |
| Tap | Same as SELECT |
| Swipe | Switch activity |

### Stop Menu Options
- **Resume** (green) — continue tracking
- **Save** (white) — save activity to phone
- **Discard** (red) — delete activity

## Building the Watch App

```powershell
cd garmin\TrailTrackerCompanion

# Build with Connect IQ SDK (adjust paths for your installation)
& "$env:LOCALAPPDATA\Garmin\ConnectIQ\Sdks\connectiq-sdk-win-8.4.0\bin\monkeyc.bat" `
    -d venu441mm -f monkey.jungle `
    -o bin\TrailTrackerCompanion.prg `
    -y $env:LOCALAPPDATA\Garmin\ConnectIQ\developer_key.der
```

> **Note:** Build output (`bin/`) is now .gitignore'd. The `.prg` file is generated locally.

## Installing on Watch

Connect Venu 4 via USB and copy the built `.prg` file:
```powershell
copy bin\TrailTrackerCompanion.prg E:\GARMIN\APPS\
```

Safely eject the watch after copying.

## Phone-Side Integration

The JavaScript bridge lives at `utils/garminBridge.js`. It's imported by `TrackingScreen.js` to:
- Initialize the Garmin connection on app start
- Send tracking updates (distance, duration, speed, altitude) every 2 seconds
- Receive commands from the watch (start, pause, resume, save, discard, setActivity)

### Enabling Native Communication (Android)

For real phone↔watch communication (not standalone mode):

1. Add the Garmin Connect IQ SDK to `android/app/libs/`
2. Add native module files (`GarminBridgeModule.java`, `GarminBridgePackage.java`)
3. Register the package in `MainApplication.java`
4. Rebuild the Android app

Without the native module, the watch runs in standalone mode (simulated data, orange indicator).

## Troubleshooting

| Issue | Fix |
|------|-----|
| Watch shows orange dot | Ensure Garmin Connect Mobile is running and watch is paired |
| "App not installed" | Verify `.prg` is in `GARMIN\APPS\` and app ID matches |
| Build errors | Check SDK path, developer key, and device ID (`venu441mm`) |
| Messages not sending | Check `adb logcat \| grep GarminBridge`, ensure both apps in foreground |