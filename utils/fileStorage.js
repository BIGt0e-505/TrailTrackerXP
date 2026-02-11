/**
 * File-based storage for TrailTrackerXP activities
 * 
 * This module provides persistent file storage for activity data,
 * using a format compatible with Strava exports to enable future import/export.
 * 
 * Data is stored in the app's document directory which persists across app updates
 * and can only be cleared by uninstalling the app or manually clearing app data.
 * 
 * File Structure:
 * - /activities/activities.json - Main activity index (summary data)
 * - /activities/streams/{id}.json - Individual activity streams (GPS/sensor data)
 * - /export/trailtrackerxp_export_{date}.json - Full export files
 */

import * as FileSystem from 'expo-file-system';

// File paths
const ACTIVITIES_DIR = `${FileSystem.documentDirectory}activities/`;
const STREAMS_DIR = `${FileSystem.documentDirectory}activities/streams/`;
const EXPORT_DIR = `${FileSystem.documentDirectory}export/`;
const ACTIVITIES_INDEX_FILE = `${ACTIVITIES_DIR}activities.json`;
const GAMIFICATION_FILE = `${ACTIVITIES_DIR}gamification.json`;

// Strava-compatible activity types mapping
// TrailTrackerXP uses: 'walking', 'biking'
// Strava uses: 'Walk', 'Ride', 'Run', 'MountainBikeRide', etc.
export const ACTIVITY_TYPE_MAP = {
  // TrailTrackerXP -> Strava
  walking: 'Walk',
  biking: 'Ride',
  // Strava -> TrailTrackerXP (for import)
  Walk: 'walking',
  Run: 'walking', // Map runs to walking for now
  Hike: 'walking',
  Ride: 'biking',
  MountainBikeRide: 'biking',
  GravelRide: 'biking',
  EBikeRide: 'biking',
  VirtualRide: 'biking',
};

/**
 * Initialize the file storage directories
 */
export const initFileStorage = async () => {
  try {
    // Create directories if they don't exist
    const activitiesDirInfo = await FileSystem.getInfoAsync(ACTIVITIES_DIR);
    if (!activitiesDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(ACTIVITIES_DIR, { intermediates: true });
      console.log('Created activities directory');
    }

    const streamsDirInfo = await FileSystem.getInfoAsync(STREAMS_DIR);
    if (!streamsDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(STREAMS_DIR, { intermediates: true });
      console.log('Created streams directory');
    }

    const exportDirInfo = await FileSystem.getInfoAsync(EXPORT_DIR);
    if (!exportDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(EXPORT_DIR, { intermediates: true });
      console.log('Created export directory');
    }

    // Initialize activities index if it doesn't exist
    const indexInfo = await FileSystem.getInfoAsync(ACTIVITIES_INDEX_FILE);
    if (!indexInfo.exists) {
      await FileSystem.writeAsStringAsync(
        ACTIVITIES_INDEX_FILE,
        JSON.stringify({ activities: [], version: 1, lastUpdated: new Date().toISOString() })
      );
      console.log('Created activities index file');
    }

    return true;
  } catch (error) {
    console.error('Error initializing file storage:', error);
    return false;
  }
};

/**
 * Convert TrailTrackerXP activity to Strava-compatible format
 * This makes it easier to import Strava data later
 */
export const toStravaFormat = (activity) => {
  return {
    // Strava standard fields
    id: activity.id,
    name: activity.name || `${activity.type === 'walking' ? 'Walk' : 'Ride'} - ${new Date(activity.timestamp).toLocaleDateString()}`,
    type: ACTIVITY_TYPE_MAP[activity.type] || 'Walk',
    sport_type: ACTIVITY_TYPE_MAP[activity.type] || 'Walk',
    start_date: activity.timestamp,
    start_date_local: activity.timestamp,
    distance: (activity.distance || 0) * 1000, // Convert km to meters (Strava uses meters)
    moving_time: Math.round(activity.movingTime || activity.duration || 0), // seconds
    elapsed_time: Math.round(activity.duration || 0), // seconds
    total_elevation_gain: activity.elevationGain || 0, // meters
    elev_high: activity.maxAltitude || null,
    elev_low: activity.minAltitude || null,
    start_latlng: activity.routeData?.[0] 
      ? [activity.routeData[0].latitude, activity.routeData[0].longitude] 
      : null,
    end_latlng: activity.routeData?.length > 0
      ? [activity.routeData[activity.routeData.length - 1].latitude, 
         activity.routeData[activity.routeData.length - 1].longitude]
      : null,
    average_speed: activity.avgSpeed ? activity.avgSpeed / 3.6 : null, // Convert km/h to m/s
    max_speed: activity.maxSpeed ? activity.maxSpeed / 3.6 : null, // Convert km/h to m/s
    
    // TrailTrackerXP specific fields (preserved for our use)
    _trailtrackerxp: {
      version: 1,
      original_type: activity.type,
      elevation_loss: activity.elevationLoss || 0,
      distance_km: activity.distance || 0,
      avg_speed_kmh: activity.avgSpeed || 0,
      max_speed_kmh: activity.maxSpeed || 0,
    },
  };
};

/**
 * Convert Strava format back to TrailTrackerXP format
 */
export const fromStravaFormat = (stravaActivity) => {
  // If it has TrailTrackerXP specific data, use that
  const ttxpData = stravaActivity._trailtrackerxp || {};
  
  return {
    id: stravaActivity.id?.toString() || Date.now().toString(),
    timestamp: stravaActivity.start_date_local || stravaActivity.start_date || new Date().toISOString(),
    type: ttxpData.original_type || ACTIVITY_TYPE_MAP[stravaActivity.sport_type] || ACTIVITY_TYPE_MAP[stravaActivity.type] || 'walking',
    distance: ttxpData.distance_km ?? (stravaActivity.distance / 1000), // Convert meters to km
    duration: stravaActivity.elapsed_time || 0,
    movingTime: stravaActivity.moving_time || stravaActivity.elapsed_time || 0,
    elevationGain: stravaActivity.total_elevation_gain || 0,
    elevationLoss: ttxpData.elevation_loss || 0,
    maxAltitude: stravaActivity.elev_high || null,
    minAltitude: stravaActivity.elev_low || null,
    avgSpeed: ttxpData.avg_speed_kmh ?? (stravaActivity.average_speed ? stravaActivity.average_speed * 3.6 : null),
    maxSpeed: ttxpData.max_speed_kmh ?? (stravaActivity.max_speed ? stravaActivity.max_speed * 3.6 : null),
    name: stravaActivity.name,
  };
};

/**
 * Convert route/GPS data to Strava-compatible stream format
 */
export const toStravaStreams = (routeData) => {
  if (!routeData || routeData.length === 0) return null;

  const startTime = routeData[0].timestamp;
  
  return {
    latlng: {
      data: routeData.map(p => [p.latitude, p.longitude]),
      series_type: 'distance',
      original_size: routeData.length,
      resolution: 'high',
    },
    time: {
      data: routeData.map(p => Math.round((p.timestamp - startTime) / 1000)),
      series_type: 'distance',
      original_size: routeData.length,
      resolution: 'high',
    },
    distance: {
      data: routeData.map(p => (p.cumulativeDistance || 0) * 1000), // km to meters
      series_type: 'distance',
      original_size: routeData.length,
      resolution: 'high',
    },
    altitude: {
      data: routeData.map(p => p.altitude || 0),
      series_type: 'distance',
      original_size: routeData.length,
      resolution: 'high',
    },
  };
};

/**
 * Convert Strava streams back to TrailTrackerXP route data format
 */
export const fromStravaStreams = (streams, startTimestamp) => {
  if (!streams || !streams.latlng?.data) return [];

  const startTime = new Date(startTimestamp).getTime();
  
  return streams.latlng.data.map((coords, index) => ({
    latitude: coords[0],
    longitude: coords[1],
    timestamp: startTime + (streams.time?.data[index] || 0) * 1000,
    altitude: streams.altitude?.data[index] || 0,
    cumulativeDistance: (streams.distance?.data[index] || 0) / 1000, // meters to km
  }));
};

/**
 * Load all activities from file storage
 */
export const loadActivitiesFromFile = async () => {
  try {
    await initFileStorage();
    
    const content = await FileSystem.readAsStringAsync(ACTIVITIES_INDEX_FILE);
    const data = JSON.parse(content);
    
    // Convert from Strava format to TrailTrackerXP format
    return (data.activities || []).map(fromStravaFormat);
  } catch (error) {
    console.error('Error loading activities from file:', error);
    return [];
  }
};

/**
 * Load a single activity with its stream data (GPS track)
 */
export const loadActivityWithStreams = async (activityId) => {
  try {
    await initFileStorage();
    
    // Load activity index
    const content = await FileSystem.readAsStringAsync(ACTIVITIES_INDEX_FILE);
    const data = JSON.parse(content);
    
    const stravaActivity = data.activities.find(a => a.id?.toString() === activityId?.toString());
    if (!stravaActivity) return null;
    
    const activity = fromStravaFormat(stravaActivity);
    
    // Load stream data if it exists
    const streamFile = `${STREAMS_DIR}${activityId}.json`;
    const streamInfo = await FileSystem.getInfoAsync(streamFile);
    
    if (streamInfo.exists) {
      const streamContent = await FileSystem.readAsStringAsync(streamFile);
      const streams = JSON.parse(streamContent);
      activity.routeData = fromStravaStreams(streams, activity.timestamp);
    }
    
    return activity;
  } catch (error) {
    console.error('Error loading activity with streams:', error);
    return null;
  }
};

/**
 * Save an activity to file storage
 */
export const saveActivityToFile = async (activity) => {
  try {
    await initFileStorage();
    
    // Load current activities
    const content = await FileSystem.readAsStringAsync(ACTIVITIES_INDEX_FILE);
    const data = JSON.parse(content);
    
    // Convert to Strava format (without route data - that goes in streams)
    const stravaActivity = toStravaFormat(activity);
    
    // Check if activity already exists
    const existingIndex = data.activities.findIndex(
      a => a.id?.toString() === activity.id?.toString()
    );
    
    if (existingIndex >= 0) {
      data.activities[existingIndex] = stravaActivity;
    } else {
      data.activities.push(stravaActivity);
    }
    
    data.lastUpdated = new Date().toISOString();
    
    // Save activities index
    await FileSystem.writeAsStringAsync(
      ACTIVITIES_INDEX_FILE,
      JSON.stringify(data, null, 2)
    );
    
    // Save stream data separately if route data exists
    if (activity.routeData && activity.routeData.length > 0) {
      const streams = toStravaStreams(activity.routeData);
      await FileSystem.writeAsStringAsync(
        `${STREAMS_DIR}${activity.id}.json`,
        JSON.stringify(streams, null, 2)
      );
    }
    
    console.log(`Activity ${activity.id} saved to file storage`);
    return true;
  } catch (error) {
    console.error('Error saving activity to file:', error);
    return false;
  }
};

/**
 * Delete an activity from file storage
 */
export const deleteActivityFromFile = async (activityId) => {
  try {
    await initFileStorage();
    
    // Load and update activities index
    const content = await FileSystem.readAsStringAsync(ACTIVITIES_INDEX_FILE);
    const data = JSON.parse(content);
    
    data.activities = data.activities.filter(
      a => a.id?.toString() !== activityId?.toString()
    );
    data.lastUpdated = new Date().toISOString();
    
    await FileSystem.writeAsStringAsync(
      ACTIVITIES_INDEX_FILE,
      JSON.stringify(data, null, 2)
    );
    
    // Delete stream file if it exists
    const streamFile = `${STREAMS_DIR}${activityId}.json`;
    const streamInfo = await FileSystem.getInfoAsync(streamFile);
    if (streamInfo.exists) {
      await FileSystem.deleteAsync(streamFile);
    }
    
    console.log(`Activity ${activityId} deleted from file storage`);
    return true;
  } catch (error) {
    console.error('Error deleting activity from file:', error);
    return false;
  }
};

/**
 * Save gamification data to file storage
 */
export const saveGamificationToFile = async (gamificationData) => {
  try {
    await initFileStorage();
    
    await FileSystem.writeAsStringAsync(
      GAMIFICATION_FILE,
      JSON.stringify(gamificationData, null, 2)
    );
    
    return true;
  } catch (error) {
    console.error('Error saving gamification to file:', error);
    return false;
  }
};

/**
 * Load gamification data from file storage
 */
export const loadGamificationFromFile = async () => {
  try {
    await initFileStorage();
    
    const fileInfo = await FileSystem.getInfoAsync(GAMIFICATION_FILE);
    if (!fileInfo.exists) {
      return null;
    }
    
    const content = await FileSystem.readAsStringAsync(GAMIFICATION_FILE);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading gamification from file:', error);
    return null;
  }
};

/**
 * Export all data from AsyncStorage cache to file storage
 * This is the migration function for existing users
 */
export const exportCacheToFileStorage = async (cacheActivities, gamificationData) => {
  try {
    await initFileStorage();
    
    let exportedCount = 0;
    let skippedCount = 0;
    
    // Load existing file activities to avoid duplicates
    const existingActivities = await loadActivitiesFromFile();
    const existingIds = new Set(existingActivities.map(a => a.id?.toString()));
    
    for (const activity of cacheActivities) {
      // Skip if already in file storage
      if (existingIds.has(activity.id?.toString())) {
        skippedCount++;
        continue;
      }
      
      await saveActivityToFile(activity);
      exportedCount++;
    }
    
    // Save gamification data to file
    if (gamificationData) {
      await saveGamificationToFile(gamificationData);
    }
    
    console.log(`Export complete: ${exportedCount} new activities, ${skippedCount} skipped (already exist)`);
    
    return {
      success: true,
      exportedCount,
      skippedCount,
      totalInFile: existingActivities.length + exportedCount,
    };
  } catch (error) {
    console.error('Error exporting cache to file storage:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create a full export file (Strava-compatible JSON)
 * This can be used for backup or sharing
 */
export const createFullExport = async () => {
  try {
    await initFileStorage();
    
    // Load activities index (just metadata, not streams)
    const content = await FileSystem.readAsStringAsync(ACTIVITIES_INDEX_FILE);
    const data = JSON.parse(content);
    
    // Load gamification data
    const gamificationData = await loadGamificationFromFile();
    
    // Build export in chunks to reduce memory pressure
    // Process activities in smaller batches
    const BATCH_SIZE = 20;
    const allActivitiesData = [];
    
    for (let i = 0; i < data.activities.length; i += BATCH_SIZE) {
      const batch = data.activities.slice(i, i + BATCH_SIZE);
      
      for (const activity of batch) {
        const streamFile = `${STREAMS_DIR}${activity.id}.json`;
        const streamInfo = await FileSystem.getInfoAsync(streamFile);
        
        const activityData = { ...activity };
        
        // Only include stream data if it exists
        // This significantly reduces memory usage
        if (streamInfo.exists) {
          const streamContent = await FileSystem.readAsStringAsync(streamFile);
          const streams = JSON.parse(streamContent);
          
          // Only include essential stream data to reduce size
          // Keep route data but subsample if very large
          if (streams.routeData && streams.routeData.length > 500) {
            // Subsample to every 5th point for large routes to save memory
            activityData.streams = {
              routeData: streams.routeData.filter((_, idx) => idx % 5 === 0)
            };
          } else {
            activityData.streams = streams;
          }
        }
        
        allActivitiesData.push(activityData);
      }
      
      // Clear batch from memory
      batch.length = 0;
    }
    
    // Create export object
    const exportData = {
      version: 1,
      app: 'TrailTrackerXP',
      exported_at: new Date().toISOString(),
      activities: allActivitiesData,
      gamification: gamificationData,
    };
    
    // Write export file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const exportFile = `${EXPORT_DIR}trailtrackerxp_export_${timestamp}.json`;
    
    // Convert to JSON string - this is where OOM can occur
    const jsonString = JSON.stringify(exportData, null, 2);
    await FileSystem.writeAsStringAsync(exportFile, jsonString);
    
    return {
      success: true,
      filePath: exportFile,
      activityCount: allActivitiesData.length,
    };
  } catch (error) {
    console.error('Error creating full export:', error);
    
    // If OOM, provide a helpful error message
    if (error.message && error.message.includes('OutOfMemoryError')) {
      return {
        success: false,
        error: 'Not enough memory to create backup. Try clearing some app data first or backing up fewer activities.',
      };
    }
    
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get storage statistics
 */
export const getStorageStats = async () => {
  try {
    await initFileStorage();
    
    const content = await FileSystem.readAsStringAsync(ACTIVITIES_INDEX_FILE);
    const data = JSON.parse(content);
    
    // Get size of all stream files
    const streamFiles = await FileSystem.readDirectoryAsync(STREAMS_DIR);
    let streamTotalSize = 0;
    
    for (const file of streamFiles) {
      const info = await FileSystem.getInfoAsync(`${STREAMS_DIR}${file}`);
      streamTotalSize += info.size || 0;
    }
    
    // Get size of activities index
    const indexInfo = await FileSystem.getInfoAsync(ACTIVITIES_INDEX_FILE);
    
    return {
      activityCount: data.activities?.length || 0,
      streamFileCount: streamFiles.length,
      indexSizeBytes: indexInfo.size || 0,
      streamsSizeBytes: streamTotalSize,
      totalSizeBytes: (indexInfo.size || 0) + streamTotalSize,
      lastUpdated: data.lastUpdated,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      activityCount: 0,
      error: error.message,
    };
  }
};

/**
 * Verify data integrity between cache and file storage
 */
export const verifyDataIntegrity = async (cacheActivities) => {
  try {
    const fileActivities = await loadActivitiesFromFile();
    
    const cacheIds = new Set(cacheActivities.map(a => a.id?.toString()));
    const fileIds = new Set(fileActivities.map(a => a.id?.toString()));
    
    const inCacheOnly = cacheActivities.filter(a => !fileIds.has(a.id?.toString()));
    const inFileOnly = fileActivities.filter(a => !cacheIds.has(a.id?.toString()));
    const inBoth = cacheActivities.filter(a => fileIds.has(a.id?.toString()));
    
    return {
      cacheCount: cacheActivities.length,
      fileCount: fileActivities.length,
      inCacheOnly: inCacheOnly.length,
      inFileOnly: inFileOnly.length,
      synchronized: inBoth.length,
      needsSync: inCacheOnly.length > 0,
      activitiesInCacheOnly: inCacheOnly,
      activitiesInFileOnly: inFileOnly,
    };
  } catch (error) {
    console.error('Error verifying data integrity:', error);
    return {
      error: error.message,
    };
  }
};

/**
 * Sync all cache activities to file storage
 * Call this when the app starts to ensure file storage is up to date
 */
export const syncCacheToFile = async (cacheActivities) => {
  try {
    const integrity = await verifyDataIntegrity(cacheActivities);
    
    if (integrity.needsSync) {
      console.log(`Syncing ${integrity.inCacheOnly} activities from cache to file...`);
      
      for (const activity of integrity.activitiesInCacheOnly) {
        await saveActivityToFile(activity);
      }
      
      console.log('Sync complete');
    }
    
    return {
      synced: integrity.inCacheOnly,
      totalInFile: integrity.fileCount + integrity.inCacheOnly,
    };
  } catch (error) {
    console.error('Error syncing cache to file:', error);
    return { error: error.message };
  }
};

/**
 * Recover activities from file storage to cache
 * Use this when cache data is lost/corrupted
 */
export const recoverFromFileStorage = async () => {
  try {
    // Load activities with their route data
    const content = await FileSystem.readAsStringAsync(ACTIVITIES_INDEX_FILE);
    const data = JSON.parse(content);
    
    const recoveredActivities = [];
    
    for (const stravaActivity of data.activities) {
      const activity = fromStravaFormat(stravaActivity);
      
      // Load stream data
      const streamFile = `${STREAMS_DIR}${activity.id}.json`;
      const streamInfo = await FileSystem.getInfoAsync(streamFile);
      
      if (streamInfo.exists) {
        const streamContent = await FileSystem.readAsStringAsync(streamFile);
        const streams = JSON.parse(streamContent);
        activity.routeData = fromStravaStreams(streams, activity.timestamp);
      }
      
      recoveredActivities.push(activity);
    }
    
    console.log(`Recovered ${recoveredActivities.length} activities from file storage`);
    
    return {
      success: true,
      activities: recoveredActivities,
      count: recoveredActivities.length,
    };
  } catch (error) {
    console.error('Error recovering from file storage:', error);
    return {
      success: false,
      error: error.message,
      activities: [],
    };
  }
};
