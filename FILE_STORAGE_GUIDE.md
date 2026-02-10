# TrailTrackerXP File Storage System

## Version 0.3.0 - File Storage Update

This update adds persistent file-based storage to protect your activity data from being lost when the app cache is cleared or corrupted.

## Key Features

### 1. Dual Storage System
- **Cache Storage (AsyncStorage)**: Fast access for daily use
- **File Storage (DocumentDirectory)**: Persistent backup that survives app updates

### 2. Automatic Backup
All new activities are automatically saved to both storage systems when you complete a tracking session.

### 3. Recovery Option
If your cache data is ever lost or corrupted, you can restore it from the file storage backup.

### 4. Strava-Compatible Format
Activity data is stored in a format compatible with Strava exports, making future Strava data import possible.

## How to Use

### Save Existing Activities to File Storage
After updating to v0.3.0, go to **Settings > Data Storage > Save to File Storage** to backup your existing activities from cache to file storage.

### Check Storage Status
Go to **Settings > Cache > View Storage Status** to see:
- How many activities are in cache vs file storage
- Whether any activities need to be synced

### Recover Lost Data
If you notice your activities are missing:
1. Go to **Settings > Data Storage > Recover from File Storage**
2. This will restore activities from the file backup to your cache

### Create Backup File
To export all your data to a shareable file:
1. Go to **Settings > Data Storage > Create Backup File**
2. A JSON file will be created and you can share it via email, cloud storage, etc.

## Technical Details

### File Locations
Files are stored in the app's document directory:
```
/activities/activities.json    - Activity summaries (Strava-compatible format)
/activities/streams/{id}.json  - GPS track data for each activity
/activities/gamification.json  - XP, achievements, and challenges
/export/                       - Backup files created by "Create Backup File"
```

### Data Format (Strava-Compatible)

Activities are stored with Strava-compatible field names:
- `distance`: meters (Strava standard)
- `elapsed_time`: seconds
- `moving_time`: seconds
- `total_elevation_gain`: meters
- `start_date_local`: ISO 8601 timestamp
- `type`/`sport_type`: "Walk", "Ride", etc.
- `start_latlng`/`end_latlng`: [latitude, longitude]

GPS streams follow Strava's format:
- `latlng`: Array of [lat, lng] pairs
- `time`: Seconds from activity start
- `distance`: Cumulative distance in meters
- `altitude`: Elevation in meters

### Future Strava Import
The Strava-compatible format means that when Strava import is added in a future update, you'll be able to import your Strava activity history directly into TrailTrackerXP.

## Troubleshooting

### Activities Not Appearing After Update
1. First check Settings > Cache > View Storage Status
2. If activities show "in cache only", use "Save to File Storage"
3. If activities show "in file storage only", use "Recover from File Storage"

### Progress Shows 0 Miles But XP Exists
This can happen if the cache was partially corrupted. Use "Recover from File Storage" to restore your activity data.

### File Storage Shows 0 Activities
Your existing activities are still in cache. Use "Save to File Storage" to back them up.

## Changelog

### v0.3.0
- Added file-based persistent storage system
- Added Strava-compatible data format
- Added Settings UI for data management:
  - Save to File Storage
  - Recover from File Storage
  - Create Backup File
  - View Storage Status
- Automatic dual-write: activities now save to both cache and file storage
- Added expo-sharing for backup file export
