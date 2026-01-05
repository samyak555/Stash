# Automated APK Build Script for Stash Mobile App (PowerShell)
# This script will build your APK and provide download link

Write-Host "🚀 Stash Mobile App - APK Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue
if (-not $easInstalled) {
    Write-Host "📦 Installing EAS CLI..." -ForegroundColor Yellow
    npm install -g eas-cli
} else {
    Write-Host "✅ EAS CLI already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 Checking Expo login..." -ForegroundColor Cyan
$loginCheck = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in. Please login:" -ForegroundColor Yellow
    eas login
} else {
    Write-Host "✅ Already logged in" -ForegroundColor Green
    eas whoami
}

Write-Host ""
Write-Host "⚙️  Configuring build (if needed)..." -ForegroundColor Cyan
if (-not (Test-Path "eas.json")) {
    eas build:configure
}

Write-Host ""
Write-Host "🏗️  Starting Android APK build..." -ForegroundColor Cyan
Write-Host "⏳ This will take 5-15 minutes..." -ForegroundColor Yellow
Write-Host ""

# Build APK
eas build --platform android --profile preview --non-interactive

Write-Host ""
Write-Host "✅ Build started!" -ForegroundColor Green
Write-Host "📱 Check your build status at: https://expo.dev" -ForegroundColor Cyan
Write-Host "🔗 You'll receive a download link when build completes" -ForegroundColor Cyan
Write-Host ""
Write-Host "To check build status, run: eas build:list" -ForegroundColor Yellow
Write-Host "To download when ready, run: eas build:download" -ForegroundColor Yellow

