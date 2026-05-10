# TestForge Hosting Guide

## Empfehlung

Für eine echte nutzbare Website mit Uploads/Downloads ist **Render oder Railway mit persistentem Storage/Volume** besser als Vercel.

- **Vercel**: sehr gut für UI-Demo, aber Dateispeicher ist nicht dauerhaft.
- **Railway**: gut für schnelle App-Deployments; Volume für `/data` manuell anlegen.
- **Render**: gut für Docker + persistent disk; `render.yaml` ist vorbereitet.

## Wichtige Umgebungsvariable

```text
OPENCLAW_WORKSPACE=/data
```

TestForge speichert Runs dann unter:

```text
/data/testfall-pilot/runs
```

## Render Deployment

1. GitHub Repo verbinden.
2. Blueprint/Render YAML nutzen oder Web Service aus Dockerfile erstellen.
3. Persistent Disk aktivieren:
   - Mount Path: `/data`
   - Size: mindestens 1 GB
4. Env setzen:
   - `OPENCLAW_WORKSPACE=/data`
   - `NODE_ENV=production`
5. Deploy starten.

Die Datei `render.yaml` ist bereits vorbereitet.

## Railway Deployment

1. GitHub Repo verbinden.
2. Railway erkennt `railway.json` und nutzt das Dockerfile.
3. Service deployen.
4. Volume anlegen und nach `/data` mounten.
5. Env setzen:
   - `OPENCLAW_WORKSPACE=/data`
   - `NODE_ENV=production`
6. Öffentliche Domain in Railway aktivieren.

## Vercel Demo Deployment

Vercel kann für eine schnelle Demo genutzt werden, aber generierte Runs/Downloads sind nicht zuverlässig dauerhaft gespeichert.

Wenn Vercel genutzt wird:

1. GitHub Repo importieren.
2. Framework: Next.js.
3. Build Command: `npm run build`.
4. Output: automatisch.
5. Hinweis: Für Produktbetrieb später Storage ergänzen.

## Datenschutz / Produktbetrieb

Vor öffentlicher Nutzung mit Kundendateien sollten ergänzt werden:

- Login/Auth
- Upload-Größenlimit
- Löschfunktion für Runs
- Datenschutztext
- Nutzer-/Projekttrennung
- Backup/Retention-Regel

## Lokaler Docker-Test

```powershell
docker build -t testforge .
docker run --rm -p 3000:3000 -e OPENCLAW_WORKSPACE=/data testforge
```

Dann öffnen:

```text
http://localhost:3000/testfall-automation
```
