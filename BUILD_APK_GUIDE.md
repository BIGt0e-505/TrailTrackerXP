# Building TrailTracker APK - Complete Guide

This guide will walk you through building a standalone APK file that you can install directly on your Android device without needing Expo Go.

## Prerequisites

Before building, ensure you have:
- Node.js installed (v16 or higher)
- npm installed
- A free Expo account (sign up at https://expo.dev)

## Method 1: EAS Build (Recommended - Easiest)

EAS (Expo Application Services) builds your APK in the cloud. This is the easiest method and doesn't require Android Studio.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

If you don't have an account, create one at https://expo.dev (it's free).

### Step 3: Configure the Project

```bash
cd TrailTracker
eas build:configure
```

When prompted:
- Select **Android** platform
- Press Enter to accept defaults

This creates an `eas.json` file (already included in your project).

### Step 4: Build the APK

```bash
eas build --platform android --profile preview
```

**What happens:**
1. Your code is uploaded to Expo's build servers
2. The APK is built in the cloud (takes 10-30 minutes)
3. You'll get a URL to download the APK

**During the build, you'll be asked:**
- **Generate a new Android Keystore?** → Select **Yes** (for first build)
- The keystore is stored securely in your Expo account

### Step 5: Download and Install

1. Once the build completes, you'll see a download link
2. Open the link on your Android phone OR download on computer and transfer to phone
3. Open the APK file on your Android device
4. You may need to enable "Install from Unknown Sources" in Android settings
5. Install and open the app!

### Subsequent Builds

For future updates, just run:
```bash
eas build --platform android --profile preview
```

Your keystore is saved, so updates will work seamlessly.

---

## Method 2: Local Build with Expo (Deprecated but Still Works)

This method builds locally on your computer but requires more setup.

### Step 1: Install Expo CLI

```bash
npm install -g expo-cli
```

### Step 2: Build Locally

```bash
cd TrailTracker
expo build:android -t apk
```

**Note:** This command is deprecated and Expo recommends using EAS Build instead, but it still works.

**You'll be prompted:**
- Login to your Expo account
- Choose to generate a new keystore (select Yes for first build)

**What happens:**
1. Code is bundled locally
2. Uploaded to Expo build servers
3. APK is built and made available for download

### Step 3: Download the APK

Once complete, download the APK from the provided URL and install on your device.

---

## Method 3: Fully Local Build with Android Studio (Advanced)

This method builds everything locally without cloud services. Only use if you're comfortable with Android development.

### Prerequisites

1. Install Android Studio
2. Install Android SDK (API 33 or higher)
3. Set up Java Development Kit (JDK 11 or higher)
4. Configure environment variables (ANDROID_HOME, JAVA_HOME)

### Step 1: Prebuild

```bash
cd TrailTracker
npx expo prebuild --platform android
```

This generates native Android code in an `android/` folder.

### Step 2: Build with Gradle

```bash
cd android
./gradlew assembleRelease
```

### Step 3: Sign the APK

You'll need to create a keystore and sign the APK manually. The unsigned APK will be at:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

See Android documentation for signing APKs.

**Note:** This method is complex and not recommended unless you have specific requirements.

---

## Troubleshooting

### "eas: command not found"

```bash
npm install -g eas-cli
```

Make sure npm global bin is in your PATH.

### "Not logged in"

```bash
eas login
```

Or create account at https://expo.dev

### Build fails with "No bundle URL present"

This usually means a dependency issue. Try:
```bash
rm -rf node_modules
npm install
```

### "Keystore not found"

On first build, always select "Yes" to generate a new keystore. Expo stores it for future builds.

### APK won't install on phone

1. Go to Android Settings → Security → Enable "Install Unknown Apps"
2. Allow installation from your browser or file manager
3. Ensure the APK downloaded completely (check file size)

### Google Maps not working

If maps aren't loading:
1. Get a Google Maps API key (free tier)
2. Add it to `app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_API_KEY_HERE"
       }
     }
   }
   ```
3. Rebuild the APK

Note: The app works without a Google Maps API key using OpenStreetMap tiles, but may have limitations.

---

## Recommended Build Process

**For most users, use Method 1 (EAS Build):**

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Navigate to project: `cd TrailTracker`
4. Build: `eas build --platform android --profile preview`
5. Wait 10-30 minutes
6. Download APK from provided URL
7. Install on Android device

**That's it!** The APK will be a standalone installer you can keep and share.

---

## Build Profiles Explained

The `eas.json` file contains three build profiles:

### `preview` (Recommended for personal use)
```bash
eas build --platform android --profile preview
```
- Builds an APK file
- Can be installed directly
- Internal distribution (not for Play Store)
- Perfect for personal use

### `production`
```bash
eas build --platform android --profile production
```
- Builds an AAB (Android App Bundle) by default
- Required for Google Play Store submission
- Use only if publishing to Play Store

### `development`
```bash
eas build --platform android --profile development
```
- Development build with debugging enabled
- Larger file size
- For testing only

**For your use case, always use `preview` profile.**

---

## Understanding the Build

When you build an APK:
1. Your React Native code is bundled into JavaScript
2. Native Android code is compiled
3. Assets (images, maps) are packaged
4. Everything is signed with a keystore
5. Output: A single APK file (~30-50 MB)

**The APK includes:**
- ✅ All your code and logic
- ✅ Icon and splash screen
- ✅ GPS tracking functionality
- ✅ Map rendering libraries
- ✅ Data storage capabilities

**The APK does NOT include:**
- ❌ Map tiles (downloaded on-demand from OpenStreetMap)
- ❌ User data (stored locally after install)

---

## File Size Expectations

- Development build: ~50-80 MB
- Production/Preview build: ~25-40 MB
- Installed size on device: ~60-100 MB

The APK is larger than web apps but smaller than most full-featured apps.

---

## Next Steps After Building

1. Install the APK on your Android phone
2. Open the app and grant location permissions
3. Track a test walk or ride
4. Verify data is saved in Calendar and Stats
5. You're ready to use!

**Keep the APK file** - you can reinstall or install on other devices without rebuilding.

---

## Quick Reference Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build APK
cd TrailTracker
eas build --platform android --profile preview

# Check build status
eas build:list

# Download specific build
eas build:download --id <build-id>
```

---

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/setup/)
- [Expo Application Services](https://expo.dev/eas)
- [Android APK Installation Guide](https://docs.expo.dev/build/internal-distribution/)

---

## Cost

**EAS Build is FREE for:**
- Personal projects
- Open source projects
- Up to 30 builds per month

You won't need to pay anything unless you're building dozens of times per month.

---

## Summary

**Simplest path to APK:**
```bash
npm install -g eas-cli
eas login
cd TrailTracker
eas build --platform android --profile preview
```

Wait for build → Download APK → Install on phone → Done! 🎯
