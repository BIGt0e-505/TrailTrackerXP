using Toybox.WatchUi;
using Toybox.Graphics;
using Toybox.System;

class TrailTrackerDelegate extends WatchUi.BehaviorDelegate {

    function initialize() {
        BehaviorDelegate.initialize();
    }
    
    function onSelect() {
        System.println("SELECT pressed");
        
        if (trackingData.isTracking) {
            trackingData.isPaused = true;
            WatchUi.pushView(new StopMenuView(), new StopMenuDelegate(), WatchUi.SLIDE_UP);
        } else {
            trackingData.isTracking = true;
            trackingData.isPaused = false;
            sendCommandToPhone("start");
            WatchUi.requestUpdate();
        }
        
        return true;
    }
    
    function onPreviousPage() {
        if (!trackingData.isTracking) {
            trackingData.toggleActivityType();
            sendCommandToPhone("setActivity");
            WatchUi.requestUpdate();
        }
        return true;
    }
    
    function onNextPage() {
        if (!trackingData.isTracking) {
            trackingData.toggleActivityType();
            sendCommandToPhone("setActivity");
            WatchUi.requestUpdate();
        }
        return true;
    }
    
    function onBack() {
        if (trackingData.isTracking) {
            trackingData.isPaused = !trackingData.isPaused;
            if (trackingData.isPaused) {
                sendCommandToPhone("pause");
            } else {
                sendCommandToPhone("resume");
            }
            WatchUi.requestUpdate();
            return true;
        }
        return false;
    }
    
    function onTap(clickEvent) {
        return onSelect();
    }
    
    function onSwipe(swipeEvent) {
        var dir = swipeEvent.getDirection();
        if (!trackingData.isTracking && (dir == WatchUi.SWIPE_UP || dir == WatchUi.SWIPE_DOWN)) {
            trackingData.toggleActivityType();
            sendCommandToPhone("setActivity");
            WatchUi.requestUpdate();
            return true;
        }
        return false;
    }
}

// Custom stop menu view
class StopMenuView extends WatchUi.View {
    
    var selectedIndex = 0;
    
    const COLOR_GREEN = 0x00E676;
    const COLOR_ORANGE = 0xFFAB00;
    const COLOR_RED = 0xFF5252;
    const COLOR_GRAY = 0x757575;
    const COLOR_WHITE = 0xFFFFFF;
    const COLOR_BLACK = 0x000000;
    const COLOR_HIGHLIGHT = 0x333333;
    
    function initialize() {
        View.initialize();
        selectedIndex = 0;
    }
    
    function onUpdate(dc) {
        var width = dc.getWidth();
        var height = dc.getHeight();
        var cx = width / 2;
        
        dc.setColor(COLOR_BLACK, COLOR_BLACK);
        dc.clear();
        
        // Title
        dc.setColor(COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, 50, Graphics.FONT_MEDIUM, "Activity", 
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
        
        // Menu items
        var items = ["Resume", "Save", "Discard"];
        var colors = [COLOR_GREEN, COLOR_WHITE, COLOR_RED];
        var startY = 130;
        var spacing = 70;
        
        for (var i = 0; i < 3; i++) {
            var y = startY + (i * spacing);
            
            if (i == selectedIndex) {
                dc.setColor(COLOR_HIGHLIGHT, Graphics.COLOR_TRANSPARENT);
                dc.fillRoundedRectangle(40, y - 25, width - 80, 50, 10);
            }
            
            dc.setColor(colors[i], Graphics.COLOR_TRANSPARENT);
            dc.drawText(cx, y, Graphics.FONT_MEDIUM, items[i], 
                Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
        }
    }
    
    function setSelectedIndex(index) {
        selectedIndex = index;
        WatchUi.requestUpdate();
    }
    
    function getSelectedIndex() {
        return selectedIndex;
    }
}

// Delegate for custom stop menu
class StopMenuDelegate extends WatchUi.BehaviorDelegate {
    
    function initialize() {
        BehaviorDelegate.initialize();
    }
    
    function onPreviousPage() {
        var view = WatchUi.getCurrentView()[0];
        if (view instanceof StopMenuView) {
            var idx = view.getSelectedIndex();
            if (idx > 0) {
                view.setSelectedIndex(idx - 1);
            }
        }
        return true;
    }
    
    function onNextPage() {
        var view = WatchUi.getCurrentView()[0];
        if (view instanceof StopMenuView) {
            var idx = view.getSelectedIndex();
            if (idx < 2) {
                view.setSelectedIndex(idx + 1);
            }
        }
        return true;
    }
    
    function onSelect() {
        var view = WatchUi.getCurrentView()[0];
        if (view instanceof StopMenuView) {
            var idx = view.getSelectedIndex();
            
            if (idx == 0) {
                trackingData.isPaused = false;
                sendCommandToPhone("resume");
            } else if (idx == 1) {
                sendCommandToPhone("save");
                trackingData.isTracking = false;
                trackingData.isPaused = false;
                trackingData.distance = 0.0;
                trackingData.duration = 0;
                trackingData.speed = 0.0;
            } else if (idx == 2) {
                sendCommandToPhone("discard");
                trackingData.isTracking = false;
                trackingData.isPaused = false;
                trackingData.distance = 0.0;
                trackingData.duration = 0;
                trackingData.speed = 0.0;
            }
            
            WatchUi.popView(WatchUi.SLIDE_DOWN);
        }
        return true;
    }
    
    function onBack() {
        trackingData.isPaused = false;
        WatchUi.popView(WatchUi.SLIDE_DOWN);
        return true;
    }
    
    function onTap(clickEvent) {
        var y = clickEvent.getCoordinates()[1];
        var view = WatchUi.getCurrentView()[0];
        
        if (view instanceof StopMenuView) {
            if (y >= 105 && y < 175) {
                view.setSelectedIndex(0);
                return onSelect();
            } else if (y >= 175 && y < 245) {
                view.setSelectedIndex(1);
                return onSelect();
            } else if (y >= 245 && y < 315) {
                view.setSelectedIndex(2);
                return onSelect();
            }
        }
        return true;
    }
}
