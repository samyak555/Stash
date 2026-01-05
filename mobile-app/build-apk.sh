#!/bin/bash

# Automated APK Build Script for Stash Mobile App
# This script will build your APK and provide download link

echo "🚀 Stash Mobile App - APK Build Script"
echo "========================================"
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
else
    echo "✅ EAS CLI already installed"
fi

echo ""
echo "🔐 Checking Expo login..."
if ! eas whoami &> /dev/null; then
    echo "⚠️  Not logged in. Please login:"
    eas login
else
    echo "✅ Already logged in"
    eas whoami
fi

echo ""
echo "⚙️  Configuring build (if needed)..."
if [ ! -f "eas.json" ]; then
    eas build:configure
fi

echo ""
echo "🏗️  Starting Android APK build..."
echo "⏳ This will take 5-15 minutes..."
echo ""

# Build APK
eas build --platform android --profile preview --non-interactive

echo ""
echo "✅ Build started!"
echo "📱 Check your build status at: https://expo.dev"
echo "🔗 You'll receive a download link when build completes"
echo ""
echo "To check build status, run: eas build:list"
echo "To download when ready, run: eas build:download"

