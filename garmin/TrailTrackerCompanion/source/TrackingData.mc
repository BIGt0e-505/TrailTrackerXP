using Toybox.System;
using Toybox.Math;

class TrackingData {
    var isConnected = false;
    var lastUpdate = 0;
    
    var isTracking = false;
    var isPaused = false;
    
    var activityType = "walking";
    var distanceUnit = "miles";  // "miles" or "km"
    
    var distance = 0.0;    // Always stored in the unit from phone
    var duration = 0;
    var speed = 0.0;       // Always stored in the unit from phone
    var altitude = 0.0;    // Always stored in the unit from phone
    
    function initialize() {
        isConnected = false;
        isTracking = false;
        isPaused = false;
        activityType = "walking";
        distanceUnit = "miles";
        distance = 0.0;
        duration = 0;
        speed = 0.0;
        altitude = 0.0;
    }
    
    function toggleActivityType() {
        if (activityType.equals("walking")) {
            activityType = "biking";
        } else {
            activityType = "walking";
        }
        System.println("Activity type changed to: " + activityType);
    }
    
    function getFormattedDuration() {
        var hours = duration / 3600;
        var mins = (duration % 3600) / 60;
        var secs = duration % 60;
        
        return hours.format("%02d") + ":" + mins.format("%02d") + ":" + secs.format("%02d");
    }
    
    function getFormattedDistance() {
        var unit = distanceUnit.equals("km") ? " km" : " mi";
        if (distance < 10) {
            return distance.format("%.2f") + unit;
        } else {
            return distance.format("%.1f") + unit;
        }
    }
    
    function getFormattedSpeed() {
        var unit = distanceUnit.equals("km") ? " km/h" : " mph";
        return speed.format("%.1f") + unit;
    }
    
    function getFormattedPace() {
        if (speed <= 0) {
            return "--:--";
        }
        var paceMinutes = 60.0 / speed;
        var mins = paceMinutes.toNumber();
        var secs = ((paceMinutes - mins) * 60).toNumber();
        var unit = distanceUnit.equals("km") ? " /km" : " /mi";
        return mins.format("%d") + ":" + secs.format("%02d") + unit;
    }
    
    function getFormattedAltitude() {
        var unit = distanceUnit.equals("km") ? " m" : " ft";
        return altitude.format("%.0f") + unit;
    }
    
    // Get progress toward next km or mile (0.0 to 1.0)
    function getProgressToNextUnit() {
        var fractional = distance - distance.toNumber();
        return fractional;
    }
    
    // Simulate data for testing in simulator when not connected
    function simulateData() {
        if (!isConnected && isTracking && !isPaused) {
            duration += 1;
            if (activityType.equals("walking")) {
                speed = 3.2 + (Math.rand() % 10) / 10.0;
                distance += speed / 3600.0;
            } else {
                speed = 12.5 + (Math.rand() % 30) / 10.0;
                distance += speed / 3600.0;
            }
            if (distanceUnit.equals("km")) {
                altitude = 260.0 + (Math.rand() % 30) - 15;
            } else {
                altitude = 850.0 + (Math.rand() % 100) - 50;
            }
        }
    }
}
