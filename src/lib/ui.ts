import type { FileItem } from "@/lib/openclaw-data";

export function statusLabel(value?: string) {
  if (!value) return "ohne Status";
  const labels: Record<string, string> = {
    done: "erledigt",
    complete: "erledigt",
    completed: "erledigt",
    backlog: "Backlog",
    active: "aktiv",
    draft: "Entwurf",
    "in-progress": "in Arbeit",
    "phase-3-built": "Phase 3 gebaut",
    running: "läuft",
    connected: "verbunden",
    configured: "konfiguriert",
    ready: "bereit",
    unknown: "unklar",
    verbunden: "verbunden",
  };
  return labels[value.toLowerCase()] ?? value;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function isDone(item: FileItem) {
  return ["done", "complete", "completed", "erledigt", "phase-3-built", "phase-2-built", "phase-1-built"].includes((item.status ?? "").toLowerCase());
}

export function doneCount(items: FileItem[]) {
  return items.filter(isDone).length;
}

export function splitDone(items: FileItem[]) {
  return {
    active: items.filter((item) => !isDone(item)),
    done: items.filter(isDone),
  };
}
