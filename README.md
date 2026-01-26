# TrailTracker - Personal Activity Tracking App

A standalone Android app for tracking walking and mountain biking activities with GPS, built with React Native and Expo.

## Features

### Core Functionality
- **Activity Tracking**: Record walks and bike rides with GPS tracking
- **Live Map View**: Real-time route display during activities
- **Path Overlay**: OpenStreetMap overlay showing footpaths, bridleways, and trails (for walking)
- **Activity Types**: Separate tracking for walking and biking
- **Offline Storage**: All data stored locally on device using AsyncStorage

### Calendar View
- Visual calendar showing all your activities
- Multi-dot markers indicating multiple activities per day
- Different colors for walking (blue) and biking (red)
- Tap any date to see detailed activity list
- Delete activities directly from calendar view

### Statistics Dashboard
- **Time Windows**: View stats for week, month, year, or all-time
- **Activity Summaries**: 
  - Total activities, distance, and duration
  - Separate stats for walking and biking
  - Average distance and pace/speed per activity
- **Recent Activities**: Quick view of your last 5 activities

### Tracking Features
- Distance calculation using GPS coordinates
- Duration timer
- Live pace/speed display
- Route visualization on map
- Screen stays awake during tracking
- Start/stop controls

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Expo CLI**: Install globally with `npm install -g expo-cli`
4. **Android Device or Emulator**:
   - Physical Android device with Expo Go app installed
   - OR Android Studio with emulator

## Installation

### 1. Install Dependencies

```bash
cd TrailTracker
npm install
```

### 2. Add Assets

Create or add the following image files to the `assets/` folder:
- `icon.png` - App icon (1024x1024px)
- `splash.png` - Splash screen (1284x2778px)

You can use simple colored images as placeholders if needed.

### 3. Configure Google Maps (Optional but Recommended)

For better map performance:

1. Get a Google Maps API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Maps SDK for Android"
   - Create credentials (API Key)
   - Restrict the key to Android apps

2. Update `app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
       }
     }
   }
   ```

Note: The app will work without a Google Maps API key using OpenStreetMap tiles, but may have performance limitations.

## Running the App

### Development Mode

```bash
# Start the Expo development server
npm start
# or
expo start
```

This will open the Expo DevTools in your browser.

### Run on Physical Android Device

1. Install [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from Google Play Store
2. Run `npm start` or `expo start`
3. Scan the QR code with the Expo Go app
4. Grant location permissions when prompted

### Run on Android Emulator

1. Set up Android emulator in Android Studio
2. Start the emulator
3. Run:
   ```bash
   npm run android
   # or
   expo start --android
   ```

## Building for Production

### Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android --profile preview
```

The APK will be downloadable from the Expo dashboard. Install it directly on your Android device.

### Alternative: Local Build

```bash
expo build:android
```

Follow the prompts to create a standalone APK.

## Usage Guide

### Starting an Activity

1. Open the app and go to the **Track** tab
2. Choose activity type (Walking or Biking)
3. For walking, toggle the **Paths overlay** to see footpaths and bridleways
4. Tap **Start Tracking**
5. Grant location permissions if prompted
6. Your route will be displayed in real-time
7. View live stats: distance, duration, and pace

### Stopping an Activity

1. Tap **Stop & Save**
2. Activity is automatically saved to local storage
3. View it immediately in the Calendar or Stats tabs

### Viewing Activities

**Calendar View:**
- Navigate to the **Calendar** tab
- Days with activities show colored dots
- Tap any date to see activities for that day
- Tap the trash icon to delete an activity

**Statistics View:**
- Navigate to the **Stats** tab
- Select time window (Week, Month, Year, All Time)
- View comprehensive statistics for both activity types
- See recent activities list

### Map Features

**During Walking:**
- OpenStreetMap overlay shows footpaths, bridleways, and trails
- Toggle paths on/off with the map overlay button
- Blue route line shows your current path

**During Biking:**
- Standard map view
- Red route line shows your current route
- No path overlay (optimized for road/trail riding)

## Technical Details

### Data Storage
- All activities stored locally using AsyncStorage
- No external servers or cloud sync
- Data persists across app restarts
- Manual export/backup not currently implemented

### GPS Accuracy
- Uses high-accuracy GPS (expo-location)
- Updates every 2 seconds or every 5 meters
- Distance calculated using Haversine formula
- Route smoothing applied for cleaner paths

### Map Provider
- Primary: OpenStreetMap tiles (free, no API key required)
- Optional: Google Maps (better performance with API key)
- Paths overlay uses OpenStreetMap data

### Permissions Required
- **Location (Always)**: For GPS tracking during activities
- **Foreground Service**: Keeps tracking active when screen is locked

## Troubleshooting

### Location Not Working
1. Ensure location services are enabled on device
2. Grant "Allow all the time" permission for background tracking
3. Check that GPS signal is available (may not work well indoors)

### Map Not Loading
1. Check internet connection (required for map tiles)
2. If using Google Maps, verify API key is correct
3. Try restarting the app

### Activities Not Saving
1. Check device storage space
2. Try force-closing and reopening the app
3. Verify permissions are granted

### Poor GPS Accuracy
1. Ensure clear view of sky (GPS works poorly indoors/under cover)
2. Wait a few moments for GPS to acquire signal
3. Consider using high-accuracy mode in device settings

## Customization

### Changing Colors
Edit styles in each screen file:
- Walking color: `#1976D2` (blue)
- Biking color: `#D32F2F` (red)
- Primary color: `#2E7D32` (green)

### Adjusting GPS Update Frequency
In `TrackingScreen.js`, modify:
```javascript
{
  accuracy: Location.Accuracy.High,
  timeInterval: 2000, // milliseconds
  distanceInterval: 5, // meters
}
```

### Adding More Statistics
Extend the stats calculations in `StatsScreen.js` to include:
- Elevation gain (requires additional GPS data)
- Calories burned
- Monthly/yearly comparisons

## Privacy & Data

- **No data collection**: All data stays on your device
- **No analytics**: No tracking or telemetry
- **No accounts**: No sign-up or login required
- **No cloud sync**: Data never leaves your device
- **Offline capable**: Works without internet (except map tiles)

## Future Enhancements

Potential features to add:
- Export activities to GPX/KML
- Import from other apps
- Elevation tracking
- Heart rate monitor integration
- Social sharing
- Goals and achievements
- Cloud backup (optional)

## License

This is a personal project. Feel free to modify and customize for your own use.

## Support

For issues or questions, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [OpenStreetMap](https://www.openstreetmap.org/)

## Version History

**v0.2.4** - Initial Release
- GPS tracking for walking and biking
- Calendar view with activity markers
- Statistics dashboard with time windows
- OpenStreetMap overlay for footpaths
- Local storage with AsyncStorage
