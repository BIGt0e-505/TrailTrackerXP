# Get Your APK in 5 Minutes

## The Fastest Way

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Navigate to Project
```bash
cd TrailTracker
```

### 3. Run the Build Script

**On Mac/Linux:**
```bash
./build-apk.sh
```

**On Windows:**
```
build-apk.bat
```

**Or manually:**
```bash
eas login
eas build --platform android --profile preview
```

### 4. Wait for Build
- Takes 10-30 minutes (happens in the cloud)
- You'll get an email when done
- You can close the terminal

### 5. Download & Install
- Click the download link in your terminal or email
- Transfer APK to your Android phone
- Install (you may need to enable "Install Unknown Apps" in settings)
- Done! 🎉

---

## What You Need

1. **Node.js installed** - Download from https://nodejs.org
2. **Free Expo account** - Sign up at https://expo.dev
3. **10-30 minutes** - For the cloud build to complete
4. **Android phone** - To install the APK

---

## First Time Setup

When you run the build:
1. You'll be prompted to login to Expo (create account if needed)
2. You'll be asked if you want to generate a keystore → **Say YES**
3. Wait for the build to complete
4. Download the APK from the provided URL

---

## Already Built?

If the build completes successfully, you can:
- Download it from the link shown in terminal
- Check https://expo.dev and go to your projects
- Find "trail-tracker" → Builds → Download latest APK

---

## Troubleshooting

**"eas command not found"**
```bash
npm install -g eas-cli
```

**Build fails?**
- Make sure you're in the TrailTracker folder
- Run `npm install` first
- Try logging out and back in: `eas logout` then `eas login`

**Can't install APK on phone?**
- Go to Settings → Security → Enable "Install from Unknown Sources"
- Or Settings → Apps → Your Browser → Allow from this source

---

## The Complete Build Command

If you want to do it manually without the script:

```bash
# Install EAS CLI (one time only)
npm install -g eas-cli

# Login (one time only)
eas login

# Go to project folder
cd TrailTracker

# Install dependencies (first time only)
npm install

# Build APK
eas build --platform android --profile preview
```

That's it! The APK will be ready in 10-30 minutes.

---

## What Gets Built

- **File**: `TrailTracker.apk` (approximately 30-40 MB)
- **Contains**: Complete standalone app
- **Requires**: Android 5.0 or higher
- **Needs internet**: Only for downloading map tiles during use
- **All data**: Stored locally on your device

---

## After Installation

1. Open TrailTracker on your phone
2. Grant location permissions (required)
3. Start tracking your walks and rides!
4. All your data stays on your phone
5. No subscription, no sign-in required

---

## Rebuilding

If you make changes to the app, just run the build command again:
```bash
eas build --platform android --profile preview
```

Your keystore is saved, so users can update seamlessly.

---

## Assets Included

✅ App icon created (green with walking/biking symbols)
✅ Splash screen created (TrailTracker branding)
✅ All code and functionality included

Everything is ready to build!
