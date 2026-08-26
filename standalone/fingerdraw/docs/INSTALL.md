# Installation Guide

## 🇷🇺 Установка | 🇬🇧 Installation

---

### 🌐 PWA (рекомендуется / recommended)

**Русский:**
1. Откройте `index.html` в Chrome на планшете
2. Нажмите «⋮» → «Добавить на главный экран»
3. Готово — приложение работает как родное

**English:**
1. Open `index.html` in Chrome on your tablet
2. Tap "⋮" → "Add to Home Screen"
3. Done — works like a native app

---

### 🤖 APK (Android)

#### Option A: Use PWABuilder (no setup required)

1. Deploy this folder to any static hosting (GitHub Pages, Netlify)
2. Go to [https://pwabuilder.com](https://pwabuilder.com)
3. Enter your deployed URL → click "Build" → download APK

#### Option B: Capacitor CLI (requires Android SDK)

**Prerequisites:**
- Android SDK (install via Android Studio)
- Java 17+
- Node.js 18+

```bash
# Install dependencies
npm install

# Add Android platform
npx cap init FingerDraw com.fingerdraw.app --web-dir .
npx cap add android

# Copy web assets
npx cap copy android

# Open in Android Studio
npx cap open android

# In Android Studio: Build → Build APK(s)
```

#### Option C: PowerShell script

```powershell
.\scripts\build-apk.ps1
```

---

### 🖥 Desktop

Open `index.html` in any modern browser.
Mouse and keyboard supported alongside touch.

---

### 📱 iOS

1. Open in Safari
2. Tap Share → "Add to Home Screen"
3. Installed as standalone web app
