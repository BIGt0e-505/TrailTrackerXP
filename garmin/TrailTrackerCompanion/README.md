# TrailTrackerXP Companion - Garmin Connect IQ App

A companion watch app for TrailTrackerXP that displays tracking status and provides controls on your Garmin Venu 4.

## Supported Devices

- Garmin Venu 4 (45mm)
- Garmin Venu 4S (41mm)

## Features

### Display
- Activity type (Walking/Biking) with color indicator
- Tracking status (Ready/Tracking/Paused)
- Distance traveled
- Duration
- Current pace (walking) or speed (biking)
- Altitude
- Connection status indicator

### Controls
| Input | Action |
|-------|--------|
| **SELECT** (middle button) | Start/Stop tracking |
| **UP/DOWN** buttons | Toggle activity type |
| **BACK** button | Pause (while tracking) / Exit (when stopped) |
| **Tap** (touchscreen) | Same as SELECT |
| **Swipe Up/Down** | Toggle activity type |

## Building the App

### Prerequisites

1. **Connect IQ SDK 8.4.0+** installed
2. **VS Code** with Monkey C extension
3. **Developer Key** generated

### Build Steps

1. Open the `garmin/TrailTrackerCompanion` folder in VS Code

2. Set your device target:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Monkey C: Set Product"
   - Select "venu4s" (41mm) or "venu4" (45mm)

3. Build the project:
   - Press `Ctrl+Shift+B` (or `Cmd+Shift+B`)
   - Or: Run > Run Build Task

4. The output `.prg` file will be in `bin/`

### Testing in Simulator

1. Press `F5` to launch the simulator
2. The app runs with simulated data (orange connection dot)
3. Test button interactions:
   - Click SELECT to start/stop
   - Click UP/DOWN to change activity
   - Watch stats update in real-time

## Installing on Your Watch

### USB Method (Recommended)

1. Connect Venu 4 to computer via USB
2. Watch mounts as a drive (e.g., `GARMIN`)
3. Copy the `.prg` file to: `GARMIN/APPS/`
4. Safely eject the watch
5. On watch: Hold button > Apps > TrailTracker

### File Location
```
YOUR_WATCH/
└── GARMIN/
    └── APPS/
        └── TrailTrackerCompanion.prg  ← Copy here
```

## Simulator Mode

When running without the phone app connected:
- **Orange dot** in top-right indicates simulator mode
- Data is simulated (fake distance/speed/etc.)
- Useful for testing UI and button interactions

When connected to TrailTrackerXP:
- **Green dot** indicates connected
- Real data from your phone
- Commands sync to phone app

## Project Structure

```
TrailTrackerCompanion/
├── manifest.xml              # App config & device targets
├── resources/
│   ├── drawables/
│   │   ├── drawables.xml     # Image resources
│   │   └── launcher_icon.png # App icon
│   └── strings/
│       └── strings.xml       # Text strings
└── source/
    ├── TrailTrackerApp.mc    # Main app & phone communication
    ├── TrackingData.mc       # Data model
    ├── TrailTrackerView.mc   # UI rendering
    └── TrailTrackerDelegate.mc # Button/touch handling
```

## Phase 2: Phone Communication

This is a **Phase 1** build - the watch app works standalone with simulated data.

**Phase 2** will add:
- Real-time data sync from TrailTrackerXP
- Command sending (start/stop/activity) to phone
- Requires adding `garminBridge.js` to the React Native app

## Troubleshooting

### "Device not supported" error
- Ensure you selected venu4s or venu4 as the product
- Check manifest.xml has the correct product IDs

### Build fails
- Verify Connect IQ SDK path is set in VS Code settings
- Check that developer key is valid

### App doesn't appear on watch
- Confirm `.prg` file is in `GARMIN/APPS/` folder
- Try restarting the watch

### Simulator crashes
- Update to latest Connect IQ SDK
- Try a clean rebuild (delete `bin/` folder)

## Version History

- **v0.1.0** - Initial release
  - Basic UI with all tracking stats
  - Button controls for start/stop and activity toggle
  - Simulator mode with fake data
  - Venu 4 / Venu 4S support
