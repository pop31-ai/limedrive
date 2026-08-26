# LimeDrive for Windows

WPF + WebView2 desktop app. Same engine as Android — local file serving, JS bridge, Update from GitHub, Import ZIP.

## Requirements

- Windows 10 1803+ (WebView2 Runtime — bundled with Edge)
- .NET 10+ runtime (framework-dependent) or .NET 10+ SDK (to build)

## Build

```powershell
# Framework-dependent (smaller, requires .NET runtime on target machine)
.\tools\build-windows.ps1

# Self-contained (~70 MB, no .NET needed)
.\tools\build-windows.ps1 -SelfContained

# Build + ZIP
.\tools\build-windows.ps1 -SelfContained -PublishZip
```

Or manually:
```powershell
dotnet publish platforms/windows/LimeDrive/LimeDrive.csproj -c Release -r win-x64 --self-contained false -o platforms/windows/dist
```

## Run

```powershell
dotnet run --project platforms/windows/LimeDrive/LimeDrive.csproj
```

Or run `platforms/windows/dist/LimeDrive.exe` after publish.

## Features (same as Android)

- **WebView2** with `WebResourceRequested` intercept for local `file://` serving
- **LimeWin bridge** via `AddHostObjectToScript` (JS → C# calls)
- **⟳ Update** — downloads GitHub ZIP → extracts to `www/` next to exe
- **📂 Import ZIP** — file picker → extract to `www/`
- **www/ override** — files next to exe override bundled assets

## Structure

```
platforms/windows/
├── LimeDrive/
│   ├── LimeDrive.csproj
│   ├── App.xaml / App.xaml.cs
│   └── MainWindow.xaml / MainWindow.xaml.cs
└── dist/              (publish output)
```
