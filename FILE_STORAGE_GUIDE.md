# TrailTrackerXP File Storage System

## Version 0.3.0 - File Storage & Strava Import Update

This update adds persistent file-based storage to protect your activity data from being lost, plus the ability to import your Strava history.

## Key Features

### 1. Dual Storage System
- **Cache Storage (AsyncStorage)**: Fast access for daily use
- **File Storage (DocumentDirectory)**: Persistent backup that survives app updates

### 2. Automatic Backup
All new activities are automatically saved to both storage systems when you complete a tracking session.

### 3. Recovery Option
If your cache data is ever lost or corrupted, you can restore it from the file storage backup.

### 4. Strava Import
Import your entire Strava activity history from a Strava data export.

### 5. Strava-Compatible Format
Activity data is stored in a format compatible with Strava exports.

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

## Importing from Strava

### Step 1: Export Your Strava Data
1. Go to Strava.com → Settings → My Account
2. Click "Download or Delete Your Account" → "Get Started"
3. Click "Request Your Archive"
4. Wait for the email with your download link (can take a few hours)
5. Download and unzip the export file

### Step 2: Prepare Files for Import
From your Strava export, you need:
- All `.gpx` files from the `activities/` folder
- (Optional) `activities.csv` - contains metadata like activity type, distance, elevation

### Step 3: Copy Files to Import Folder
Copy the files to your phone's TrailTrackerXP import folder:
```
/Android/data/com.trailtrackerxp.app/files/import/
```

You can use a file manager app or connect via USB.

### Step 4: Import in App
1. Go to **Settings > Data Storage > Import from Strava**
2. The app will show how many GPX files it found
3. Tap "Import X Activities"
4. Wait for the import to complete

### Import Notes
- Activities will be classified as "Walk" or "Ride" based on Strava type
- If `activities.csv` is included, metadata (distance, elevation, etc.) will be used
- If only GPX files are provided, stats will be calculated from GPS data
- The import folder is cleared after successful import

## Technical Details

### File Locations
Files are stored in the app's document directory:
```
/activities/activities.json    - Activity summaries (Strava-compatible format)
/activities/streams/{id}.json  - GPS track data for each activity
/activities/gamification.json  - XP, achievements, and challenges
/import/                       - Place Strava GPX files here for import
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

## Troubleshooting

### Activities Not Appearing After Update
1. First check Settings > Cache > View Storage Status
2. If activities show "in cache only", use "Save to File Storage"
3. If activities show "in file storage only", use "Recover from File Storage"

### Progress Shows 0 Miles But XP Exists
This can happen if the cache was partially corrupted. Use "Recover from File Storage" to restore your activity data.

### File Storage Shows 0 Activities
Your existing activities are still in cache. Use "Save to File Storage" to back them up.

### Strava Import Shows 0 GPX Files
Make sure you copied the GPX files to the correct folder. The import folder path is shown in the import dialog.

### Some Strava Activities Failed to Import
- Check that the GPX file isn't corrupted
- Some very old Strava activities may have incomplete data
- The error log shows which files failed

## Changelog

### v0.3.0
- Added file-based persistent storage system
- Added Strava GPX import functionality
- Added Strava-compatible data format
- Added Settings UI for data management:
  - Save to File Storage
  - Recover from File Storage  
  - Create Backup File
  - Import from Strava
  - View Storage Status
- Automatic dual-write: activities now save to both cache and file storage
- Added expo-sharing for backup file export
