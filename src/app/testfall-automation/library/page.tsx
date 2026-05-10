import Link from "next/link";
import { Badge, Card, TestForgeHeader, TestForgeShell } from "@/components/testforge-shell";
import { getTestfallAutomationRuns } from "@/lib/testfall-automation";
import { formatDateTime } from "@/lib/ui";

export const dynamic = "force-dynamic";

type Props = { searchParams?: Promise<{ batch?: string }> };

export default async function TestfallLibraryPage({ searchParams }: Props) {
  const batch = (await searchParams)?.batch;
  const runs = getTestfallAutomationRuns(30);
  const artifacts = runs.flatMap((run) => run.artifacts.map((artifact) => ({ ...artifact, runId: run.runId, runTitle: run.title, guardStatus: run.guardStatus })));

  return (
    <TestForgeShell active="library">
      <TestForgeHeader title="Bibliothek" subtitle="Übersicht über lokale Runs und erzeugte Artefakte" />

      {batch ? <div className="mb-6 rounded-3xl border border-emerald-200/80 bg-emerald-50/82 px-5 py-4 text-sm font-semibold text-emerald-800 shadow-[0_16px_42px_rgba(16,185,129,0.10)] backdrop-blur-2xl">Batch fertig: {batch} Dateien wurden als eigene Runs generiert.</div> : null}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <h2 className="text-2xl font-bold tracking-[-0.03em]">Runs</h2>
          <div className="mt-5 grid gap-3">
            {runs.length ? runs.map((run) => (
              <Link key={run.runId} href={`/testfall-automation/runs/${run.runId}`} className="rounded-3xl border border-white/80 bg-white/58 p-4 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white/82 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <Badge tone={run.guardStatus === "ready_for_review" ? "emerald" : "amber"}>{run.guardStatus.replaceAll("_", " ")}</Badge>
                <p className="mt-3 line-clamp-2 text-sm font-bold text-slate-950">{run.title}</p>
                <p className="mt-1 text-xs text-slate-500">{run.testcaseCount} Testfälle · {formatDateTime(run.updatedAt)}</p>
              </Link>
            )) : <p className="text-sm text-slate-500">Keine Runs gefunden.</p>}
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-[-0.03em]">Artefakte</h2>
            <Badge tone="violet">{artifacts.length}</Badge>
          </div>
          <div className="grid gap-3">
            {artifacts.length ? artifacts.map((artifact) => (
              <Link key={`${artifact.runId}-${artifact.relativePath}`} href={`/testfall-automation/runs/${artifact.runId}/download/${encodeURIComponent(artifact.name)}`} className="grid gap-3 rounded-3xl border border-white/80 bg-white/58 p-4 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white/82 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2"><Badge tone="sky">{artifact.kind}</Badge><Badge tone={artifact.guardStatus === "ready_for_review" ? "emerald" : "amber"}>{artifact.guardStatus.replaceAll("_", " ")}</Badge></div>
                  <p className="mt-3 truncate text-sm font-bold text-slate-950">{artifact.name}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{artifact.runTitle}</p>
                </div>
                <div className="text-xs text-slate-400 md:text-right">
                  <p>{(artifact.bytes / 1024).toFixed(1)} KB</p>
                  <p>{formatDateTime(artifact.updatedAt)}</p>
                  <p className="mt-1 font-bold text-slate-800">Download</p>
                </div>
              </Link>
            )) : <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">Noch keine Artefakte vorhanden.</p>}
          </div>
        </Card>
      </div>
    </TestForgeShell>
  );
}
