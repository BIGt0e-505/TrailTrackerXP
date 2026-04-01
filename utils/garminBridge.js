/**
 * Garmin Connect IQ Bridge for TrailTrackerXP
 * 
 * This module handles communication between TrailTrackerXP and the
 * Garmin watch companion app via Garmin Connect Mobile.
 * 
 * Requires:
 * - Garmin Connect Mobile app installed on the phone
 * - TrailTrackerCompanion app installed on the Garmin watch
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { GarminBridge } = NativeModules;

class GarminBridgeManager {
  constructor() {
    this.isInitialized = false;
    this.isConnected = false;
    this.eventEmitter = null;
    this.listeners = {
      onConnect: [],
      onDisconnect: [],
      onCommand: [],
      onError: [],
    };
    this.commandCallback = null;
  }

  /**
   * Initialize the Garmin bridge
   * Call this once when the app starts
   */
  async initialize() {
    if (Platform.OS !== 'android') {
      console.log('GarminBridge: iOS not yet supported');
      return false;
    }

    if (!GarminBridge) {
      console.log('GarminBridge: Native module not available');
      return false;
    }

    try {
      await GarminBridge.initialize();
      
      // Set up event listener
      this.eventEmitter = new NativeEventEmitter(GarminBridge);
      
      this.eventEmitter.addListener('onGarminConnected', () => {
        console.log('GarminBridge: Watch connected');
        this.isConnected = true;
        this.listeners.onConnect.forEach(cb => cb());
      });
      
      this.eventEmitter.addListener('onGarminDisconnected', () => {
        console.log('GarminBridge: Watch disconnected');
        this.isConnected = false;
        this.listeners.onDisconnect.forEach(cb => cb());
      });
      
      this.eventEmitter.addListener('onGarminMessage', (event) => {
        console.log('GarminBridge: Received command:', event.command);
        this.listeners.onCommand.forEach(cb => cb(event.command, event.data));
        if (this.commandCallback) {
          this.commandCallback(event.command, event.data);
        }
      });
      
      this.eventEmitter.addListener('onGarminError', (event) => {
        console.log('GarminBridge: Error:', event.message);
        this.listeners.onError.forEach(cb => cb(event.message));
      });
      
      this.isInitialized = true;
      console.log('GarminBridge: Initialized successfully');
      return true;
    } catch (error) {
      console.log('GarminBridge: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Send tracking data to the watch
   * Call this periodically during tracking (every 1-2 seconds)
   * 
   * @param {Object} data - Tracking data object
   * @param {boolean} data.isTracking - Whether tracking is active
   * @param {boolean} data.isPaused - Whether tracking is paused
   * @param {string} data.activityType - 'walking' or 'biking'
   * @param {string} data.distanceUnit - 'miles' or 'km'
   * @param {number} data.distance - Distance in the selected unit
   * @param {number} data.duration - Duration in seconds
   * @param {number} data.speed - Speed in the selected unit (mph or km/h)
   * @param {number} data.altitude - Altitude in the selected unit (ft or m)
   */
  async sendTrackingUpdate(data) {
    if (!this.isInitialized || !GarminBridge) {
      return false;
    }

    try {
      const payload = {
        isTracking: data.isTracking || false,
        isPaused: data.isPaused || false,
        activityType: data.activityType || 'walking',
        distanceUnit: data.distanceUnit || 'miles',
        distance: data.distance || 0,
        duration: data.duration || 0,
        speed: data.speed || 0,
        altitude: data.altitude || 0,
      };
      
      await GarminBridge.sendMessage(JSON.stringify(payload));
      return true;
    } catch (error) {
      console.log('GarminBridge: Failed to send update:', error);
      return false;
    }
  }

  /**
   * Register a callback for watch commands
   * Commands: 'start', 'stop', 'save', 'discard', 'pause', 'resume', 'setActivity'
   */
  onWatchCommand(callback) {
    this.commandCallback = callback;
  }

  /**
   * Add event listener
   * Events: 'onConnect', 'onDisconnect', 'onCommand', 'onError'
   */
  addEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  /**
   * Check if watch is connected
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Check if bridge is available
   */
  isAvailable() {
    return Platform.OS === 'android' && GarminBridge !== null;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners('onGarminConnected');
      this.eventEmitter.removeAllListeners('onGarminDisconnected');
      this.eventEmitter.removeAllListeners('onGarminMessage');
      this.eventEmitter.removeAllListeners('onGarminError');
    }
    this.commandCallback = null;
    this.isInitialized = false;
    this.isConnected = false;
  }
}

// Export singleton instance
export default new GarminBridgeManager();
