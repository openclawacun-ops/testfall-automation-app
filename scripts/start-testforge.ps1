$ErrorActionPreference = "Stop"

if (-not (Test-Path package.json)) {
  Write-Error "Bitte das Script im TestForge-Projektordner ausführen."
}

$workspace = if ($env:OPENCLAW_WORKSPACE) { $env:OPENCLAW_WORKSPACE } else { Join-Path $env:USERPROFILE ".openclaw\workspace" }
$runs = Join-Path $workspace "testfall-pilot\runs"
New-Item -ItemType Directory -Force -Path $runs | Out-Null

Write-Host "== TestForge Start ==" -ForegroundColor Cyan
Write-Host "Workspace: $workspace" -ForegroundColor DarkGray
Write-Host "Open: http://localhost:3000/testfall-automation" -ForegroundColor Green

npm run start
