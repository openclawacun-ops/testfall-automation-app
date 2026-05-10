import Link from "next/link";
import { createProject, createTask, updateItemStatus } from "@/app/actions";
import { detailSlug } from "@/lib/openclaw-data";
import type { FileItem, MissionData, WorkspaceKind } from "@/lib/openclaw-data";
import { formatDate, statusLabel } from "@/lib/ui";

export const navItems = [
  { href: "/", label: "Dashboard", eyebrow: "Ãœbersicht" },
  { href: "/tasks", label: "Aufgaben", eyebrow: "Queue" },
  { href: "/projects", label: "Projekte", eyebrow: "Portfolio" },
  { href: "/linear", label: "Linear", eyebrow: "Ops" },
  { href: "/content", label: "Content", eyebrow: "Account" },
  { href: "/calendar", label: "Kalender", eyebrow: "Stundenplan" },
  { href: "/memory", label: "Memory", eyebrow: "Wissen" },
  { href: "/docs", label: "Docs", eyebrow: "Dateien" },
  { href: "/team", label: "Team", eyebrow: "Agenten" },
  { href: "/taurus", label: "Taurus", eyebrow: "QA Pilot" },
  { href: "/testfall-automation", label: "Testfall Automation", eyebrow: "MVP" },
  { href: "/qa-bundle", label: "QA Bundle", eyebrow: "Offer" },
  { href: "/tconsulting", label: "Tconsulting", eyebrow: "Kunde" },
];

const tconsultingNavItems = [
  { href: "/tconsulting", label: "Overview", eyebrow: "Start" },
  { href: "/tconsulting/control-hubs", label: "Control Hubs", eyebrow: "00" },
  { href: "/tconsulting/agents", label: "Agent Overview", eyebrow: "01" },
  { href: "/tconsulting/tasks", label: "Task Management", eyebrow: "02" },
  { href: "/tconsulting/projects", label: "Projekte", eyebrow: "03" },
  { href: "/tconsulting/weekly-plan", label: "Wochenplan", eyebrow: "04" },
  { href: "/tconsulting/automation", label: "Automation Center", eyebrow: "05" },
  { href: "/tconsulting/testfaelle", label: "Testfälle", eyebrow: "06" },
  { href: "/tconsulting/testfall-pilot", label: "Testfall Pilot", eyebrow: "06A" },
  { href: "/tconsulting/pilot", label: "Pilot Offer", eyebrow: "07" },
  { href: "/tconsulting/reporting", label: "Reporting", eyebrow: "08" },
  { href: "/tconsulting/research", label: "Research Hub", eyebrow: "09" },
];

export function Shell({ children, data, variant = "default" }: { children: React.ReactNode; data: MissionData; variant?: "default" | "tconsulting" }) {
  const isTconsulting = variant === "tconsulting";
  const sidebarNavItems = isTconsulting ? tconsultingNavItems : navItems;

  return (
    <main className="min-h-screen bg-[#070b12] text-slate-100 antialiased">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside className={`max-h-screen overflow-y-auto border-b p-5 [scrollbar-color:#334155_transparent] [scrollbar-width:thin] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r ${isTconsulting ? "border-sky-400/20 bg-[#06111f]/95" : "border-[#1f2633] bg-[#111823]/95"}`}>
          <Link href={isTconsulting ? "/tconsulting" : "/"} className={`block rounded-[4px] border p-5 shadow-2xl shadow-black/20 ${isTconsulting ? "border-sky-400/30 bg-[#081827]" : "border-pink-400/25 bg-[#151d29]"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.34em] ${isTconsulting ? "text-sky-300" : "text-pink-300"}`}>{isTconsulting ? "Tconsulting" : "OpenClaw"}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.015em] text-slate-50">{isTconsulting ? "QA Command" : "Mission Control"}</h1>
            <p className="mt-2 text-xs leading-5 text-slate-500">{isTconsulting ? "Software Testing · QA Automation · KI-Agenten" : "Aurus Operator-Zentrale · echte lokale Daten"}</p>
          </Link>
          <nav className="mt-5 grid gap-2">
            {sidebarNavItems.map((item) => (
              <Link key={item.href} href={item.href} className={`group rounded-[4px] border px-4 py-3 transition ${isTconsulting ? "border-sky-400/15 bg-[#071523] hover:border-sky-300/60 hover:bg-[#0a1d30]" : "border-[#222936] bg-[#0b111b] hover:border-pink-400/60 hover:bg-[#151d29]"}`}>
                <span className={`block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600 ${isTconsulting ? "group-hover:text-sky-300" : "group-hover:text-pink-300"}`}>{item.eyebrow}</span>
                <span className="mt-1 block text-sm font-medium text-slate-200">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-5 rounded-[4px] border border-[#222936] bg-[#0b111b] p-4 text-xs text-slate-500">
            <p className="font-medium text-slate-300">Letzter Live-Scan</p>
            <p className="mt-1">{new Date(data.generatedAt).toLocaleString("de-DE")}</p>
          </div>
          {isTconsulting ? (
            <Link href="/" className="mt-5 block rounded-[4px] border border-pink-400/30 bg-pink-400/10 p-4 text-xs transition hover:border-pink-300 hover:bg-pink-400/15">
              <p className="font-semibold uppercase tracking-[0.2em] text-pink-300">Zurück</p>
              <p className="mt-1 text-slate-300">OpenClaw Hauptansicht öffnen →</p>
            </Link>
          ) : (
            <Link href="/tconsulting" target="_blank" className="mt-5 block rounded-[4px] border border-sky-400/35 bg-sky-400/10 p-4 text-xs transition hover:border-sky-300 hover:bg-sky-400/15">
              <p className="font-semibold uppercase tracking-[0.2em] text-sky-300">Kunden-Cockpit</p>
              <p className="mt-1 text-slate-300">Tconsulting in neuem Fenster öffnen →</p>
            </Link>
          )}
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="border-b border-[#1f2633] bg-[#0b111b]/80 px-6 py-7 md:px-9">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-pink-300">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.015em] text-slate-50 md:text-4xl">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
        </div>
        {action}
      </div>
    </header>
  );
}

export function MetricCard({ label, value, detail, href }: { label: string; value: string | number; detail?: string; href?: string }) {
  const content = (
    <div className="h-full rounded-[4px] border border-[#222936] bg-[#111722] p-5 transition hover:border-pink-400/55 hover:bg-[#151d29]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-50">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="shrink-0 rounded-md bg-[#b8943a]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#e6c66a] ring-1 ring-[#b8943a]/25">{children}</span>;
}

export function ProgressBar({ progress }: { progress?: FileItem["progress"] }) {
  const percent = progress?.percent ?? 0;
  return (
    <div className="mt-3">
      <div className="h-1.5 overflow-hidden rounded-md bg-stone-800">
        <div className="h-full rounded-md bg-[#b8943a]" style={{ width: `${percent}%` }} />
      </div>
      {progress ? <p className="mt-1 text-[10px] text-stone-500">{progress.done}/{progress.total} erledigt Â· {progress.percent}%</p> : null}
    </div>
  );
}

export function ItemCard({ item, dense = false, kind }: { item: FileItem; dense?: boolean; kind?: WorkspaceKind }) {
  const href = kind ? `/${kind}/${detailSlug(item)}` : undefined;
  const title = <h3 className="line-clamp-2 text-base font-medium text-stone-100">{item.title}</h3>;
  return (
    <article className="rounded-lg border border-stone-800/90 bg-[#14120e] p-5 transition hover:border-[#b8943a]/45 hover:bg-[#1d180f]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {href ? <Link href={href} className="hover:text-[#e6c66a]">{title}</Link> : title}
          <p className={`mt-2 ${dense ? "line-clamp-2" : "line-clamp-3"} text-sm leading-6 text-stone-500`}>{item.excerpt || item.relativePath}</p>
        </div>
        {item.status ? <StatusPill>{statusLabel(item.status)}</StatusPill> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500">
        {item.project ? <span>Projekt: {item.project}</span> : null}
        {item.owner ? <span>Owner: {item.owner}</span> : null}
        {item.assigned ? <span>Zugewiesen: {item.assigned}</span> : null}
        <span>{formatDate(item.updatedAt)}</span>
        <span className="truncate">{item.relativePath}</span>
      </div>
      {item.nextActions.length ? (
        <div className="mt-4 rounded-md border border-stone-800 bg-[#0c0a07] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c6a04a]">Nächste Aktionen</p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-stone-400">
            {item.nextActions.slice(0, dense ? 2 : 4).map((action) => <li key={action}>• {action}</li>)}
          </ul>
        </div>
      ) : null}
      <ProgressBar progress={item.progress} />
      {href ? <Link href={href} className="mt-4 inline-flex text-xs font-semibold text-[#e6c66a] hover:text-[#f1d98f]">Details öffnen →</Link> : null}
    </article>
  );
}

export function StatusEditForm({ item, kind }: { item: FileItem; kind: WorkspaceKind }) {
  const statuses = ["backlog", "active", "in-progress", "blocked", "done"];
  return (
    <form action={updateItemStatus} className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-800/90 bg-[#14120e] p-4">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="relativePath" value={item.relativePath} />
      <label className="grid gap-1 text-xs text-stone-500">
        Status bearbeiten
        <select name="status" defaultValue={item.status ?? "backlog"} className="rounded-md border border-stone-800 bg-[#080806] px-3 py-2.5 text-xs text-stone-100 outline-none transition focus:border-[#b8943a]/70">
          {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
        </select>
      </label>
      <button className="rounded-md bg-[#b8943a] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-black transition hover:bg-[#cba64d]">Speichern</button>
    </form>
  );
}

export function CreateForm({ type }: { type: "task" | "project" }) {
  const action = type === "task" ? createTask : createProject;
  return (
    <form action={action} className="grid gap-2 rounded-lg border border-stone-800/90 bg-[#14120e] p-4 md:grid-cols-[1fr_1.5fr_auto]">
      <input name="title" required placeholder={type === "task" ? "Neue Aufgabe" : "Neues Projekt"} className="rounded-md border border-stone-800 bg-[#080806] px-3 py-2.5 text-xs text-stone-100 outline-none transition focus:border-[#b8943a]/70" />
      <input name="body" placeholder="Kurzbeschreibung / nÃ¤chster Schritt" className="rounded-md border border-stone-800 bg-[#080806] px-3 py-2.5 text-xs text-stone-100 outline-none transition focus:border-[#b8943a]/70" />
      <button className="rounded-md bg-[#b8943a] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-black transition hover:bg-[#cba64d]">Anlegen</button>
    </form>
  );
}
