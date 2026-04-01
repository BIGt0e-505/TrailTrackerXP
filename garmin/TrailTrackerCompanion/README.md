# Garmin Watch Integration v2

Complete Garmin Venu 4 watch integration for TrailTrackerXP with:
- ✅ Dynamic units (km/mi based on app setting)
- ✅ TrailTrackerXP-style launcher icon
- ✅ Progress arc showing distance to next km/mile
- ✅ Activity icons (walking figure, bike)
- ✅ Two-way communication with phone app

## Contents

```
garmin_v2/
├── manifest.xml                    # Watch app manifest
├── monkey.jungle                   # Build configuration
├── source/
│   ├── TrailTrackerApp.mc         # Main app + phone communication
│   ├── TrailTrackerView.mc        # UI with progress arc & icons
│   ├── TrailTrackerDelegate.mc    # Input handling + stop menu
│   └── TrackingData.mc            # Data model with dynamic units
├── resources/
│   ├── strings/strings.xml
│   └── drawables/
│       ├── drawables.xml
│       ├── launcher_icon.png      # TrailTrackerXP-style icon (60x60)
│       ├── walking_icon.png       # Walking figure (30x30)
│       └── biking_icon.png        # Cyclist (30x30)
├── utils/
│   └── garminBridge.js            # JavaScript bridge for React Native
├── android/.../                    # Native Android module
└── TRACKINGSCREEN_CHANGES.md      # Code changes for TrackingScreen.js
```

---

## Installation

### Step 1: Build the Watch App

Copy the entire `garmin_v2` folder contents to:
```
C:\dev\TrailTrackerXP_Proj\TrailTrackerXP\garmin\TrailTrackerCompanion\
```

Then build:
```powershell
cd C:\dev\TrailTrackerXP_Proj\TrailTrackerXP\garmin\TrailTrackerCompanion

& "C:\Users\aoakley5\AppData\Roaming\Garmin\ConnectIQ\Sdks\connectiq-sdk-win-8.4.0-2025-12-03-5122605dc\bin\monkeyc.bat" -d venu441mm -f monkey.jungle -o bin\TrailTrackerCompanion.prg -y C:\Users\aoakley5\developer_key.der
```

### Step 2: Install on Watch

Connect Venu 4 via USB and copy:
```powershell
copy bin\TrailTrackerCompanion.prg E:\GARMIN\APPS\
```

### Step 3: Enable Phone Communication (Optional)

1. Add to `android/app/build.gradle` dependencies:
   ```gradle
   implementation("com.garmin.connectiq:ciq-companion-app-sdk:2.3.0@aar")
   ```

2. Copy native modules to Android project:
   - `GarminBridgeModule.java` → `android/app/src/main/java/com/trailtrackerxp/`
   - `GarminBridgePackage.java` → `android/app/src/main/java/com/trailtrackerxp/`

3. Register in `MainApplication.java`:
   ```java
   packages.add(new GarminBridgePackage());
   ```

4. Copy `garminBridge.js` to `utils/`

5. Apply changes from `TRACKINGSCREEN_CHANGES.md`

---

## Watch Features

### Main Display

```
        ┌─────────────────────┐
        │    [PROGRESS ARC]   │
        │                  🟠 │  ← Connection dot
        │                     │
        │   🚶 WALKING        │  ← Activity icon + type
        │      READY          │  ← Status
        │                     │
        │     0.00 mi         │  ← Distance (or km)
        │                     │
        │    00:00:00         │  ← Duration
        │                     │
        │  --:--    850 ft    │  ← Pace/Speed + Altitude
        └─────────────────────┘
```

### Progress Arc

- Circles the edge of the display
- Fills clockwise as you approach the next mile/km
- Resets at each mile/km milestone
- Color matches activity (green=walking, blue=biking)

### Dynamic Units

| App Setting | Distance | Speed | Pace | Altitude |
|-------------|----------|-------|------|----------|
| Miles | mi | mph | /mi | ft |
| Kilometers | km | km/h | /km | m |

### Controls

| Control | Action |
|---------|--------|
| SELECT | Start tracking / Open stop menu |
| UP/DOWN | Switch activity (walking ↔ biking) |
| BACK | Pause/Resume while tracking |
| Tap | Same as SELECT |
| Swipe | Switch activity |

### Stop Menu

- **Resume** (green) - Continue tracking
- **Save** (white) - Save activity to phone
- **Discard** (red) - Delete activity

---

## Connection Status

| Dot Color | Meaning |
|-----------|---------|
| 🟢 Green | Connected to phone app |
| 🟠 Orange | Standalone mode (simulated data) |

---

## Troubleshooting

### Build Errors

If you get Monkey C errors, ensure:
- SDK path is correct
- Developer key exists at the specified path
- Device ID is `venu441mm`

### Watch App Not Appearing

- Safely eject watch after copying
- Check the file is in `GARMIN\APPS\`
- Restart the watch

### Phone Communication Not Working

- Garmin Connect Mobile must be running
- Watch must be paired in Garmin Connect
- App ID must match: `a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4`
