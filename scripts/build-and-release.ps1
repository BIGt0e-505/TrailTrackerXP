# ============================================================
# TrailTrackerXP — Local APK Build (Windows-native)
# ============================================================
# One command: prebuild, gradle build, copy APK to releases/.
# No WSL, no EAS cloud, no gh CLI required.
#
# Usage:
#   .\scripts\build-and-release.ps1                # debug build (default)
#   .\scripts\build-and-release.ps1 -DebugBuild          # explicit debug build
#   .\scripts\build-and-release.ps1 -ReleaseBuild        # release build (signed)
#   .\scripts\build-and-release.ps1 -Clean          # nuke gradle cache first
#   .\scripts\build-and-release.ps1 -Version 1.1.0  # bump version before build
#
# What it does (in order):
#   1. Optionally bump version in app.json
#   2. npm install
#   3. npx expo prebuild (generates android/ if missing)
#   4. Gradle assembleDebug (default) or assembleRelease
#   5. (Release only) Sign APK with apksigner
#   6. Copy APK to releases/
#
# Requirements (all on this Windows host):
#   - JDK 21 at C:\Program Files\Java\jdk-21
#   - Android SDK at D:\dev\android-sdk
#   - Node.js + npm
# ============================================================

[CmdletBinding()]
param(
    [string]$Version = "",

    [switch]$DebugBuild,

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

# Default to debug if neither switch is set
if (-not $ReleaseBuild) { $DebugBuild = $true }

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

# --- Determine build type and output ---
if ($ReleaseBuild) {
    $BuildType = "release"
    $GradleTask = "assembleRelease"
    $ApkSubPath = Join-Path "android" (Join-Path "app" (Join-Path "build" (Join-Path "outputs" (Join-Path "apk" (Join-Path "release" "app-release.apk")))))
    $ApkName = "$APP_NAME-v$CurrentVersion.apk"
} else {
    $BuildType = "debug"
    $GradleTask = "assembleDebug"
    $ApkSubPath = Join-Path "android" (Join-Path "app" (Join-Path "build" (Join-Path "outputs" (Join-Path "apk" (Join-Path "debug" "app-debug.apk")))))
    $ApkName = "$APP_NAME-v$CurrentVersion-debug.apk"
}

$ApkPath = Join-Path $REPO_DIR $ApkSubPath
$OutputPath = Join-Path $RELEASES_DIR $ApkName

# --- Branch ---
$Branch = (git -C $REPO_DIR rev-parse --abbrev-ref HEAD 2>&1)
if ($LASTEXITCODE -ne 0) { $Branch = "unknown" }

# --- Banner ---
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  $APP_NAME - Local $BuildType build" -ForegroundColor Cyan
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

# --- Step 3: Gradle build ---
Write-Host ""
Write-Host "[3/5] Building APK with Gradle ($BuildType)..."
Set-Location $ANDROID_DIR
& .\gradlew.bat $GradleTask --no-daemon 2>&1 | Tee-Object -FilePath "$env:TEMP\gradle-build-trailtracker.log" | Select-Object -Last 10
$gradleExit = $LASTEXITCODE
Set-Location $REPO_DIR

if ($gradleExit -ne 0) {
    Write-Error "gradle build failed (exit $gradleExit). Log: $env:TEMP\gradle-build-trailtracker.log"
    exit 1
}
Write-Host "  BUILD SUCCESSFUL  OK"

# --- Step 4: Sign APK (release only) ---
if ($ReleaseBuild) {
    Write-Host ""
    Write-Host "[4/5] Signing APK..."

    $keystorePath = Join-Path $ANDROID_DIR "app\debug.keystore"
    if (-not (Test-Path $keystorePath)) {
        Write-Host "  debug.keystore not found -- generating one..."
        & keytool -genkeypair -v -storetype PKCS12 -keystore $keystorePath -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "keytool failed to generate debug.keystore"
            exit 1
        }
        Write-Host "  debug.keystore generated  OK"
    }

    & $apksigner.FullName sign --ks $keystorePath --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android $ApkPath *>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "apksigner failed (exit $LASTEXITCODE)"
        exit 1
    }

    $verifyOutput = (& $apksigner.FullName verify --verbose $ApkPath 2>&1) -join "`n"
    if (-not $verifyOutput.Contains("Verifies")) {
        Write-Error "Signature verification failed"
        exit 1
    }
    Write-Host "  Signed (v2/v3)  OK"
} else {
    Write-Host ""
    Write-Host "[4/5] Debug build -- skipping signing"
}

# --- Step 5: Copy APK to releases/ ---
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
Write-Host "  Type: $BuildType" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan