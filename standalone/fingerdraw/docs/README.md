# FingerDraw 🎨

**Professional finger drawing app for tablet artists.**
Designed strictly for finger use on Android tablets and touch devices.

![FingerDraw](assets/icons/icon-512.png)

## Features

- **Two Drawing Modes**
  - `Precise` — magnified view shows exactly what's under your finger
  - `Visible` — drawing offset so you can see every stroke without your hand blocking

- **Preview Panel** — see your tool preview + magnified drawing area in real-time

- **Zoom View** — 4× magnified circle showing the area around your finger

- **Selection Tools** — select, view, and manage areas of your canvas

- **Layer System** — multiple layers with visibility toggle

- **Tools** — Pen, Brush, Marker, Airbrush, Eraser with adjustable size & opacity

- **Undo/Redo** — 30-step history

- **Export** — save your artwork as PNG

## Quick Start

### Option 1: Open in Browser (Android)

1. Open `index.html` in Chrome on your tablet
2. Tap "Add to Home Screen" from Chrome menu → use like a native app

### Option 2: Install via PWA

1. Serve files with any static server:
   ```
   npx serve .
   ```
2. Open the URL on your tablet
3. Chrome will prompt "Add to Home Screen"

### Option 3: Build APK

See [APK Build Guide](docs/INSTALL.md#building-apk).

## Requirements

- Modern browser with Canvas and ES6 module support
- Touchscreen device (tablet recommended)
- Android 8+ / iOS 12+ / modern desktop browser

## Project Structure

```
fingerdraw/
├── index.html              # Main HTML
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── src/
│   ├── app.js              # Main application
│   ├── styles.css          # Styles
│   ├── canvas/
│   │   ├── mainCanvas.js   # Drawing engine
│   │   ├── layerManager.js # Layer management
│   │   ├── previewCanvas.js# Preview panel
│   │   └── zoomCanvas.js   # Zoom magnifier
│   ├── tools/
│   │   └── pen.js          # Drawing tools
│   ├── modes/
│   │   ├── preciseMode.js  # Precise under-finger mode
│   │   └── visibleMode.js  # Visible drawing mode
│   └── utils/
│       ├── touch.js        # Touch/mouse handler
│       ├── history.js      # Undo/redo
│       └── selection.js    # Selection manager
├── docs/
│   ├── README.md           # This file
│   ├── INSTALL.md          # Installation guide
│   ├── GUIDE.md            # Usage guide
│   └── API.md              # API reference
├── lessons/                # 6 drawing lessons
├── assets/icons/           # App icons
└── scripts/
    └── build-apk.ps1       # APK build script
```
