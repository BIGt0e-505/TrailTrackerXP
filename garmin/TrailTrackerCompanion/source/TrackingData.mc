using Toybox.System;
using Toybox.Math;

class TrackingData {
    var isConnected = false;
    var lastUpdate = 0;
    
    var isTracking = false;
    var isPaused = false;
    
    var activityType = "walking";
    
    var distance = 0.0;
    var duration = 0;
    var speed = 0.0;
    var altitude = 0.0;
    
    function initialize() {
        isConnected = false;
        isTracking = false;
        isPaused = false;
        activityType = "walking";
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
        if (distance < 10) {
            return distance.format("%.2f") + " mi";
        } else {
            return distance.format("%.1f") + " mi";
        }
    }
    
    function getFormattedSpeed() {
        return speed.format("%.1f") + " mph";
    }
    
    function getFormattedPace() {
        if (speed <= 0) {
            return "--:--";
        }
        var paceMinutes = 60.0 / speed;
        var mins = paceMinutes.toNumber();
        var secs = ((paceMinutes - mins) * 60).toNumber();
        return mins.format("%d") + ":" + secs.format("%02d") + " /mi";
    }
    
    function getFormattedAltitude() {
        return altitude.format("%.0f") + " ft";
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
            altitude = 850.0 + (Math.rand() % 100) - 50;
        }
    }
}
