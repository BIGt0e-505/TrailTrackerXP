# Garmin Watch Integration Setup Guide

This guide explains how to enable communication between TrailTrackerXP and your Garmin Venu 4 watch.

## Prerequisites

1. **Garmin Connect Mobile** app installed on your phone
2. **Garmin watch paired** with your phone via Garmin Connect
3. **TrailTrackerCompanion** app installed on your watch

---

## Step 1: Download Garmin Connect IQ Mobile SDK

1. Go to: https://developer.garmin.com/connect-iq/sdk/
2. Download the **Connect IQ Mobile SDK for Android**
3. Extract the ZIP file
4. Find the file: `connectiq-mobile-sdk-android-x.x.x.aar`

---

## Step 2: Add SDK to Your Project

1. Create a `libs` folder in your Android app directory:
   ```
   android/app/libs/
   ```

2. Copy the `.aar` file into that folder:
   ```
   android/app/libs/connectiq-mobile-sdk-android-x.x.x.aar
   ```

3. Edit `android/app/build.gradle` and add in the `dependencies` section:
   ```gradle
   dependencies {
       // ... existing dependencies ...
       
       // Garmin Connect IQ SDK
       implementation files('libs/connectiq-mobile-sdk-android-x.x.x.aar')
   }
   ```
   
   Replace `x.x.x` with the actual version number of the AAR file.

---

## Step 3: Add Native Module Files

Copy these files to `android/app/src/main/java/com/trailtrackerxp/`:

1. **GarminBridgeModule.java** - The main native module
2. **GarminBridgePackage.java** - Package registration

---

## Step 4: Register the Native Module

Edit `android/app/src/main/java/com/trailtrackerxp/MainApplication.java`:

Find the `getPackages()` method and add the Garmin package:

```java
import com.trailtrackerxp.GarminBridgePackage; // Add this import

// In the getPackages() method, add:
packages.add(new GarminBridgePackage());
```

**Full example:**
```java
@Override
protected List<ReactPackage> getPackages() {
    List<ReactPackage> packages = new PackageList(this).getPackages();
    packages.add(new GarminBridgePackage()); // Add this line
    return packages;
}
```

---

## Step 5: Add JavaScript Bridge

Copy `garminBridge.js` to your `utils/` folder.

---

## Step 6: Update TrackingScreen.js

Add these changes to your TrackingScreen.js:

### Import the bridge:
```javascript
import garminBridge from '../utils/garminBridge';
```

### Initialize on mount (inside the first useEffect):
```javascript
// Initialize Garmin bridge
garminBridge.initialize().then((success) => {
  if (success) {
    console.log('Garmin bridge ready');
    
    // Handle commands from watch
    garminBridge.onWatchCommand((command, data) => {
      handleWatchCommand(command, data);
    });
  }
});
```

### Add the command handler function:
```javascript
const handleWatchCommand = (command, data) => {
  console.log('Watch command received:', command);
  
  switch (command) {
    case 'start':
      if (!isTracking) {
        if (data?.activityType) {
          setActivityType(data.activityType);
        }
        startTracking();
      }
      break;
    case 'pause':
      if (isTracking && !isPaused) {
        pauseTracking();
      }
      break;
    case 'resume':
      if (isTracking && isPaused) {
        resumeTracking();
      }
      break;
    case 'save':
      if (isTracking) {
        saveTracking();
      }
      break;
    case 'discard':
      if (isTracking) {
        confirmDiscard();
      }
      break;
    case 'setActivity':
      if (!isTracking && data?.activityType) {
        setActivityType(data.activityType);
      }
      break;
  }
};
```

### Send updates to watch (add a new useEffect):
```javascript
// Send tracking data to Garmin watch
useEffect(() => {
  if (!garminBridge.isAvailable()) return;
  
  const interval = setInterval(() => {
    garminBridge.sendTrackingUpdate({
      isTracking,
      isPaused,
      activityType,
      distance: distanceUnit === 'km' ? distance * 1.60934 : distance,
      duration,
      speed: currentSpeed,
      altitude: currentAltitude,
    });
  }, 2000); // Update every 2 seconds
  
  return () => clearInterval(interval);
}, [isTracking, isPaused, activityType, distance, duration, currentSpeed, currentAltitude]);
```

### Cleanup on unmount (add to the return function in first useEffect):
```javascript
return () => {
  // ... existing cleanup ...
  garminBridge.cleanup();
};
```

---

## Step 7: Rebuild the App

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

Or use your existing build process.

---

## Testing

1. Make sure Garmin Connect Mobile is running on your phone
2. Ensure your watch is connected (check Garmin Connect app)
3. Open TrailTrackerCompanion on your watch
4. Start TrailTrackerXP on your phone
5. You should see the connection dot turn green on the watch

### Test Commands:
- **On watch**: Press SELECT to start → should start tracking on phone
- **On phone**: Start tracking → watch should show data updating
- **On watch**: Press SELECT again → stop menu appears
- **On watch**: Save/Discard → should reflect on phone

---

## Troubleshooting

### Watch shows orange dot (not connected)
- Ensure Garmin Connect Mobile is running
- Check that watch is paired in Garmin Connect app
- Try restarting both apps

### "App not installed" error
- Make sure TrailTrackerCompanion.prg is installed on the watch
- The app ID must match: `a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4`

### Build errors
- Ensure the AAR file path is correct in build.gradle
- Check that Java package names match: `com.trailtrackerxp`

### Messages not sending
- Check Android logs: `adb logcat | grep GarminBridge`
- Ensure both apps are in foreground initially

---

## File Summary

| File | Location | Action |
|------|----------|--------|
| `connectiq-mobile-sdk-android-x.x.x.aar` | `android/app/libs/` | Download from Garmin |
| `GarminBridgeModule.java` | `android/app/src/main/java/com/trailtrackerxp/` | Add new |
| `GarminBridgePackage.java` | `android/app/src/main/java/com/trailtrackerxp/` | Add new |
| `MainApplication.java` | `android/app/src/main/java/com/trailtrackerxp/` | Modify |
| `build.gradle` | `android/app/` | Modify |
| `garminBridge.js` | `utils/` | Add new |
| `TrackingScreen.js` | `screens/` | Modify |
