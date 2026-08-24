$ErrorActionPreference = "Stop"

$sdk = "$env:LOCALAPPDATA\Android\Sdk"
if (-not (Test-Path $sdk)) { $sdk = $env:ANDROID_HOME }
if (-not $sdk -or -not (Test-Path $sdk)) { throw "Android SDK not found" }

$bt = Get-ChildItem "$sdk\build-tools" -Directory | Sort-Object Name -Descending | Select-Object -First 1
$btPath = $bt.FullName
$platformJar = Get-ChildItem "$sdk\platforms\android-*\android.jar" | Sort-Object { [int]($_.Directory.Name -replace 'android-','') } -Descending | Select-Object -First 1 -ExpandProperty FullName

$rootDir = Split-Path -Parent $PSScriptRoot
$projDir = Join-Path $rootDir "platforms\android"
$objDir = Join-Path $projDir "obj"
$distDir = Join-Path $projDir "dist"
$dexDir = Join-Path $objDir "dex"

Write-Host "== LimeDrive APK build =="
Write-Host "SDK: $sdk"
Write-Host "build-tools: $($bt.Name)"
Write-Host "platform: $platformJar"

if (Test-Path $objDir) { Remove-Item $objDir -Recurse -Force }
New-Item -ItemType Directory -Path "$objDir\assets", $dexDir, $distDir -Force | Out-Null

Write-Host "-- assets --"
$assets = Join-Path $objDir "assets\www"
robocopy $rootDir $assets /E /NFL /NDL /NJH /NJS /NP `
  /XD node_modules .git tests reports platforms .github obj dist articles `
  /XF package-lock.json "*.patent.txt" | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed: $LASTEXITCODE" }
$assetFiles = (Get-ChildItem $assets -Recurse -File).Count
Write-Host "   files: $assetFiles"

Write-Host "-- icon --"
New-Item -ItemType Directory -Path (Join-Path $projDir "res\drawable-nodpi") -Force | Out-Null
Copy-Item (Join-Path $rootDir "icons\icon-512.png") (Join-Path $projDir "res\drawable-nodpi\icon.png") -Force

Write-Host "-- aapt2 compile --"
& "$btPath\aapt2.exe" compile --dir (Join-Path $projDir "res") -o (Join-Path $objDir "res.zip")
if ($LASTEXITCODE -ne 0) { throw "aapt2 compile failed" }

Write-Host "-- aapt2 link --"
$baseApk = Join-Path $objDir "base.apk"
& "$btPath\aapt2.exe" link -o $baseApk -I $platformJar --manifest (Join-Path $projDir "AndroidManifest.xml") (Join-Path $objDir "res.zip") --auto-add-overlay
if ($LASTEXITCODE -ne 0) { throw "aapt2 link failed" }

Write-Host "-- javac --"
$classesOut = Join-Path $objDir "classes"
New-Item -ItemType Directory -Path $classesOut -Force | Out-Null
$sources = Get-ChildItem (Join-Path $projDir "java") -Recurse -Filter *.java | ForEach-Object { $_.FullName }
$sourcesFile = Join-Path $objDir "javac-sources.txt"
Set-Content -Path $sourcesFile -Value $sources -Encoding ASCII
javac --release 8 -cp $platformJar -d $classesOut "@$sourcesFile"
if ($LASTEXITCODE -ne 0) { throw "javac failed" }

Write-Host "-- d8 --"
$classesJar = Join-Path $objDir "classes.jar"
jar cf $classesJar -C $classesOut "."
if ($LASTEXITCODE -ne 0) { throw "jar failed" }
& "$btPath\d8.bat" --release --lib $platformJar --output $dexDir $classesJar
if ($LASTEXITCODE -ne 0) { throw "d8 failed" }

Write-Host "-- pack assets + classes.dex --"
Add-Type -AssemblyName System.IO.Compression.FileSystem
$apkZip = [System.IO.Compression.ZipFile]::Open($baseApk, 'Update')
Get-ChildItem $assets -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($assets.Length + 1).Replace('\', '/')
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($apkZip, $_.FullName, "assets/www/$rel") | Out-Null
}
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($apkZip, (Join-Path $dexDir "classes.dex"), "classes.dex") | Out-Null
$apkZip.Dispose()

Write-Host "-- zipalign --"
$aligned = Join-Path $objDir "aligned.apk"
& "$btPath\zipalign.exe" -f 4 $baseApk $aligned
if ($LASTEXITCODE -ne 0) { throw "zipalign failed" }

Write-Host "-- keystore --"
$ks = Join-Path $projDir "debug.keystore"
if (-not (Test-Path $ks)) {
  keytool -genkeypair -keystore $ks -alias limedrive -storepass android -keypass android `
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=LimeDrive,O=LimeDrive,C=US" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "keytool failed" }
}

Write-Host "-- apksigner --"
$outApk = Join-Path $distDir "LimeDrive.apk"
& "$btPath\apksigner.bat" sign --ks $ks --ks-pass pass:android --key-pass pass:android --out $outApk $aligned
if ($LASTEXITCODE -ne 0) { throw "apksigner failed" }

& "$btPath\apksigner.bat" verify --print-certs $outApk | Select-Object -First 3
$size = "{0:N1} MB" -f ((Get-Item $outApk).Length / 1MB)
Write-Host ""
Write-Host "OK $outApk ($size)"
Write-Host "install: adb install -r `"$outApk`""
