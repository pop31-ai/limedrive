param(
    [switch]$InstallSDK
)

Write-Host "=== FingerDraw APK Builder ===" -ForegroundColor Cyan
Write-Host ""

# Check for Android SDK
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    $androidHome = "$env:LOCALAPPDATA\Android\Sdk"
}

if (-not (Test-Path $androidHome)) {
    Write-Host "[!] Android SDK not found at: $androidHome" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install Android SDK via Android Studio" -ForegroundColor Yellow
    Write-Host "  1. Download Android Studio from: https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host "  2. Install and open Android Studio" -ForegroundColor Yellow
    Write-Host "  3. Go to SDK Manager and install Android SDK" -ForegroundColor Yellow
    Write-Host "  4. Set ANDROID_HOME environment variable" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 2: Use PWABuilder to convert PWA to APK" -ForegroundColor Yellow
    Write-Host "  1. Deploy this app to any static host (GitHub Pages, Netlify, etc.)" -ForegroundColor Yellow
    Write-Host "  2. Go to https://pwabuilder.com" -ForegroundColor Yellow
    Write-Host "  3. Enter the deployed URL" -ForegroundColor Yellow
    Write-Host "  4. Click 'Build' for Android -> downloads APK" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 3: Use a cloud build service" -ForegroundColor Yellow
    Write-Host "  - https://appmaker.xyz/pwa-to-apk" -ForegroundColor Yellow
    Write-Host "  - https://www.pwabuilder.com" -ForegroundColor Yellow
    exit 1
}

Write-Host "[✓] Android SDK found at: $androidHome" -ForegroundColor Green
Write-Host ""
Write-Host "[.] Installing npm dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "[.] Initializing Capacitor Android project..." -ForegroundColor Cyan
npx cap init FingerDraw com.fingerdraw.app --web-dir . --no-git
npx cap add android

Write-Host ""
Write-Host "[.] Copying web assets..." -ForegroundColor Cyan
npx cap copy android

Write-Host ""
Write-Host "[.] Building APK..." -ForegroundColor Cyan
npx cap open android

Write-Host ""
Write-Host "[!] In Android Studio:" -ForegroundColor Yellow
Write-Host "  1. Wait for Gradle sync to finish" -ForegroundColor Yellow
Write-Host "  2. Go to Build -> Build Bundle(s) / APK(s) -> Build APK(s)" -ForegroundColor Yellow
Write-Host "  3. Find APK at: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Yellow
