import Link from "next/link";
import { notFound } from "next/navigation";
import { getMissionData, getWorkspaceItemDetail } from "@/lib/openclaw-data";
import type { WorkspaceKind } from "@/lib/openclaw-data";
import { formatDateTime, statusLabel } from "@/lib/ui";
import { PageHeader, Shell, StatusEditForm, StatusPill } from "@/components/mission-components";

const kindLabels: Record<WorkspaceKind, { back: string; eyebrow: string; title: string }> = {
  tasks: { back: "/tasks", eyebrow: "Aufgabendetail", title: "Aufgabe" },
  projects: { back: "/projects", eyebrow: "Projektdetail", title: "Projekt" },
};

export function ItemDetailPage({ kind, slug }: { kind: WorkspaceKind; slug: string }) {
  const data = getMissionData();
  const item = getWorkspaceItemDetail(kind, slug);
  if (!item) notFound();

  const labels = kindLabels[kind];

  return (
    <Shell data={data}>
      <PageHeader
        eyebrow={labels.eyebrow}
        title={item.title || labels.title}
        description="Detailansicht mit Status-Bearbeitung, Metadaten, nächsten Aktionen und Rohinhalt der lokalen Markdown-Datei."
        action={<Link href={labels.back} className="rounded-md border border-stone-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-300 hover:border-[#b8943a]/70 hover:text-[#e6c66a]">Zurück</Link>}
      />
      <div className="space-y-6 p-6 md:p-9">
        <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <article className="rounded-lg border border-stone-800/90 bg-[#14120e] p-5">
            <div className="flex flex-wrap items-center gap-3">
              {item.status ? <StatusPill>{statusLabel(item.status)}</StatusPill> : null}
              <span className="text-xs text-stone-500">Geändert: {formatDateTime(item.updatedAt)}</span>
              <span className="text-xs text-stone-500">{item.relativePath}</span>
            </div>
            {item.nextActions.length ? (
              <div className="mt-5 rounded-md border border-stone-800 bg-[#0c0a07] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c6a04a]">Nächste Aktionen</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">
                  {item.nextActions.map((action) => <li key={action}>• {action}</li>)}
                </ul>
              </div>
            ) : null}
            <pre className="mt-5 max-h-[680px] overflow-auto whitespace-pre-wrap rounded-md border border-stone-800 bg-[#080806] p-4 text-sm leading-6 text-stone-300">{item.raw || "Keine Inhalte."}</pre>
          </article>
          <aside className="space-y-4">
            <StatusEditForm item={item} kind={kind} />
            <div className="rounded-lg border border-stone-800/90 bg-[#14120e] p-4 text-xs leading-6 text-stone-500">
              <p className="font-semibold uppercase tracking-[0.2em] text-stone-300">Metadaten</p>
              {item.project ? <p className="mt-3">Projekt: {item.project}</p> : null}
              {item.owner ? <p>Owner: {item.owner}</p> : null}
              {item.assigned ? <p>Zugewiesen: {item.assigned}</p> : null}
              {item.created ? <p>Erstellt: {item.created}</p> : null}
              <p>Dateityp: {item.type}</p>
              <p>Größe: {item.size} Bytes</p>
            </div>
          </aside>
        </section>
      </div>
    </Shell>
  );
}
