@echo off
REM TrailTracker APK Build Script for Windows
REM This script automates the APK building process using EAS Build

echo ======================================
echo TrailTracker APK Build Script
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js first.
    echo   Download from: https://nodejs.org
    pause
    exit /b 1
)

echo + Node.js found
node --version

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo X npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo + npm found
npm --version

REM Check if EAS CLI is installed
where eas >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Installing EAS CLI...
    call npm install -g eas-cli
    
    if %errorlevel% neq 0 (
        echo X Failed to install EAS CLI
        pause
        exit /b 1
    )
    
    echo + EAS CLI installed successfully
) else (
    echo + EAS CLI found
    eas --version
)

echo.
echo ======================================
echo Checking project dependencies...
echo ======================================
echo.

REM Check if we're in the TrailTracker directory
if not exist "package.json" (
    echo X Not in TrailTracker directory. Please run this script from the TrailTracker folder.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing project dependencies...
    call npm install
    
    if %errorlevel% neq 0 (
        echo X Failed to install dependencies
        pause
        exit /b 1
    )
    
    echo + Dependencies installed
) else (
    echo + Dependencies already installed
)

echo.
echo ======================================
echo Logging in to Expo...
echo ======================================
echo.
echo Please enter your Expo credentials.
echo If you don't have an account, create one at https://expo.dev
echo.

call eas login

if %errorlevel% neq 0 (
    echo X Login failed. Please check your credentials.
    pause
    exit /b 1
)

echo.
echo + Logged in successfully

echo.
echo ======================================
echo Starting APK build...
echo ======================================
echo.
echo Build profile: preview (APK for direct installation)
echo Platform: Android
echo.
echo This will take approximately 10-30 minutes.
echo You can close this window - the build happens in the cloud.
echo.

pause

call eas build --platform android --profile preview

if %errorlevel% neq 0 (
    echo.
    echo X Build failed. Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ======================================
echo Build completed successfully!
echo ======================================
echo.
echo Next steps:
echo 1. Download the APK from the URL shown above
echo 2. Transfer to your Android device (or download directly on phone)
echo 3. Install the APK (you may need to enable 'Install Unknown Apps')
echo 4. Open TrailTracker and start tracking!
echo.
echo You can also check your builds at: https://expo.dev
echo.

pause
