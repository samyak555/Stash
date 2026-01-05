# Configure EAS Project and Build APK
# Run this script to automatically configure and build

Write-Host "🔧 Configuring EAS project..." -ForegroundColor Cyan

# Configure EAS project (auto-create if needed)
$response = "yes"
$response | eas build:configure

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ EAS project configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🏗️  Starting Android APK build..." -ForegroundColor Cyan
    Write-Host "⏳ This will take 10-15 minutes..." -ForegroundColor Yellow
    Write-Host ""
    
    # Start build
    eas build --platform android --profile preview
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Build started successfully!" -ForegroundColor Green
        Write-Host "📱 Check status: https://expo.dev" -ForegroundColor Cyan
        Write-Host "📥 Download link will appear when build completes" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Build failed. Check errors above." -ForegroundColor Red
    }
} else {
    Write-Host "❌ Configuration failed. Please run manually:" -ForegroundColor Red
    Write-Host "   eas build:configure" -ForegroundColor Yellow
    Write-Host "   eas build --platform android --profile preview" -ForegroundColor Yellow
}

