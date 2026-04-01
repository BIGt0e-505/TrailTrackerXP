using Toybox.Application;
using Toybox.WatchUi;
using Toybox.Communications;
using Toybox.System;
using Toybox.Lang;

// Global tracking data accessible throughout the app
var trackingData = null;

class TrailTrackerApp extends Application.AppBase {

    function initialize() {
        AppBase.initialize();
    }

    function onStart(state) {
        trackingData = new TrackingData();
        Communications.registerForPhoneAppMessages(method(:onPhoneMessage));
        System.println("TrailTrackerXP Companion started");
    }

    function onStop(state) {
    }

    // Handle incoming messages from TrailTrackerXP phone app
    function onPhoneMessage(msg as Communications.PhoneAppMessage) as Void {
        System.println("Received message from phone");
        
        var payload = msg.data;
        if (payload != null && payload instanceof Toybox.Lang.Dictionary) {
            var data = payload as Toybox.Lang.Dictionary;
            
            if (data.hasKey("isTracking")) {
                trackingData.isTracking = data["isTracking"] as Toybox.Lang.Boolean;
            }
            if (data.hasKey("isPaused")) {
                trackingData.isPaused = data["isPaused"] as Toybox.Lang.Boolean;
            }
            if (data.hasKey("activityType")) {
                trackingData.activityType = data["activityType"] as Toybox.Lang.String;
            }
            if (data.hasKey("distanceUnit")) {
                trackingData.distanceUnit = data["distanceUnit"] as Toybox.Lang.String;
            }
            if (data.hasKey("distance")) {
                trackingData.distance = (data["distance"] as Toybox.Lang.Number).toFloat();
            }
            if (data.hasKey("duration")) {
                trackingData.duration = data["duration"] as Toybox.Lang.Number;
            }
            if (data.hasKey("speed")) {
                trackingData.speed = (data["speed"] as Toybox.Lang.Number).toFloat();
            }
            if (data.hasKey("altitude")) {
                trackingData.altitude = (data["altitude"] as Toybox.Lang.Number).toFloat();
            }
            
            trackingData.isConnected = true;
            trackingData.lastUpdate = System.getTimer();
            
            WatchUi.requestUpdate();
        }
    }

    function getInitialView() {
        return [new TrailTrackerView(), new TrailTrackerDelegate()];
    }
}

// Send a command to the phone app
function sendCommandToPhone(command) {
    var data = {
        "command" => command,
        "activityType" => trackingData.activityType
    };
    
    Communications.transmit(data, null, new CommListener());
    System.println("Sent command to phone: " + command);
}

class CommListener extends Communications.ConnectionListener {
    function initialize() {
        ConnectionListener.initialize();
    }
    
    function onComplete() {
        System.println("Message sent successfully");
    }
    
    function onError() {
        System.println("Failed to send message");
    }
}
