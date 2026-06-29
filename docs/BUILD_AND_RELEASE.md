# Build & Release Guide

## EAS Build (Cloud)

The app uses Expo Application Services (EAS) for cloud builds. No local Android Studio required.

### Prerequisites
- Free Expo account (https://expo.dev)
- EAS CLI: `npm install -g eas-cli`

### Build Profiles (`eas.json`)

| Profile | Purpose | Output |
|---------|---------|--------|
| `preview` | Personal use / direct install | APK |
| `production` | Play Store submission | AAB |
| `development` | Dev build with debugging | APK (larger) |

### Build an APK

```bash
eas login
eas build --platform android --profile preview
```

- Build takes 10–30 minutes in the cloud
- First build: say **Yes** to generating a new keystore (stored in your Expo account)
- Download the APK from the provided URL or `eas build:list`

### Install on Android

1. Transfer the APK to your Android phone
2. Enable "Install from Unknown Sources" in Android settings (if needed)
3. Open and install the APK

### Rebuilding After Changes

```bash
eas build --platform android --profile preview
```

Your keystore is saved in your Expo account, so updates work seamlessly.

## Local Build (Advanced)

For a fully local build without EAS:

```bash
npx expo prebuild --platform android    # Generates native android/ folder
cd android
./gradlew assembleRelease               # Build APK
```

The unsigned APK will be at `android/app/build/outputs/apk/release/app-release-unsigned.apk`. You'll need to create a keystore and sign manually. See Android documentation for signing APKs.

## Build Helper Scripts

- `build-apk.bat` — Windows script that runs `eas build` interactively
- `build-apk.sh` — Linux/macOS equivalent (note: has encoding issues with emoji characters)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `eas: command not found` | `npm install -g eas-cli` |
| Not logged in | `eas login` |
| Build fails / no bundle URL | `rm -rf node_modules && npm install` |
| Keystore not found | On first build, select "Yes" to generate |
| APK won't install | Enable "Install from Unknown Sources" in Android settings |
| Maps not loading | App works without Google Maps API key (uses OSM tiles) |