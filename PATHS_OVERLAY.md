# OpenStreetMap Path Overlay Feature

## Overview

The TrailTracker app includes a special feature for walking activities that overlays OpenStreetMap tiles showing footpaths, bridleways, trails, and other walking routes. This helps you make real-time decisions about which paths to take during your walks.

## How It Works

### What You See

When the path overlay is enabled (walking mode only), the map displays:
- **Footpaths**: Narrow paths for pedestrians
- **Bridleways**: Paths open to walkers, horses, and cyclists  
- **Cycle paths**: Dedicated cycling routes (also walkable)
- **Tracks**: Unpaved roads and farm tracks
- **Steps**: Stairways and stepped paths
- **Public rights of way**: Legal routes across private land

### OpenStreetMap vs Ordnance Survey

**Why OpenStreetMap?**
- Completely free and open-source
- No API keys or licensing fees required
- Regularly updated by community contributors
- Excellent coverage of UK footpaths and bridleways
- Global coverage (works anywhere, not just UK)

**Comparison to OS Maps:**
- OS (Ordnance Survey) maps are the official UK mapping
- OS data requires licensing for commercial/app use
- OS maps have official path classifications
- OpenStreetMap has comparable path data for UK
- OSM is community-maintained but very accurate

For a personal, free app, OpenStreetMap is the ideal choice. The path data is comprehensive and regularly updated by local walkers and mapping enthusiasts.

## Using the Overlay

### Enabling/Disabling

1. Select **Walking** as your activity type
2. Look for the **"🗺️ Paths"** toggle button
3. Tap to turn ON (shows paths) or OFF (standard map)
4. The overlay is slightly transparent (70% opacity) so you can see both the paths and the underlying terrain

### During Activity Tracking

- The path overlay works in real-time as you move
- Your current route is shown as a blue line overlaid on the map
- The map follows your location automatically
- Zoom in to see detailed path information
- Zoom out to plan your route ahead

### Decision-Making Tips

**Path Selection:**
- Green/brown dashed lines = footpaths and bridleways
- Zoom in to see path types clearly
- Thinner lines = minor paths
- Thicker lines = main walking routes

**Route Planning:**
- Before starting, examine the overlay to plan circular routes
- Look for connecting paths to create loops
- Check for barriers or obstacles marked on the map
- Note nearby points of interest

## Technical Details

### Map Tile Source

```javascript
urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
```

- Tiles loaded on-demand from OpenStreetMap
- Cached automatically by the mapping library
- Requires internet connection for initial load
- Standard zoom levels 1-19

### Rendering

- Uses `UrlTile` component from react-native-maps
- Opacity set to 0.7 for optimal overlay visibility
- Only shown when activity type is "walking"
- Automatically disabled for biking to reduce visual clutter

## Customization Options

### Changing Opacity

Edit `TrackingScreen.js`:
```javascript
<UrlTile
  urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  maximumZ={19}
  flipY={false}
  opacity={0.7}  // Change this value (0.0 to 1.0)
/>
```

### Alternative Map Styles

You can use different OpenStreetMap tile servers:

**Humanitarian Style** (good for rural areas):
```javascript
urlTemplate="https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
```

**Cycle Map** (emphasizes cycling/walking routes):
```javascript
urlTemplate="https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png"
// Note: Thunderforest requires free API key
```

**Hiking/Outdoor Style**:
```javascript
urlTemplate="https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png"
// Note: Thunderforest requires free API key
```

### Adding Multiple Overlays

You can stack multiple `UrlTile` components for different features:
```javascript
{/* Base paths */}
<UrlTile urlTemplate="..." opacity={0.7} />

{/* Elevation contours */}
<UrlTile urlTemplate="..." opacity={0.5} />
```

## Data Attribution

The app uses OpenStreetMap data, which is © OpenStreetMap contributors. This data is made available under the Open Database License (ODbL).

When using OpenStreetMap tiles, you should:
- Provide attribution in your app (good practice)
- Respect the tile usage policy (for personal use, no limits)
- Consider donating to OpenStreetMap if you love the service

## Limitations

### Coverage
- Urban areas: Excellent coverage
- Rural areas: Very good coverage in UK, varies globally
- Remote areas: May have limited detail
- Constantly improving through community contributions

### Real-Time Updates
- Path changes may take time to appear in OSM data
- Seasonal closures not always marked
- Temporary diversions may not be shown

### Accuracy
- Generally very accurate for established paths
- New paths may take weeks/months to be mapped
- Compare with local signage when in doubt

## Troubleshooting

**Overlay not showing:**
- Ensure activity type is set to "Walking"
- Check internet connection
- Try toggling paths OFF then ON
- Restart the app

**Tiles loading slowly:**
- Poor internet connection
- Server load on OpenStreetMap
- Try zooming out and back in
- Clear app cache and restart

**Map looks cluttered:**
- Reduce overlay opacity in code
- Toggle overlay OFF temporarily
- Zoom out for simpler view
- Switch to biking mode for clean map

## Future Enhancements

Potential improvements to the overlay feature:
- Offline tile caching for pre-planned routes
- Multiple overlay styles (hiking, cycling, equestrian)
- Elevation contour overlays
- Points of interest (parking, cafes, viewpoints)
- User-contributed route highlights
- Integration with local walking group data

## Resources

- [OpenStreetMap](https://www.openstreetmap.org/) - View and edit map data
- [OSM Wiki - Footpaths](https://wiki.openstreetmap.org/wiki/Tag:highway%3Dfootway)
- [OSM Wiki - Bridleways](https://wiki.openstreetmap.org/wiki/Tag:highway%3Dbridleway)
- [Tile Servers List](https://wiki.openstreetmap.org/wiki/Tile_servers)
- [React Native Maps Docs](https://github.com/react-native-maps/react-native-maps/blob/master/docs/urltile.md)
