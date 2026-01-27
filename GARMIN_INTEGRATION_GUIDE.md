# Garmin Venu 4 Integration Guide for TrailTrackerXP

## Overview

Yes, it's absolutely possible to display TrailTrackerXP status on your Garmin Venu 4 and have watch controls! The Venu 4 supports **Connect IQ**, Garmin's app platform, which enables exactly what you're looking for.

There are **two main approaches**, each with different complexity levels and capabilities:

---

## Option 1: Connect IQ Companion App (Recommended)

This approach creates a small app that runs on your watch and communicates with TrailTrackerXP on your phone.

### What You'd Get:
- ✅ **Watch Display**: Current activity type, distance, duration, pace/speed, altitude
- ✅ **Start/Stop Controls**: Buttons on watch to control tracking
- ✅ **Activity Type Selection**: Swipe or button to switch between Walking/Biking
- ✅ **Real-time sync**: Updates every few seconds
- ✅ **Glanceable widget**: Quick status view without opening full app

### How It Works:

```
┌─────────────────┐                    ┌─────────────────┐
│  Garmin Venu 4  │◄──── Bluetooth ───►│  TrailTrackerXP │
│  Connect IQ App │      via GCM       │   React Native  │
└─────────────────┘                    └─────────────────┘
         │                                      │
         │                                      │
    Garmin Connect                        Your Phone
    Mobile (GCM) app
    (intermediary)
```

### Technical Requirements:

1. **Watch Side (Connect IQ)**:
   - Language: Monkey C (Garmin's language, similar to Java)
   - SDK: Connect IQ SDK (free from Garmin)
   - Development: Eclipse or VS Code with Connect IQ plugin

2. **Phone Side (TrailTrackerXP)**:
   - Add: `react-native-garmin-connect` or similar BLE library
   - Protocol: Garmin's proprietary communication via Garmin Connect Mobile

### Implementation Complexity:
- **Watch app**: ~500-1000 lines of Monkey C
- **Phone integration**: ~200-300 lines of JS added to TrailTrackerXP
- **Learning curve**: 2-4 weeks if new to Connect IQ
- **Testing**: Requires Connect IQ Simulator + physical device

---

## Option 2: Bluetooth Low Energy (BLE) Direct Connection

A simpler approach using standard BLE protocols without Garmin's SDK.

### What You'd Get:
- ✅ **Basic notifications**: Push status updates as notifications
- ❌ **No native watch UI**: Just notification cards
- ❌ **No watch controls**: One-way communication only
- ✅ **Easier to implement**: No Monkey C required

### How It Works:
TrailTrackerXP sends status updates as structured notifications that appear on the watch.

```javascript
// Example: Send status notification (conceptual)
import * as Notifications from 'expo-notifications';

const sendWatchUpdate = async (trackingData) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🚶 ${trackingData.activityType}`,
      body: `${trackingData.distance} mi | ${trackingData.duration}`,
      data: { type: 'tracking_update' },
    },
    trigger: null, // Immediate
  });
};
```

### Limitations:
- No interactive controls on watch
- Notification clutter
- Less battery efficient (frequent notifications)

---

## Option 3: Garmin Health API (Data Sync Only)

This syncs completed activities to Garmin Connect, not real-time control.

### What You'd Get:
- ✅ **Post-activity sync**: Send completed TrailTrackerXP activities to Garmin Connect
- ✅ **Unified history**: See all activities in one place
- ❌ **No real-time display**: Only after activity is saved
- ❌ **No watch controls**: Phone-to-cloud only

---

## Recommended Approach: Connect IQ Companion App

For what you described (status display + start/stop + activity selection), **Option 1** is the way to go.

### Project Structure Would Look Like:

```
TrailTrackerXP/
├── ... (existing files)
├── garmin/
│   └── TrailTrackerCompanion/        # Connect IQ project
│       ├── manifest.xml
│       ├── resources/
│       │   ├── strings.xml
│       │   └── layouts/
│       │       └── main_layout.xml
│       └── source/
│           ├── TrailTrackerApp.mc    # Main app entry
│           ├── TrailTrackerView.mc   # Watch UI
│           ├── TrailTrackerDelegate.mc
│           └── CommModule.mc         # Phone communication
└── utils/
    └── garminBridge.js               # New: React Native ↔ Garmin
```

### Watch UI Mockup:

```
┌─────────────────────────┐
│     TrailTrackerXP      │
│                         │
│   🚶 WALKING            │
│                         │
│   2.45 mi               │
│   00:32:15              │
│   4.2 mph               │
│                         │
│  ┌─────┐    ┌─────┐    │
│  │STOP │    │ 🚴  │    │
│  └─────┘    └─────┘    │
└─────────────────────────┘
```

---

## Getting Started with Connect IQ Development

### Step 1: Set Up Development Environment

1. **Download Connect IQ SDK**:
   - https://developer.garmin.com/connect-iq/sdk/

2. **Install VS Code Extension**:
   - "Monkey C" extension by Garmin

3. **Get Developer Key**:
   - Sign up at https://developer.garmin.com
   - Generate a developer key for signing apps

### Step 2: Create Basic Watch App

Here's a minimal Monkey C app structure:

```monkey-c
// TrailTrackerApp.mc
using Toybox.Application;
using Toybox.Communications;

class TrailTrackerApp extends Application.AppBase {
    function initialize() {
        AppBase.initialize();
    }

    function onStart(state) {
        // Register for phone messages
        Communications.registerForPhoneAppMessages(method(:onPhoneMessage));
    }

    function onPhoneMessage(msg) {
        // Handle incoming data from TrailTrackerXP
        var data = msg.data;
        // Update UI with tracking status
    }

    function getInitialView() {
        return [new TrailTrackerView(), new TrailTrackerDelegate()];
    }
}
```

### Step 3: Add React Native Bridge

```javascript
// utils/garminBridge.js
import { NativeModules, NativeEventEmitter } from 'react-native';

// Note: Requires native module or library like react-native-ble-plx
// for direct BLE, or a Garmin-specific bridge

class GarminBridge {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    // Establish connection to Garmin Connect Mobile
  }

  async sendTrackingUpdate(data) {
    const payload = {
      isTracking: data.isTracking,
      isPaused: data.isPaused,
      activityType: data.activityType,
      distance: data.distance,
      duration: data.duration,
      speed: data.currentSpeed,
      altitude: data.currentAltitude,
    };
    // Send to watch via Garmin protocol
  }

  onWatchCommand(callback) {
    // Listen for start/stop/switch commands from watch
  }
}

export default new GarminBridge();
```

---

## Effort Estimate

| Component | Time (if new to Connect IQ) | Time (experienced) |
|-----------|----------------------------|-------------------|
| Learn Monkey C basics | 1-2 weeks | - |
| Watch app UI | 1 week | 2-3 days |
| Phone-watch communication | 1 week | 3-4 days |
| TrailTrackerXP integration | 3-4 days | 1-2 days |
| Testing & polish | 1 week | 3-4 days |
| **Total** | **4-6 weeks** | **2-3 weeks** |

---

## Alternative: Use Garmin's Built-in Tracking

The Venu 4 has excellent built-in activity tracking. You could:

1. **Track on watch natively** → Sync to Garmin Connect
2. **Import Garmin data into TrailTrackerXP** using Garmin Health API
3. Get the best of both worlds without building a companion app

This reverses the flow but might be simpler:
- Watch does the GPS tracking (better battery, always on wrist)
- TrailTrackerXP imports and analyzes the data with your achievements/challenges

---

## Next Steps

Would you like me to:

1. **Create a starter Connect IQ project** with basic watch UI and phone communication scaffolding?

2. **Add notification-based status updates** to TrailTrackerXP as a simpler first step?

3. **Implement Garmin Health API import** to pull activities from your watch into TrailTrackerXP?

4. **Research existing React Native Garmin libraries** to see what's already available?

Let me know which direction interests you most!
