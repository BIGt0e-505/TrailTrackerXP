using Toybox.WatchUi;
using Toybox.Graphics;
using Toybox.System;
using Toybox.Timer;

class TrailTrackerView extends WatchUi.View {
    
    var updateTimer = null;
    
    // Colors for AMOLED display
    const COLOR_GREEN = 0x00E676;
    const COLOR_ORANGE = 0xFFAB00;
    const COLOR_RED = 0xFF5252;
    const COLOR_BLUE = 0x448AFF;
    const COLOR_GRAY = 0x757575;
    const COLOR_DARK_BG = 0x000000;
    const COLOR_WHITE = 0xFFFFFF;
    
    // Venu 4 41mm: 390x390 pixels, round display
    
    function initialize() {
        View.initialize();
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
        
        dc.setColor(COLOR_DARK_BG, COLOR_DARK_BG);
        dc.clear();
        
        if (trackingData == null) {
            dc.setColor(COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
            dc.drawText(cx, cy, Graphics.FONT_MEDIUM, "Loading...", 
                Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
            return;
        }
        
        // Layout: y=55, 95, 165, 260, 335
        drawActivityType(dc, cx, 55);
        drawStatus(dc, cx, 95);
        drawDistance(dc, cx, 165);
        drawDuration(dc, cx, 260);
        drawSecondaryStats(dc, cx, 335, width);
        drawConnectionDot(dc, width);
    }
    
    function drawActivityType(dc, cx, y) {
        var text = trackingData.activityType.equals("walking") ? "WALKING" : "BIKING";
        var color = trackingData.activityType.equals("walking") ? COLOR_GREEN : COLOR_BLUE;
        
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, y, Graphics.FONT_MEDIUM, text, 
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
    
    // Bottom stats with user's preferred spacing (leftX=130, rightX=width-130)
    function drawSecondaryStats(dc, cx, y, width) {
        dc.setColor(COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        
        var leftX = 130;
        var leftText = trackingData.activityType.equals("walking") 
            ? trackingData.getFormattedPace() 
            : trackingData.getFormattedSpeed();
        dc.drawText(leftX, y, Graphics.FONT_TINY, leftText, 
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
        
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
