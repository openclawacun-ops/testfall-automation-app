$ErrorActionPreference = "Stop"

Write-Host "== TestForge Setup ==" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js wurde nicht gefunden. Bitte Node.js 20+ installieren: https://nodejs.org"
}

$nodeVersion = node -v
Write-Host "Node: $nodeVersion" -ForegroundColor DarkGray

if (-not (Test-Path package.json)) {
  Write-Error "Bitte das Script im TestForge-Projektordner ausführen."
}

npm install

$workspace = if ($env:OPENCLAW_WORKSPACE) { $env:OPENCLAW_WORKSPACE } else { Join-Path $env:USERPROFILE ".openclaw\workspace" }
$runs = Join-Path $workspace "testfall-pilot\runs"
New-Item -ItemType Directory -Force -Path $runs | Out-Null

Write-Host "Workspace: $workspace" -ForegroundColor Green
Write-Host "Runs:      $runs" -ForegroundColor Green

npm run build

Write-Host "Setup fertig. Starte mit: .\scripts\start-testforge.ps1" -ForegroundColor Cyan
