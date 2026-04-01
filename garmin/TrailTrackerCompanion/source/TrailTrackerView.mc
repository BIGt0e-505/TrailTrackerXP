using Toybox.WatchUi;
using Toybox.Graphics;
using Toybox.System;
using Toybox.Timer;
using Toybox.Math;

class TrailTrackerView extends WatchUi.View {
    
    var updateTimer = null;
    var walkingIcon = null;
    var bikingIcon = null;
    
    // Colors for AMOLED display
    const COLOR_GREEN = 0x00E676;
    const COLOR_ORANGE = 0xFFAB00;
    const COLOR_RED = 0xFF5252;
    const COLOR_BLUE = 0x448AFF;
    const COLOR_GRAY = 0x757575;
    const COLOR_DARK_GRAY = 0x333333;
    const COLOR_DARK_BG = 0x000000;
    const COLOR_WHITE = 0xFFFFFF;
    
    // Progress arc settings
    const ARC_RADIUS = 190;      // Just inside the edge
    const ARC_WIDTH = 6;         // Thickness of the arc
    const ARC_START = 90;        // Start at 12 o'clock (90 degrees in Garmin coords)
    
    // Venu 4 41mm: 390x390 pixels, round display
    
    function initialize() {
        View.initialize();
    }

    function onLayout(dc) {
        // Load activity icons
        walkingIcon = WatchUi.loadResource(Rez.Drawables.WalkingIcon);
        bikingIcon = WatchUi.loadResource(Rez.Drawables.BikingIcon);
    }

    function onShow() {
        updateTimer = new Timer.Timer();
        updateTimer.start(method(:onTimer), 1000, true);
    }
    
    function onHide() {
        if (updateTimer != null) {
            updateTimer.stop();
            updateTimer = null;
        }
    }
    
    function onTimer() as Void {
        if (trackingData != null) {
            trackingData.simulateData();
        }
        WatchUi.requestUpdate();
    }

    function onUpdate(dc) {
        var width = dc.getWidth();
        var height = dc.getHeight();
        var cx = width / 2;
        var cy = height / 2;
        
        // Clear with black background
        dc.setColor(COLOR_DARK_BG, COLOR_DARK_BG);
        dc.clear();
        
        if (trackingData == null) {
            dc.setColor(COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
            dc.drawText(cx, cy, Graphics.FONT_MEDIUM, "Loading...", 
                Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
            return;
        }
        
        // Draw progress arc (behind everything else)
        drawProgressArc(dc, cx, cy);
        
        // Draw activity icon and type
        drawActivityType(dc, cx, 55);
        
        // Draw status
        drawStatus(dc, cx, 100);
        
        // Draw main stats
        drawDistance(dc, cx, 170);
        drawDuration(dc, cx, 255);
        
        // Draw secondary stats
        drawSecondaryStats(dc, cx, 330, width);
        
        // Draw connection indicator
        drawConnectionDot(dc, width);
    }
    
    function drawProgressArc(dc, cx, cy) {
        // Background arc (dark gray, full circle)
        dc.setColor(COLOR_DARK_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.setPenWidth(ARC_WIDTH);
        dc.drawArc(cx, cy, ARC_RADIUS, Graphics.ARC_CLOCKWISE, 0, 360);
        
        // Progress arc (colored based on activity)
        if (trackingData.isTracking) {
            var progress = trackingData.getProgressToNextUnit();
            if (progress > 0) {
                var color = trackingData.activityType.equals("walking") ? COLOR_GREEN : COLOR_BLUE;
                dc.setColor(color, Graphics.COLOR_TRANSPARENT);
                
                // Calculate arc sweep (progress 0-1 maps to 0-360 degrees)
                var sweepDegrees = (progress * 360).toNumber();
                if (sweepDegrees > 0) {
                    // Garmin draws arcs counterclockwise by default
                    // Start at top (90 degrees) and sweep clockwise
                    var endAngle = ARC_START - sweepDegrees;
                    if (endAngle < 0) {
                        endAngle += 360;
                    }
                    dc.drawArc(cx, cy, ARC_RADIUS, Graphics.ARC_CLOCKWISE, ARC_START, endAngle);
                }
            }
        }
        
        // Reset pen width
        dc.setPenWidth(1);
    }
    
    function drawActivityType(dc, cx, y) {
        var isWalking = trackingData.activityType.equals("walking");
        var color = isWalking ? COLOR_GREEN : COLOR_BLUE;
        var text = isWalking ? "WALKING" : "BIKING";
        var icon = isWalking ? walkingIcon : bikingIcon;
        
        // Draw icon to the left of text
        if (icon != null) {
            var iconX = cx - 110;
            var iconY = y - 15;  // Center vertically
            dc.drawBitmap(iconX, iconY, icon);
        }
        
        // Draw activity text
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx + 15, y, Graphics.FONT_MEDIUM, text, 
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
    }
    
    function drawStatus(dc, cx, y) {
        var text = "READY";
        var color = COLOR_GRAY;
        
        if (trackingData.isTracking) {
            if (trackingData.isPaused) {
                text = "PAUSED";
                color = COLOR_ORANGE;
            } else {
                text = "TRACKING";
                color = COLOR_GREEN;
            }
        }
        
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, y, Graphics.FONT_SMALL, text, 
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
    }
    
    function drawDistance(dc, cx, y) {
        dc.setColor(COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, y, Graphics.FONT_NUMBER_MEDIUM, trackingData.getFormattedDistance(), 
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
    }
    
    function drawDuration(dc, cx, y) {
        dc.setColor(COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, y, Graphics.FONT_NUMBER_MILD, trackingData.getFormattedDuration(), 
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
    }
    
    function drawSecondaryStats(dc, cx, y, width) {
        dc.setColor(COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        
        // Left stat: Pace or Speed
        var leftX = 140;
        var leftText = trackingData.activityType.equals("walking") 
            ? trackingData.getFormattedPace() 
            : trackingData.getFormattedSpeed();
        dc.drawText(leftX, y, Graphics.FONT_TINY, leftText, 
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
        
        // Right stat: Altitude
        var rightX = width - 130;
        dc.drawText(rightX, y, Graphics.FONT_TINY, trackingData.getFormattedAltitude(), 
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
    }
    
    function drawConnectionDot(dc, width) {
        var x = width - 45;
        var y = 45;
        var color = trackingData.isConnected ? COLOR_GREEN : COLOR_ORANGE;
        
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(x, y, 8);
    }
}
