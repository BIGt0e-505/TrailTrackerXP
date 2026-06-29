# TrailTracker Quick Start Guide

## Fastest Way to Get Running

### 1. Install Prerequisites (One-time Setup)

```bash
# Install Node.js from https://nodejs.org (if not already installed)

# Install Expo CLI globally
npm install -g expo-cli

# Install Expo Go app on your Android phone from Google Play Store
```

### 2. Install the App

```bash
cd TrailTracker
npm install
```

### 3. Add Icon and Splash Images

Create two simple images and place in the `assets/` folder:
- `icon.png` (1024x1024) - App icon
- `splash.png` (1284x2778) - Splash screen

**Quick tip**: You can use any simple colored images as placeholders, or use a free tool like [Canva](https://www.canva.com/) to create them.

### 4. Run the App

```bash
npm start
```

This opens Expo DevTools in your browser with a QR code.

### 5. Open on Your Phone

1. Open Expo Go app on your Android phone
2. Scan the QR code from the Expo DevTools
3. Grant location permissions when prompted
4. Start tracking!

## Without Internet (For Map Tiles)

The app requires internet for loading map tiles during activities. The OpenStreetMap tiles are loaded on-demand and don't require an API key.

If you want offline maps, you would need to:
1. Pre-cache tiles (advanced)
2. Use a different mapping solution
3. Or just ensure you have mobile data/WiFi when tracking

## Key Features to Try First

1. **Track Tab**: 
   - Select Walking or Biking
   - For walking, enable "Paths" to see footpaths/bridleways
   - Hit "Start Tracking"
   - Go for a walk/ride
   - Hit "Stop & Save"

2. **Calendar Tab**:
   - View all your activities by date
   - Tap a date to see details
   - Delete activities if needed

3. **Stats Tab**:
   - See accumulated mileage
   - Switch between Week/Month/Year/All Time
   - View separate stats for walking vs biking

## Common First-Time Issues

**"Location permission denied"**
- Go to Android Settings > Apps > Expo Go > Permissions
- Enable Location with "Allow all the time"

**"Map not showing"**
- Ensure you have internet connection
- Map tiles load on-demand from OpenStreetMap

**"Can't install packages"**
- Make sure you ran `npm install` in the TrailTracker folder
- Try deleting `node_modules/` and running `npm install` again

**"Expo DevTools won't open"**
- Try `expo start --tunnel` for alternative connection method
- Or use `expo start --localhost` if on same WiFi network

## Next Steps

Once you've tracked a few activities:

1. Check the **README.md** for detailed features
2. Consider adding a Google Maps API key for better map performance (optional)
3. Customize colors and settings in the code if desired
4. Build a standalone APK for installation without Expo Go

## Building Standalone APK (Optional)

For a production app that doesn't need Expo Go:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account (create free account if needed)
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

Download the APK from the Expo dashboard and install on your Android device.

## Support

- **Expo Docs**: https://docs.expo.dev/
- **React Native Maps**: https://github.com/react-native-maps/react-native-maps
- **OpenStreetMap**: https://www.openstreetmap.org/

Happy tracking! 🎯🚶🚴
