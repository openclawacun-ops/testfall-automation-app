# OpenClaw Mission Control

Lokales Next.js-Dashboard für Acuns OpenClaw-Agentensystem.

## Zweck

Mission Control zeigt den echten Zustand des Agenten-Systems: Agenten, Aufgaben, Projekte, Memory, Dokumente, Kalenderdateien und Live-Kanalstatus. Es ist bewusst als seriöse, dunkle Kommandozentrale gestaltet — kein Spielzeug-Dashboard.

## Datenquellen

Mission Control liest echte lokale OpenClaw-Daten aus:

- `~/.openclaw/workspace`
- `~/.openclaw/openclaw.json`
- `~/.openclaw/agents/*/workspace`
- `~/Documents/OpenClaw-Obsidian-Memory`, falls vorhanden

Es werden keine Mock-Daten verwendet.

## Starten

```powershell
cd C:\Users\openc\.openclaw\workspace\mission-control
npm run dev
```

Dann im Browser öffnen:

```text
http://localhost:3000
```

Falls Port `3000` belegt ist, zeigt Next.js automatisch einen anderen Port an.

## Build prüfen

```powershell
npm run lint
npm run build
```

## Aktuelle Screens

- Team
- Aufgaben
- Kalender
- Projekte
- Memory
- Dokumente
- Live-Kanäle

## Nächste sinnvolle Phase

Phase 4 sollte GitHub, Google Calendar, Discord Webhook-Status, File-Watcher/Auto-Refresh und detailliertere Agenten-Workloads ergänzen.
