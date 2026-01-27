# Garmin Watch Integration Package

This package contains everything needed to add Garmin Venu 4 watch support to TrailTrackerXP.

## Contents

```
garmin_integration/
├── GARMIN_SETUP_GUIDE.md          # Full setup instructions
├── TRACKINGSCREEN_CHANGES.md      # Code changes for TrackingScreen.js
├── garmin/
│   └── TrailTrackerCompanion/     # Complete watch app (ready to build)
│       ├── manifest.xml
│       ├── monkey.jungle
│       ├── resources/
│       └── source/
├── utils/
│   └── garminBridge.js            # JavaScript bridge (copy to utils/)
└── android/
    └── app/
        └── src/main/java/com/trailtrackerxp/
            ├── GarminBridgeModule.java    # Native module
            └── GarminBridgePackage.java   # Package registration
```

## Quick Start

### 1. Install Watch App

```powershell
cd garmin/TrailTrackerCompanion

# Build
& "C:\Users\aoakley5\AppData\Roaming\Garmin\ConnectIQ\Sdks\connectiq-sdk-win-8.4.0-2025-12-03-5122605dc\bin\monkeyc.bat" -d venu441mm -f monkey.jungle -o bin\TrailTrackerCompanion.prg -y C:\Users\aoakley5\developer_key.der

# Copy to watch via USB
copy bin\TrailTrackerCompanion.prg E:\GARMIN\APPS\
```

### 2. Add Phone Communication (Optional - Phase 2)

See `GARMIN_SETUP_GUIDE.md` for full instructions on enabling two-way communication.

**Files to add:**
- `utils/garminBridge.js` → copy to your `utils/` folder
- `GarminBridgeModule.java` → copy to Android native folder
- `GarminBridgePackage.java` → copy to Android native folder

**Files to modify:**
- `TrackingScreen.js` - see `TRACKINGSCREEN_CHANGES.md`
- `android/app/build.gradle` - add Garmin SDK
- `MainApplication.java` - register native module

## Watch Controls

| Control | Action |
|---------|--------|
| SELECT (middle button) | Start tracking / Show stop menu |
| UP/DOWN | Change activity type (when stopped) |
| BACK | Pause/Resume (when tracking) |
| Tap screen | Same as SELECT |
| Swipe up/down | Change activity type (when stopped) |

## Stop Menu Options

When you press SELECT while tracking:
- **Resume** (green) - Continue tracking
- **Save** (white) - Save activity
- **Discard** (red) - Delete activity

## Notes

- The watch app works standalone with simulated data (orange connection dot)
- With phone communication enabled, data syncs in real-time (green dot)
- Watch always displays miles/feet regardless of phone settings
