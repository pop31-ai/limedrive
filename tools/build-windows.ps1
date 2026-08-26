param(
    [switch]$SelfContained,
    [switch]$PublishZip
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSCommandPath | Split-Path -Parent
$Proj = Join-Path $Root "platforms/windows/LimeDrive/LimeDrive.csproj"
$Dist = Join-Path $Root "platforms/windows/dist"

Write-Host "== LimeDrive Windows build ==" -ForegroundColor Cyan

if ($SelfContained) {
    Write-Host "Publish: self-contained win-x64" -ForegroundColor Yellow
    dotnet publish $Proj -c Release -r win-x64 --self-contained true -o $Dist
} else {
    Write-Host "Publish: framework-dependent win-x64 (needs .NET 10+ runtime)" -ForegroundColor Yellow
    dotnet publish $Proj -c Release -r win-x64 --self-contained false -o $Dist
}

if ($LASTEXITCODE -ne 0) { throw "dotnet publish failed" }

$exe = Join-Path $Dist "LimeDrive.exe"
if (!(Test-Path $exe)) { throw "LimeDrive.exe not found in $Dist" }

$size = (Get-Item $exe).Length / 1MB
Write-Host ("LimeDrive.exe: {0:N1} MB" -f $size) -ForegroundColor Green

if ($PublishZip) {
    $zip = Join-Path $Root "platforms/windows/LimeDrive-win-x64.zip"
    if (Test-Path $zip) { Remove-Item $zip -Force }
    Compress-Archive -Path "$Dist\*" -DestinationPath $zip
    Write-Host ("ZIP: {0}" -f $zip) -ForegroundColor Green
}

Write-Host "== BUILD OK ==" -ForegroundColor Cyan
