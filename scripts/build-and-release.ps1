# ============================================================
# TrailTrackerXP â€” Local APK Build (Windows-native)
# ============================================================
# One command: prebuild, gradle build, copy APK to releases/.
# No WSL, no EAS cloud, no gh CLI required.
#
# Usage:
#   .\scripts\build-and-release.ps1                  # preview build (default, standalone, no Metro)
#   .\scripts\build-and-release.ps1 -PreviewBuild    # explicit preview build
#   .\scripts\build-and-release.ps1 -DebugBuild      # dev debug build (requires Metro)
#   .\scripts\build-and-release.ps1 -ReleaseBuild    # release build (signed, minified)
#   .\scripts\build-and-release.ps1 -Clean           # nuke gradle cache + android/ first
#   .\scripts\build-and-release.ps1 -Version 1.1.0   # bump version before build
#
# Build modes:
#   -PreviewBuild (default): assembleRelease with debug signing. JS bundled into APK.
#     Standalone â€” no Metro needed. Use this for phone QA.
#   -DebugBuild: assembleDebug. JS loaded from Metro at runtime.
#     Requires Metro running. Use for live development.
#   -ReleaseBuild: assembleRelease with proper release signing + minification.
#     Use only when cutting a public release.
#
# Requirements (all on this Windows host):
#   - JDK 21 at C:\Program Files\Java\jdk-21
#   - Android SDK at D:\dev\android-sdk
#   - Node.js + npm
#   - For -ReleaseBuild: env vars TRAILTRACKER_STORE_PASSWORD and TRAILTRACKER_KEY_PASSWORD
# 
#   ⚠️  ProGuard / minification is PERMANENTLY DISABLED. It strips the
#      background location tracking service and breaks activity recording.
#      Do NOT re-enable it in build.gradle or gradle.properties.
# ============================================================

[CmdletBinding()]
param(
    [string]$Version = "",

    [switch]$DebugBuild,

    [switch]$PreviewBuild,

    [switch]$ReleaseBuild,

    [switch]$Clean
)

# --- Constants ---
$APP_NAME = "TrailTrackerXP"
$SCRIPT_DIR = $PSScriptRoot
$REPO_DIR = Split-Path $SCRIPT_DIR -Parent
$RELEASES_DIR = Join-Path $REPO_DIR "releases"
$APP_JSON_PATH = Join-Path $REPO_DIR "app.json"
$ANDROID_DIR = Join-Path $REPO_DIR "android"

$JDK_PATH = "C:\Program Files\Java\jdk-21"
$ANDROID_SDK = "D:\dev\android-sdk"
$UTF8_NO_BOM = [System.Text.UTF8Encoding]::new($false)

# Default to preview if no build mode is specified
if (-not $DebugBuild -and -not $ReleaseBuild) { $PreviewBuild = $true }

function Write-File-NoBom([string]$Path, [string]$Content) {
    [System.IO.File]::WriteAllText($Path, $Content, $UTF8_NO_BOM)
}

# --- Determine current version ---
$AppJson = Get-Content $APP_JSON_PATH -Raw | ConvertFrom-Json
$CurrentVersion = [string]$AppJson.expo.version
if (-not $CurrentVersion) {
    Write-Error "Could not read expo.version from app.json."
    exit 1
}

# --- Handle version bump ---
if ($Version) {
    if ($Version -notmatch '^\d+\.\d+\.\d+$') {
        Write-Error "Version must use numeric X.Y.Z format, for example 1.1.0."
        exit 1
    }
    $AppJson.expo.version = $Version
    Write-File-NoBom $APP_JSON_PATH ($AppJson | ConvertTo-Json -Depth 10)
    $CurrentVersion = $Version
    Write-Host "  Version bumped to $Version" -ForegroundColor Green
}

# --- Determine build type, gradle task, APK path, and output name ---
if ($DebugBuild) {
    $BuildMode = "dev-debug"
    $BuildType = "debug"
    $GradleTask = "assembleDebug"
    $ApkSubPath = Join-Path "android" (Join-Path "app" (Join-Path "build" (Join-Path "outputs" (Join-Path "apk" (Join-Path "debug" "app-debug.apk")))))
    $ApkName = "$APP_NAME-v$CurrentVersion-dev-debug.apk"
} elseif ($ReleaseBuild) {
    $BuildMode = "release"
    $BuildType = "release"
    $GradleTask = "assembleRelease"
    $ApkSubPath = Join-Path "android" (Join-Path "app" (Join-Path "build" (Join-Path "outputs" (Join-Path "apk" (Join-Path "release" "app-release.apk")))))
    $ApkName = "$APP_NAME-v$CurrentVersion.apk"
} else {
    # Preview build: uses assembleRelease with debug signing (already configured by Expo prebuild)
    # This bundles JS into the APK but signs with the debug keystore â€” standalone, no Metro needed
    $BuildMode = "preview"
    $BuildType = "release"
    $GradleTask = "assembleRelease"
    $ApkSubPath = Join-Path "android" (Join-Path "app" (Join-Path "build" (Join-Path "outputs" (Join-Path "apk" (Join-Path "release" "app-release.apk")))))
    $ApkName = "$APP_NAME-v$CurrentVersion-preview.apk"
}

$ApkPath = Join-Path $REPO_DIR $ApkSubPath
$OutputPath = Join-Path $RELEASES_DIR $ApkName

# --- Branch ---
$Branch = (git -C $REPO_DIR rev-parse --abbrev-ref HEAD 2>&1)
if ($LASTEXITCODE -ne 0) { $Branch = "unknown" }

# --- Banner ---
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  $APP_NAME - Local $BuildMode build" -ForegroundColor Cyan
Write-Host "  Version: $CurrentVersion" -ForegroundColor Cyan
Write-Host "  Branch:  $Branch" -ForegroundColor Cyan
Write-Host "  JDK:     $JDK_PATH" -ForegroundColor Cyan
Write-Host "  SDK:     $ANDROID_SDK" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# --- Verify tools ---
Write-Host "[0/5] Verifying build tools..."

if (-not (Test-Path (Join-Path $JDK_PATH "bin\java.exe"))) {
    Write-Error "JDK not found at $JDK_PATH"
    exit 1
}
Write-Host "  JDK 21  OK"

if (-not (Test-Path (Join-Path $ANDROID_SDK "platform-tools\adb.exe"))) {
    Write-Error "Android SDK not found at $ANDROID_SDK"
    exit 1
}
Write-Host "  Android SDK  OK"

if (-not (Test-Path (Join-Path $REPO_DIR "node_modules\package.json"))) {
    Write-Host "  node_modules missing -- will install in step 2" -ForegroundColor Yellow
} else {
    Write-Host "  node_modules  OK"
}

if ($ReleaseBuild) {
    $apksigner = Get-ChildItem (Join-Path $ANDROID_SDK "build-tools") -Recurse -Filter "apksigner.bat" -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $apksigner) {
        Write-Error "apksigner.bat not found in $ANDROID_SDK build-tools (needed for release signing)"
        exit 1
    }
    Write-Host "  apksigner  OK"
}

# --- Set environment ---
$env:JAVA_HOME = $JDK_PATH
$env:ANDROID_HOME = $ANDROID_SDK
$env:ANDROID_SDK_ROOT = $ANDROID_SDK
$jdkBin = Join-Path $JDK_PATH "bin"
$sdkPlatformTools = Join-Path $ANDROID_SDK "platform-tools"
$env:PATH = "$jdkBin;$sdkPlatformTools;$env:PATH"

Set-Location $REPO_DIR

# --- Optional: clean ---
if ($Clean) {
    Write-Host ""
    Write-Host "[clean] Removing gradle caches and generated android project..."
    $buildPaths = @(
        (Join-Path $ANDROID_DIR "app\build"),
        (Join-Path $ANDROID_DIR "build"),
        (Join-Path $ANDROID_DIR ".gradle")
    )
    foreach ($p in $buildPaths) {
        Remove-Item -Recurse -Force $p -ErrorAction SilentlyContinue
    }
    if (Test-Path $ANDROID_DIR) {
        Remove-Item -Recurse -Force $ANDROID_DIR -ErrorAction SilentlyContinue
    }
    Write-Host "  done"
}

# --- Step 1: npm install ---
Write-Host ""
Write-Host "[1/5] npm install..."
npm install --no-audit --no-fund 2>&1 | Select-Object -Last 3
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed (exit $LASTEXITCODE)"
    exit 1
}
Write-Host "  npm install  OK"

# --- Step 2: Expo prebuild (generate android/ if missing) ---
Write-Host ""
Write-Host "[2/5] Expo prebuild..."
$gradlewPath = Join-Path $ANDROID_DIR "gradlew.bat"
if (-not (Test-Path $gradlewPath)) {
    Write-Host "  android/ not found -- running npx expo prebuild..."
    npx expo prebuild --platform android 2>&1 | Select-Object -Last 10
    if ($LASTEXITCODE -ne 0) {
        Write-Error "expo prebuild failed (exit $LASTEXITCODE)"
        exit 1
    }
    Write-Host "  prebuild  OK"
} else {
    Write-Host "  android/ already exists -- skipping prebuild"
}

# --- Icon resource patch: copy supplied icon pack into generated Android resources ---
$ICON_SRC = Join-Path $REPO_DIR "assets\native-icons\android_icons"
$RES_DIR = Join-Path $ANDROID_DIR "app\src\main\res"

if ((Test-Path $ICON_SRC) -and (Test-Path $RES_DIR)) {
    Write-Host "  Patching icon resources from assets/native-icons/..."

    # Launcher icons -> mipmap folders (all densities)
    $densities = @('mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi')
    foreach ($density in $densities) {
        $srcDir = Join-Path $ICON_SRC "mipmap-$density"
        $dstDir = Join-Path $RES_DIR "mipmap-$density"
        if (Test-Path $srcDir) {
            New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
            # Launcher icon (and round variant -- same source, no separate round in pack)
            $launcherSrc = Join-Path $srcDir "ic_launcher.png"
            if (Test-Path $launcherSrc) {
                Copy-Item $launcherSrc (Join-Path $dstDir "ic_launcher.png") -Force
                Copy-Item $launcherSrc (Join-Path $dstDir "ic_launcher_round.png") -Force
            }
            # Notification icon -> drawable-<density> folders
            $notifSrc = Join-Path $srcDir "ic_notification.png"
            if (Test-Path $notifSrc) {
                $drawableDstDir = Join-Path $RES_DIR "drawable-$density"
                New-Item -ItemType Directory -Force -Path $drawableDstDir | Out-Null
                Copy-Item $notifSrc (Join-Path $drawableDstDir "ic_notification.png") -Force
            }
        }
    }

    # Remove generated adaptive icon XML so Android falls back to density PNGs
    # (Expo generates these referencing its own foreground artwork which causes the overflow)
    $anydpiDir = Join-Path $RES_DIR "mipmap-anydpi-v26"
    Remove-Item (Join-Path $anydpiDir "ic_launcher.xml") -Force -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $anydpiDir "ic_launcher_round.xml") -Force -ErrorAction SilentlyContinue
    Write-Host "  Removed adaptive icon XML (using density PNGs instead)  OK"

    Write-Host "  Launcher + notification icons patched  OK"
} else {
    Write-Host "  Icon pack source not found at $ICON_SRC -- skipping icon patch" -ForegroundColor Yellow
}

# Patch expo-location's LocationTaskService to use the monochrome notification icon
# instead of the full-colour launcher icon (fixes notification tray showing coloured icon)
$taskServicePath = Join-Path $REPO_DIR "node_modules\expo-location\android\src\main\java\expo\modules\location\services\LocationTaskService.kt"
if (Test-Path $taskServicePath) {
    $tsContent = Get-Content $taskServicePath -Raw
    $patched = $false
    if ($tsContent -match 'setSmallIcon\(applicationInfo\.icon\)') {
        $tsContent = $tsContent -replace 'setSmallIcon\(applicationInfo\.icon\)', 'setSmallIcon(android.R.drawable.ic_notification)'
        $patched = $true
    }
    if ($tsContent -match 'setSmallIcon\(resources\.getIdentifier\("ic_notification"') {
        # Keep existing resources.getIdentifier patch
        $patched = $true
    }
    if ($tsContent -match 'setSmallIcon\(R\.drawable\.ic_notification\)') {
        # Keep R.drawable version if present (works if R class has the resource)
        $patched = $true
    }
    if (-not $patched) {
        # Fallback: use resources.getIdentifier (no import needed)
        $tsContent = $tsContent -replace 'setSmallIcon\([^)]+\)', 'setSmallIcon(resources.getIdentifier("ic_notification", "drawable", packageName))'
        $patched = $true
    }
    if ($patched) {
        # Also disable setColorized(true) so the notification row isn't force-tinted
        $tsContent = $tsContent -replace '\.setColorized\(true\)', '.setColorized(false)'
        [System.IO.File]::WriteAllText($taskServicePath, $tsContent, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  patched LocationTaskService for notification icon  OK"
    } else {
        Write-Host "  LocationTaskService already patched or pattern not found"
    }
}

# --- Step 3a: Patch build.gradle for release signing (BEFORE gradle build) ---
if ($ReleaseBuild) {
    # Copy release keystore into android/app/ (survives clean because it lives in repo root)
    $releaseKeystoreSrc = Join-Path $REPO_DIR "release.keystore"
    $releaseKeystoreDst = Join-Path $ANDROID_DIR "app\release.keystore"
    if (-not (Test-Path $releaseKeystoreSrc)) {
        Write-Error "release.keystore not found at $releaseKeystoreSrc. Cannot build release without signing key."
        exit 1
    }
    Copy-Item $releaseKeystoreSrc $releaseKeystoreDst -Force
    Write-Host "  Copied release.keystore into android/app/  OK"

    $buildGradlePath = Join-Path $ANDROID_DIR "app\build.gradle"
    if (Test-Path $buildGradlePath) {
        $gradleContent = Get-Content $buildGradlePath -Raw
        # Check if release signingConfig already exists with our keystore
        if ($gradleContent -match 'release\.keystore') {
            Write-Host "  build.gradle already patched for release signing  OK"
        } else {
            # Add release signing config after the debug block
            $storePwd = $env:TRAILTRACKER_STORE_PASSWORD
            $keyPwd = $env:TRAILTRACKER_KEY_PASSWORD
            if (-not $storePwd -or -not $keyPwd) {
                Write-Error "Release signing passwords not set. Set env vars: TRAILTRACKER_STORE_PASSWORD and TRAILTRACKER_KEY_PASSWORD"
                exit 1
            }
            $releaseSigningBlock = "`n        release {`n            storeFile file('release.keystore')`n            storePassword '$storePwd'`n            keyAlias 'trailtracker'`n            keyPassword '$keyPwd'`n        }`n"
            $gradleContent = $gradleContent -replace '(signingConfigs\s*\{\s*debug\s*\{[^}]*}\s*)', "`$1$releaseSigningBlock"
            # Replace 'signingConfig signingConfigs.debug' in release buildType
            $gradleContent = $gradleContent -replace 'signingConfig signingConfigs\.debug', 'signingConfig signingConfigs.release'
            [System.IO.File]::WriteAllText($buildGradlePath, $gradleContent, [System.Text.UTF8Encoding]::new($false))
            Write-Host "  Patched build.gradle for release signing  OK"
        }
    }
}

# --- Step 3: Gradle build ---
Write-Host ""
Write-Host "[3/5] Building APK with Gradle ($BuildType)..."
Set-Location $ANDROID_DIR
if ($ReleaseBuild) {
    # ProGuard/minification disabled â€” strips code the tracking service needs
    & .\gradlew.bat $GradleTask '--no-daemon' 2>&1 | Tee-Object -FilePath "$env:TEMP\gradle-build-trailtracker.log" | Select-Object -Last 10
} else {
    & .\gradlew.bat $GradleTask '--no-daemon' 2>&1 | Tee-Object -FilePath "$env:TEMP\gradle-build-trailtracker.log" | Select-Object -Last 10
}
$gradleExit = $LASTEXITCODE
Set-Location $REPO_DIR

if ($gradleExit -ne 0) {
    Write-Error "gradle build failed (exit $gradleExit). Log: $env:TEMP\gradle-build-trailtracker.log"
    exit 1
}
Write-Host "  BUILD SUCCESSFUL  OK"

# --- Step 4: Verify signing (release mode builds signed APK during gradle build) ---
if ($ReleaseBuild) {
    Write-Host ""
    Write-Host "[4/5] Verifying APK signing..."

    $apksigner = Get-ChildItem (Join-Path $ANDROID_SDK "build-tools") -Recurse -Filter "apksigner.bat" -ErrorAction SilentlyContinue | Select-Object -First 1
    $verifyOutput = (& $apksigner.FullName verify --verbose $ApkPath 2>&1) -join "`n"
    if (-not $verifyOutput.Contains("Verifies")) {
        Write-Error "Signature verification failed. Output: $verifyOutput"
        exit 1
    }
    Write-Host "  Signed (v2/v3) with release keystore  OK"
} elseif ($PreviewBuild) {
    Write-Host ""
    Write-Host "[4/5] Preview build -- signed with debug keystore (configured in build.gradle)"
} else {
    Write-Host ""
    Write-Host "[4/5] Dev debug build -- no signing needed"
}

Write-Host ""
Write-Host "[5/5] Copying APK to releases/..."
New-Item -ItemType Directory -Force -Path $RELEASES_DIR | Out-Null
Copy-Item $ApkPath $OutputPath -Force
$apkSize = [math]::Round((Get-Item $OutputPath).Length / 1MB, 1)
Write-Host ("  {0} ({1:N1} MB)  OK" -f $ApkName, $apkSize)

# --- Done ---
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Build complete!" -ForegroundColor Cyan
Write-Host ("  APK: {0}" -f $OutputPath) -ForegroundColor Green
Write-Host ("  Size: {0:N1} MB" -f $apkSize) -ForegroundColor Cyan
Write-Host "  Mode: $BuildMode" -ForegroundColor Cyan
if ($PreviewBuild) {
    Write-Host "  Standalone: YES (no Metro required)" -ForegroundColor Green
} elseif ($DebugBuild) {
    Write-Host "  Standalone: NO (requires Metro running)" -ForegroundColor Yellow
}
Write-Host "==========================================" -ForegroundColor Cyan