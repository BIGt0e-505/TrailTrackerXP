/**
 * Strava/GPX Import for TrailTrackerXP
 * 
 * This module imports activities from Strava export files.
 * 
 * Strava Export Structure:
 * - activities.csv - Metadata for all activities (type, distance, elevation, etc.)
 * - activities/*.gpx - GPS track data for each activity
 * 
 * Usage:
 * 1. Place activities.csv in the import folder
 * 2. Place all GPX files in the import folder
 * 3. Call importStravaActivities() from Settings
 */

import * as FileSystem from 'expo-file-system';
import { saveActivityToFile, saveGamificationToFile } from './fileStorage';
import { recalculateGamification } from './gamification';

// Import folder location
const IMPORT_DIR = `${FileSystem.documentDirectory}import/`;

// Strava activity type mapping
const STRAVA_TYPE_MAP = {
  'Ride': 'biking',
  'cycling': 'biking',
  'MountainBikeRide': 'biking',
  'GravelRide': 'biking',
  'EBikeRide': 'biking',
  'VirtualRide': 'biking',
  'Walk': 'walking',
  'walking': 'walking',
  'Run': 'walking',
  'running': 'walking',
  'Hike': 'walking',
  'hiking': 'walking',
};

/**
 * Initialize the import directory
 */
export const initImportDir = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMPORT_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMPORT_DIR, { intermediates: true });
      console.log('Created import directory');
    }
    return IMPORT_DIR;
  } catch (error) {
    console.error('Error creating import directory:', error);
    return null;
  }
};

/**
 * Parse GPX file content into route data
 */
export const parseGPX = (gpxContent) => {
  const routeData = [];
  
  try {
    // Extract activity name
    const nameMatch = gpxContent.match(/<n>([^<]+)<\/n>/);
    const name = nameMatch ? nameMatch[1] : null;
    
    // Extract activity type from GPX
    const typeMatch = gpxContent.match(/<type>([^<]+)<\/type>/);
    const gpxType = typeMatch ? typeMatch[1] : null;
    
    // Extract all track points
    const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>\s*(?:<ele>([^<]*)<\/ele>)?\s*(?:<time>([^<]*)<\/time>)?/g;
    
    let match;
    let cumulativeDistance = 0;
    let prevLat = null;
    let prevLon = null;
    
    while ((match = trkptRegex.exec(gpxContent)) !== null) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      const ele = match[3] ? parseFloat(match[3]) : 0;
      const time = match[4] ? new Date(match[4]).getTime() : Date.now();
      
      // Calculate cumulative distance
      if (prevLat !== null && prevLon !== null) {
        cumulativeDistance += haversineDistance(prevLat, prevLon, lat, lon);
      }
      
      routeData.push({
        latitude: lat,
        longitude: lon,
        altitude: ele,
        timestamp: time,
        cumulativeDistance: cumulativeDistance,
      });
      
      prevLat = lat;
      prevLon = lon;
    }
    
    return {
      name,
      type: gpxType,
      routeData,
    };
  } catch (error) {
    console.error('Error parsing GPX:', error);
    return { routeData: [], name: null, type: null };
  }
};

/**
 * Haversine distance calculation (returns km)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Parse activities.csv from Strava export
 */
export const parseActivitiesCSV = async (csvPath) => {
  try {
    const content = await FileSystem.readAsStringAsync(csvPath);
    const lines = content.split('\n');
    
    if (lines.length < 2) return [];
    
    // Parse header
    const header = parseCSVLine(lines[0]);
    const idIndex = header.indexOf('Activity ID');
    const dateIndex = header.indexOf('Activity Date');
    const nameIndex = header.indexOf('Activity Name');
    const typeIndex = header.indexOf('Activity Type');
    const filenameIndex = header.indexOf('Filename');
    
    // Find distance - there are two "Distance" columns, use the one with values (index ~17)
    let distanceIndex = -1;
    for (let i = 0; i < header.length; i++) {
      if (header[i] === 'Distance' && i > 10) {
        distanceIndex = i;
        break;
      }
    }
    
    // Similarly for Moving Time and Elapsed Time
    let movingTimeIndex = -1;
    let elapsedTimeIndex = -1;
    for (let i = 0; i < header.length; i++) {
      if (header[i] === 'Moving Time' && i > 10) movingTimeIndex = i;
      if (header[i] === 'Elapsed Time' && i > 10) elapsedTimeIndex = i;
    }
    
    const elevGainIndex = header.indexOf('Elevation Gain');
    const elevLossIndex = header.indexOf('Elevation Loss');
    const maxSpeedIndex = header.indexOf('Max Speed');
    const avgSpeedIndex = header.indexOf('Average Speed');
    
    const activities = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = parseCSVLine(lines[i]);
      
      const activityId = values[idIndex];
      const filename = values[filenameIndex];
      
      if (!activityId || !filename) continue;
      
      // Parse date - format: "7 May 2017, 09:59:01"
      const dateStr = values[dateIndex];
      let timestamp;
      try {
        // Convert "7 May 2017, 09:59:01" to parseable format
        timestamp = parseStravaDate(dateStr);
      } catch (e) {
        timestamp = new Date().toISOString();
      }
      
      const activityType = values[typeIndex] || 'Ride';
      
      activities.push({
        stravaId: activityId,
        filename: filename.replace('activities/', ''),
        name: values[nameIndex] || `${activityType} Activity`,
        type: STRAVA_TYPE_MAP[activityType] || 'walking',
        stravaType: activityType,
        timestamp: timestamp,
        distance: parseFloat(values[distanceIndex]) / 1000 || 0, // Convert m to km
        duration: parseFloat(values[elapsedTimeIndex]) || 0,
        movingTime: parseFloat(values[movingTimeIndex]) || 0,
        elevationGain: parseFloat(values[elevGainIndex]) || 0,
        elevationLoss: parseFloat(values[elevLossIndex]) || 0,
        maxSpeed: parseFloat(values[maxSpeedIndex]) * 3.6 || 0, // m/s to km/h
        avgSpeed: parseFloat(values[avgSpeedIndex]) * 3.6 || 0, // m/s to km/h
      });
    }
    
    return activities;
  } catch (error) {
    console.error('Error parsing activities.csv:', error);
    return [];
  }
};

/**
 * Parse a CSV line handling quoted fields
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values;
};

/**
 * Parse Strava date format: "7 May 2017, 09:59:01"
 */
const parseStravaDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString();
  
  // Remove quotes if present
  dateStr = dateStr.replace(/"/g, '').trim();
  
  // Parse "7 May 2017, 09:59:01" format
  const months = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d+),?\s+(\d+):(\d+):(\d+)/);
  if (match) {
    const [_, day, month, year, hour, min, sec] = match;
    const date = new Date(
      parseInt(year),
      months[month] || 0,
      parseInt(day),
      parseInt(hour),
      parseInt(min),
      parseInt(sec)
    );
    return date.toISOString();
  }
  
  // Fallback - try standard parsing
  return new Date(dateStr).toISOString();
};

/**
 * List GPX files in the import directory
 */
export const listImportFiles = async () => {
  try {
    await initImportDir();
    
    const files = await FileSystem.readDirectoryAsync(IMPORT_DIR);
    
    const gpxFiles = files.filter(f => f.endsWith('.gpx'));
    const csvFiles = files.filter(f => f.endsWith('.csv'));
    
    return {
      gpxFiles,
      csvFiles,
      hasActivitiesCSV: csvFiles.includes('activities.csv'),
      totalGPX: gpxFiles.length,
    };
  } catch (error) {
    console.error('Error listing import files:', error);
    return { gpxFiles: [], csvFiles: [], hasActivitiesCSV: false, totalGPX: 0 };
  }
};

/**
 * Import a single GPX file
 */
export const importGPXFile = async (filename, metadata = null) => {
  try {
    const gpxPath = `${IMPORT_DIR}${filename}`;
    const gpxContent = await FileSystem.readAsStringAsync(gpxPath);
    
    const parsed = parseGPX(gpxContent);
    
    if (parsed.routeData.length === 0) {
      return { success: false, error: 'No track points found in GPX' };
    }
    
    // Calculate stats from route data
    const startTime = parsed.routeData[0].timestamp;
    const endTime = parsed.routeData[parsed.routeData.length - 1].timestamp;
    const duration = (endTime - startTime) / 1000; // seconds
    const distance = parsed.routeData[parsed.routeData.length - 1].cumulativeDistance;
    
    // Calculate elevation
    let elevGain = 0;
    let elevLoss = 0;
    let minAlt = Infinity;
    let maxAlt = -Infinity;
    
    for (let i = 1; i < parsed.routeData.length; i++) {
      const diff = parsed.routeData[i].altitude - parsed.routeData[i-1].altitude;
      if (diff > 0) elevGain += diff;
      else elevLoss += Math.abs(diff);
      
      minAlt = Math.min(minAlt, parsed.routeData[i].altitude);
      maxAlt = Math.max(maxAlt, parsed.routeData[i].altitude);
    }
    
    // Determine activity type
    let type = 'walking';
    if (parsed.type) {
      type = STRAVA_TYPE_MAP[parsed.type] || 'walking';
    } else if (metadata?.type) {
      type = metadata.type;
    }
    
    // Create activity object
    const activity = {
      id: metadata?.stravaId || filename.replace('.gpx', ''),
      timestamp: new Date(startTime).toISOString(),
      name: metadata?.name || parsed.name || `Imported ${type === 'biking' ? 'Ride' : 'Walk'}`,
      type: type,
      distance: metadata?.distance || distance,
      duration: metadata?.duration || duration,
      movingTime: metadata?.movingTime || duration,
      elevationGain: metadata?.elevationGain || elevGain,
      elevationLoss: metadata?.elevationLoss || elevLoss,
      maxAltitude: maxAlt !== -Infinity ? maxAlt : null,
      minAltitude: minAlt !== Infinity ? minAlt : null,
      avgSpeed: metadata?.avgSpeed || (distance / (duration / 3600)),
      maxSpeed: metadata?.maxSpeed || null,
      routeData: parsed.routeData,
      importedFrom: 'strava',
      stravaId: metadata?.stravaId || null,
    };
    
    // Save to file storage
    await saveActivityToFile(activity);
    
    return { success: true, activity };
  } catch (error) {
    console.error(`Error importing ${filename}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Import all activities from Strava export
 * 
 * @param {Function} onProgress - Callback for progress updates (current, total)
 * @returns {Object} Import results
 */
export const importStravaActivities = async (onProgress = null) => {
  try {
    await initImportDir();
    
    const files = await listImportFiles();
    
    if (files.totalGPX === 0) {
      return {
        success: false,
        error: 'No GPX files found in import folder',
        imported: 0,
        failed: 0,
      };
    }
    
    // Load metadata from CSV if available
    let metadata = {};
    if (files.hasActivitiesCSV) {
      const activities = await parseActivitiesCSV(`${IMPORT_DIR}activities.csv`);
      activities.forEach(a => {
        metadata[a.filename] = a;
      });
      console.log(`Loaded metadata for ${Object.keys(metadata).length} activities`);
    }
    
    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors = [];
    
    for (let i = 0; i < files.gpxFiles.length; i++) {
      const filename = files.gpxFiles[i];
      
      if (onProgress) {
        onProgress(i + 1, files.gpxFiles.length, filename);
      }
      
      const activityMetadata = metadata[filename] || null;
      const result = await importGPXFile(filename, activityMetadata);
      
      if (result.success) {
        imported++;
      } else {
        failed++;
        errors.push({ file: filename, error: result.error });
      }
    }
    
    // Recalculate gamification after import
    if (imported > 0) {
      // Load all activities and recalculate
      const { loadActivitiesFromFile } = require('./fileStorage');
      const allActivities = await loadActivitiesFromFile();
      const gamification = await recalculateGamification(allActivities);
      await saveGamificationToFile(gamification);
    }
    
    return {
      success: true,
      imported,
      failed,
      skipped,
      total: files.totalGPX,
      errors: errors.slice(0, 10), // Only return first 10 errors
    };
  } catch (error) {
    console.error('Error importing Strava activities:', error);
    return {
      success: false,
      error: error.message,
      imported: 0,
      failed: 0,
    };
  }
};

/**
 * Clear import folder after successful import
 */
export const clearImportFolder = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMPORT_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(IMPORT_DIR, { idempotent: true });
      await initImportDir(); // Recreate empty folder
    }
    return true;
  } catch (error) {
    console.error('Error clearing import folder:', error);
    return false;
  }
};

/**
 * Get the import folder path for the user
 */
export const getImportFolderPath = () => {
  return IMPORT_DIR;
};
