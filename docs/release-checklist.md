# TestForge Release Checklist

## Vor jedem Push/Release

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

## GitHub Release-Vorbereitung

1. Änderungen prüfen:

```powershell
git status --short
git diff --stat
```

2. Commit erstellen:

```powershell
git add .
git commit -m "feat: prepare TestForge MVP for local release"
```

3. Nur nach Acun-Freigabe pushen:

```powershell
git push -u origin feat/testfall-automation-mvp
```

## Anderer PC

```powershell
git clone https://github.com/openclawacun-ops/testfall-automation-app.git
cd testfall-automation-app
.\scripts\setup-testforge.ps1
.\scripts\start-testforge.ps1
```

Öffnen:

```text
http://localhost:3000/testfall-automation
```

## Optionaler Datenordner

```powershell
$env:OPENCLAW_WORKSPACE="D:\TestForgeData"
.\scripts\start-testforge.ps1
```

## Release-Entscheidung

- GitHub Repo für Development/anderen PC: empfohlen jetzt
- Portable ZIP: danach möglich
- Öffentliches Hosting: erst nach Datenschutz-/Kundendaten-Entscheidung
