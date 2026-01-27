# TrackingScreen.js Changes for Garmin Integration

This file shows the exact changes needed in TrackingScreen.js.
Copy and paste these sections into the appropriate places.

---

## 1. Add Import (after other imports, around line 32)

```javascript
import garminBridge from '../utils/garminBridge';
```

---

## 2. Add garminInterval ref (after line 138: locationSubscription.current)

```javascript
  const garminInterval = useRef(null);
```

---

## 3. Add Garmin initialization (inside the first useEffect, after line 147)

Replace this section:

```javascript
  useEffect(() => {
    checkFirstRun();
    requestPermissions();
    backgroundDistanceUnit = distanceUnit;
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      deactivateKeepAwake();
    };
  }, []);
```

With this:

```javascript
  useEffect(() => {
    checkFirstRun();
    requestPermissions();
    backgroundDistanceUnit = distanceUnit;
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Initialize Garmin bridge
    garminBridge.initialize().then((success) => {
      if (success) {
        console.log('Garmin bridge initialized');
        
        // Handle commands from watch
        garminBridge.onWatchCommand((command, data) => {
          handleWatchCommand(command, data);
        });
      }
    });
    
    return () => {
      subscription.remove();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (garminInterval.current) {
        clearInterval(garminInterval.current);
      }
      garminBridge.cleanup();
      deactivateKeepAwake();
    };
  }, []);
```

---

## 4. Add handleWatchCommand function (after completeSetup function, around line 184)

```javascript
  // Handle commands from Garmin watch
  const handleWatchCommand = (command, data) => {
    console.log('Watch command received:', command, data);
    
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
          setIsPaused(true);
          setShowPauseModal(true);
        }
        break;
      case 'resume':
        if (isTracking && isPaused) {
          setIsPaused(false);
          setShowPauseModal(false);
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
      default:
        console.log('Unknown watch command:', command);
    }
  };
```

---

## 5. Add Garmin update useEffect (after the existing useEffects, around line 260)

```javascript
  // Send tracking data to Garmin watch periodically
  useEffect(() => {
    // Clear any existing interval
    if (garminInterval.current) {
      clearInterval(garminInterval.current);
      garminInterval.current = null;
    }
    
    // Only send updates if Garmin is available
    if (!garminBridge.isAvailable()) {
      return;
    }
    
    // Send update immediately
    const sendUpdate = () => {
      // Convert distance to miles if needed (watch always shows miles)
      const distanceInMiles = distanceUnit === 'km' ? distance / 1.60934 : distance;
      // Convert altitude to feet if needed
      const altitudeInFeet = distanceUnit === 'km' ? currentAltitude * 3.28084 : currentAltitude;
      // Convert speed to mph
      const speedInMph = distanceUnit === 'km' ? currentSpeed / 1.60934 : currentSpeed;
      
      garminBridge.sendTrackingUpdate({
        isTracking,
        isPaused,
        activityType,
        distance: distanceInMiles,
        duration,
        speed: speedInMph,
        altitude: altitudeInFeet,
      });
    };
    
    // Send initial update
    sendUpdate();
    
    // Set up interval for continuous updates
    garminInterval.current = setInterval(sendUpdate, 2000);
    
    return () => {
      if (garminInterval.current) {
        clearInterval(garminInterval.current);
        garminInterval.current = null;
      }
    };
  }, [isTracking, isPaused, activityType, distance, duration, currentSpeed, currentAltitude, distanceUnit]);
```

---

## Summary of Changes

1. **Line ~32**: Add import for garminBridge
2. **Line ~139**: Add garminInterval ref
3. **Line ~142-159**: Modify first useEffect to init Garmin and cleanup
4. **Line ~185**: Add handleWatchCommand function
5. **Line ~260**: Add new useEffect for sending updates to watch

---

## Quick Test

After making these changes and rebuilding:

1. Open TrailTrackerXP on phone
2. Open TrailTrackerCompanion on watch
3. Check Android logs: `adb logcat | grep -i garmin`
4. You should see "Garmin bridge initialized" if everything is working

The watch should show:
- Orange dot → Garmin Connect not available or app not found
- Green dot → Connected and ready
- Live data → When phone app is tracking
