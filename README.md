# TestForge — Testfall Automation App

Lokale Next.js-App für Testfall-Automation: Quelldateien und Vorlagen hochladen, mehrere detailreiche Testfälle generieren, Quality Report prüfen und fertige Artefakte herunterladen.

## Was TestForge aktuell kann

- Upload von `.txt`, `.md`, `.csv`, `.json`, `.docx`, `.xlsx`
- Mehrere Quelldateien gleichzeitig hochladen: jede Datei wird ein eigener Run
- Optionaler Vorlagen-/Template-Upload
- Coverage Mining: aus Anforderungen werden möglichst viele Szenarien erkannt
- Pro Szenario mehrere Testfall-Varianten: Positiv, Negativ/Validierung, Randfall/Regression, Berechtigung, Export/Folgeprozess
- XLSX-Export auf Step-Level: eine Zeile pro Step
- Downloads: ZIP, Markdown, CSV, JSON, XLSX, Quality Report, Manifest
- Alte Runs neu prüfen & neu generieren
- Alles lokal: keine externen Calls, keine Kundendatenübertragung

## Lokale Entwicklung

```powershell
cd C:\Users\openc\.openclaw\workspace\mission-control
npm install
npm run dev
```

Dann öffnen:

```text
http://localhost:3000/testfall-automation
```

## Produktionsstart lokal

```powershell
npm install
npm run build
npm run start
```

Dann öffnen:

```text
http://localhost:3000/testfall-automation
```

## Nutzung auf anderem Windows-PC

Empfohlener Weg:

1. Repo klonen:

```powershell
git clone https://github.com/openclawacun-ops/testfall-automation-app.git
cd testfall-automation-app
```

2. Setup ausführen:

```powershell
.\scripts\setup-testforge.ps1
```

3. Starten:

```powershell
.\scripts\start-testforge.ps1
```

4. Browser öffnen:

```text
http://localhost:3000/testfall-automation
```

## Datenpfad

TestForge speichert Runs standardmäßig unter:

```text
%USERPROFILE%\.openclaw\workspace\testfall-pilot\runs
```

Du kannst einen anderen Arbeitsordner setzen:

```powershell
$env:OPENCLAW_WORKSPACE="D:\TestForgeData"
npm run dev
```

Dann nutzt TestForge:

```text
D:\TestForgeData\testfall-pilot\runs
```

Siehe `.env.example`.

## Checks vor Release

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

Alle drei sollten grün sein.

## Sicherheit

- TestForge sendet keine Dateien extern.
- Uploads werden lokal verarbeitet.
- Download-Routen schützen gegen Path Traversal.
- Alte Runs werden bei „Neu prüfen & generieren“ nicht überschrieben.

## Hosting

Für Website-Hosting mit Uploads/Downloads ist Render oder Railway mit persistentem `/data` Storage empfohlen.

Siehe: [`docs/hosting.md`](docs/hosting.md)

Kurzfassung:

- Render: `render.yaml` + Persistent Disk `/data`
- Railway: `railway.json` + Volume `/data`
- Vercel: nur Demo empfohlen, weil Dateispeicher nicht dauerhaft ist

## Nächste Produktstufe

- echtes Template-Mapping pro Kundenschema
- QC/ALM-spezifischer Export
- Auth/Login vor öffentlicher Nutzung
- Löschfunktion für Runs
- optionaler Installer/portable ZIP
