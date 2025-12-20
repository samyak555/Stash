# Stash Finance Tracker - Deployment Helper Script
# This script helps you prepare your project for deployment

Write-Host "🚀 Stash Finance Tracker - Deployment Preparation" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Check if files are ready
Write-Host ""
Write-Host "Checking deployment files..." -ForegroundColor Yellow

$files = @(
    "vercel.json",
    "frontend/vercel.json",
    "render.yaml",
    ".gitignore",
    "DEPLOYMENT.md",
    "QUICK_DEPLOY.md"
)

$allPresent = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file - MISSING" -ForegroundColor Red
        $allPresent = $false
    }
}

if ($allPresent) {
    Write-Host ""
    Write-Host "✅ All deployment files are ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Create a GitHub repository:" -ForegroundColor White
    Write-Host "   - Go to https://github.com/new" -ForegroundColor Gray
    Write-Host "   - Name it: stash-finance (or any name you like)" -ForegroundColor Gray
    Write-Host "   - Don't initialize with README (we already have one)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Run these commands:" -ForegroundColor White
    Write-Host "   git add ." -ForegroundColor Yellow
    Write-Host "   git commit -m 'Initial commit - Ready for deployment'" -ForegroundColor Yellow
    Write-Host "   git branch -M main" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/stash-finance.git" -ForegroundColor Yellow
    Write-Host "   git push -u origin main" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. Follow QUICK_DEPLOY.md for deployment steps" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Some files are missing. Please check the errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


