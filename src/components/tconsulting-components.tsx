import Link from "next/link";
import type { FileItem } from "@/lib/openclaw-data";
import { formatDate, formatDateTime, statusLabel } from "@/lib/ui";
import { tconsultingProjectHref, tconsultingTaskHref } from "@/lib/tconsulting-data";

export function THeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="border-b border-sky-400/15 px-6 py-7 md:px-9">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-sky-300">{eyebrow}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
        </div>
        {action}
      </div>
    </header>
  );
}

export function TPage({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,.20),transparent_34rem),linear-gradient(180deg,#06111f,#020817)] text-slate-100">{children}</main>;
}

export function TPanel({ title, eyebrow, children, id }: { title: string; eyebrow: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-[8px] border border-sky-400/20 bg-[#071523]/95 p-6 shadow-[0_24px_80px_rgba(2,8,23,.35)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-sky-300/80">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-50">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function TActionButton({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <Link href={href} className={`inline-flex rounded-[4px] px-3 py-2 text-[10px] font-black uppercase tracking-wide transition ${primary ? "bg-sky-400 text-[#03111f] hover:bg-sky-300" : "border border-sky-400/30 text-sky-200 hover:bg-sky-400/10"}`}>
      {children}
    </Link>
  );
}

export function TStatusPill({ value }: { value?: string }) {
  const normalized = value ?? "todo";
  const tone = /working|active|doing|progress/i.test(normalized) ? "bg-sky-400/15 text-sky-200 ring-sky-300/25" : /done|complete/i.test(normalized) ? "bg-emerald-400/15 text-emerald-200 ring-emerald-300/25" : "bg-slate-400/10 text-slate-300 ring-slate-300/20";
  return <span className={`rounded-[4px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${tone}`}>{statusLabel(normalized)}</span>;
}

export function TStatCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-[6px] border border-sky-400/20 bg-[#081827] p-5 shadow-[0_20px_60px_rgba(8,47,73,.22)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-300/80">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-sky-50">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
    </div>
  );
}

export function TTaskCard({ task, index = 0 }: { task: FileItem; index?: number }) {
  return (
    <Link href={tconsultingTaskHref(task)} className="block rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4 hover:border-sky-300/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{task.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{task.excerpt}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <span className="rounded-[4px] bg-sky-400/10 px-2 py-1 text-[10px] font-bold text-sky-200">{index < 2 ? "High" : index < 5 ? "Medium" : "Low"}</span>
          <TStatusPill value={task.status} />
        </div>
      </div>
      <p className="mt-3 text-[10px] text-slate-500">Tconsulting Task · {formatDate(task.updatedAt)}</p>
    </Link>
  );
}

export function TProjectCard({ project }: { project: FileItem }) {
  return (
    <Link href={tconsultingProjectHref(project)} className="block rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4 hover:border-sky-300/50">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-100">{project.title}</p>
        <span className="text-[10px] text-slate-500">{formatDate(project.updatedAt)}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-sky-400" style={{ width: `${project.progress?.percent ?? 20}%` }} />
      </div>
      <p className="mt-2 text-[10px] text-slate-500">Tconsulting Projekt · Fortschritt: {project.progress?.percent ?? 20}%</p>
    </Link>
  );
}

export function TDetail({ item, type }: { item: FileItem & { raw: string }; type: "Task" | "Projekt" }) {
  return (
    <div className="space-y-6 p-6 md:p-9">
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <article className="rounded-[8px] border border-sky-400/20 bg-[#071523] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <TStatusPill value={item.status} />
            <span className="text-xs text-slate-500">Geändert: {formatDateTime(item.updatedAt)}</span>
            <span className="text-xs text-slate-500">{type}: Tconsulting</span>
          </div>
          {item.nextActions.length ? (
            <div className="mt-5 rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-300">Nächste Aktionen</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                {item.nextActions.map((action) => <li key={action}>• {action}</li>)}
              </ul>
            </div>
          ) : null}
          <pre className="mt-5 max-h-[680px] overflow-auto whitespace-pre-wrap rounded-[6px] border border-sky-400/15 bg-[#020817] p-4 text-sm leading-6 text-slate-300">{item.raw || "Keine Inhalte."}</pre>
        </article>
        <aside className="rounded-[8px] border border-sky-400/20 bg-[#071523] p-4 text-xs leading-6 text-slate-500">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-300">Tconsulting Metadaten</p>
          {item.project ? <p className="mt-3">Projekt: {item.project}</p> : null}
          {item.owner ? <p>Owner: {item.owner}</p> : null}
          {item.assigned ? <p>Zugewiesen: {item.assigned}</p> : null}
          {item.created ? <p>Erstellt: {item.created}</p> : null}
          <p>Datei: {item.relativePath}</p>
          <div className="mt-4"><TActionButton href={type === "Task" ? "/tconsulting/tasks" : "/tconsulting/projects"}>Zurück zur Tconsulting-Liste</TActionButton></div>
        </aside>
      </section>
    </div>
  );
}
