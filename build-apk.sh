#!/bin/bash

# TrailTracker APK Build Script
# This script automates the APK building process using EAS Build

echo "======================================"
echo "TrailTracker APK Build Script"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo ""
    echo "📦 EAS CLI not found. Installing..."
    npm install -g eas-cli
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install EAS CLI"
        exit 1
    fi
    
    echo "✅ EAS CLI installed successfully"
else
    echo "✅ EAS CLI found: $(eas --version)"
fi

echo ""
echo "======================================"
echo "Checking project dependencies..."
echo "======================================"
echo ""

# Check if we're in the TrailTracker directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in TrailTracker directory. Please run this script from the TrailTracker folder."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing project dependencies..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "======================================"
echo "Logging in to Expo..."
echo "======================================"
echo ""
echo "Please enter your Expo credentials."
echo "If you don't have an account, create one at https://expo.dev"
echo ""

eas login

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Please check your credentials."
    exit 1
fi

echo ""
echo "✅ Logged in successfully"

echo ""
echo "======================================"
echo "Starting APK build..."
echo "======================================"
echo ""
echo "Build profile: preview (APK for direct installation)"
echo "Platform: Android"
echo ""
echo "This will take approximately 10-30 minutes."
echo "You can close this terminal - the build happens in the cloud."
echo ""

read -p "Press Enter to start the build..."

eas build --platform android --profile preview

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi

echo ""
echo "======================================"
echo "Build completed successfully! 🎉"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Download the APK from the URL shown above"
echo "2. Transfer to your Android device (or download directly on phone)"
echo "3. Install the APK (you may need to enable 'Install Unknown Apps')"
echo "4. Open TrailTracker and start tracking!"
echo ""
echo "You can also check your builds at: https://expo.dev/accounts/[your-username]/projects/trail-tracker/builds"
echo ""
