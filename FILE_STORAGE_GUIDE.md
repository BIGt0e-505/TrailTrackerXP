# TrailTrackerXP File Storage System

## Version 0.3.1 - GPX-Based File Storage

This update uses GPX format for persistent file storage, making your activity data compatible with Strava and other fitness apps.

## Key Features

### 1. GPX File Storage
- **Each activity saved as individual GPX file**: Standard format readable by any fitness app
- **Automatic save on completion**: Activities are saved to GPX immediately when finished
- **Same format as Strava exports**: Easy to backup and restore

### 2. Dual Storage System
- **Cache Storage (AsyncStorage)**: Fast access for daily use
- **GPX File Storage (DocumentDirectory)**: Persistent backup that survives app updates

### 3. Recovery Option
If your cache data is ever lost or corrupted, you can restore it from the saved GPX files.

### 4. Strava Import
Import your entire Strava activity history from a Strava data export.

## How to Use

### Save Existing Activities to GPX Files
Go to **Settings > Data Storage > Save to GPX Files** to save any activities that haven't been saved as GPX files yet.

### Check Storage Status
The Settings screen shows:
- How many GPX files exist
- How many activities in cache need to be saved as GPX

### Recover Lost Data
If you notice your activities are missing:
1. Go to **Settings > Data Storage > Recover from GPX Files**
2. This will restore activities from the GPX files to your cache

### Export GPX Files
To share your activity GPX files:
1. Go to **Settings > Data Storage > Export GPX Files**
2. The share dialog will open allowing you to save, email, or transfer your GPX files
3. GPX files can be imported into Strava, Garmin Connect, or any fitness app

## Importing from Strava

### Step 1: Export Your Strava Data
1. Go to Strava.com → Settings → My Account
2. Click "Download or Delete Your Account" → "Get Started"
3. Click "Request Your Archive"
4. Wait for the email with your download link (can take a few hours)
5. Download and unzip the export file

### Step 2: Import into TrailTrackerXP
1. Go to **Settings > Data Storage > Import from Strava**
2. Tap **"Select GPX Files"** and navigate to your Strava export's `activities` folder
3. Select all the `.gpx` files you want to import
4. (Optional) Tap **"+ Add activities.csv"** for better metadata
5. Tap **"Import X Activities"** and wait for completion

### Import Notes
- Activities will be classified as "Walk" or "Ride" based on GPX type
- Including `activities.csv` provides better metadata (activity names, accurate stats)
- Large imports (200+ files) may take a few minutes

## Technical Details

### File Locations
Files are stored in the app's document directory:
```
/activities/{id}.gpx          - Individual activity GPX files
/activities/gamification.json - XP, achievements, and challenges
/export/                      - Backup files created by "Create Backup File"
```

### GPX File Format

Each activity is stored as a standard GPX 1.1 file:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="TrailTrackerXP" version="1.1" ...>
 <metadata>
  <time>2024-01-15T10:30:00Z</time>
 </metadata>
 <trk>
  <name>Morning Walk</name>
  <type>walking</type>
  <trkseg>
   <trkpt lat="51.7301110" lon="0.4978880">
    <ele>21.3</ele>
    <time>2024-01-15T10:30:00Z</time>
   </trkpt>
   ...
  </trkseg>
 </trk>
</gpx>
```

- Activity name stored in `<name>` tag
- Activity type stored in `<type>` tag (walking/cycling)
- Each GPS point includes latitude, longitude, elevation, and timestamp
- Format matches Strava GPX exports

## Troubleshooting

### Activities Not Appearing After Update
1. Check Settings > Data Storage section
2. If activities show "X activities with GPS data not yet saved", use "Save to GPX Files"
3. If GPX files exist but cache is empty, use "Recover from GPX Files"

### Progress Shows 0 Miles But XP Exists
This can happen if the cache was cleared. Use "Recover from GPX Files" to restore your activity data.

### GPX Files Shows 0 Activities
Your existing activities may only be in cache. Use "Save to GPX Files" to save them.

### Activities Have No Route Data
Activities tracked without GPS (or before v0.3.0) won't have route data and can't be saved as GPX.

### Some Strava Activities Failed to Import
- Check that the GPX file isn't corrupted
- Some very old Strava activities may have incomplete data
- The error log shows which files failed

## Changelog

### v0.3.1
- **GPX-based file storage**: Activities now saved as individual GPX files
- Standard GPX 1.1 format compatible with Strava and other apps
- Automatic GPX save when activity completes
- Updated UI to show "GPX files" instead of "file storage"
- Same Strava import functionality

### v0.3.0
- Added file-based persistent storage system
- Added Strava GPX import functionality
- Added Settings UI for data management
