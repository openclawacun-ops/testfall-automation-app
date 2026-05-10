import Link from "next/link";
import { Badge, Card, TestForgeHeader, TestForgeShell } from "@/components/testforge-shell";
import { getTestfallAutomationRuns } from "@/lib/testfall-automation";
import { formatDateTime } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default function TestfallLibraryPage() {
  const runs = getTestfallAutomationRuns(30);
  const artifacts = runs.flatMap((run) => run.artifacts.map((artifact) => ({ ...artifact, runId: run.runId, runTitle: run.title, guardStatus: run.guardStatus })));

  return (
    <TestForgeShell active="library">
      <TestForgeHeader title="Bibliothek" subtitle="Übersicht über lokale Runs und erzeugte Artefakte" />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <h2 className="text-2xl font-bold tracking-[-0.03em]">Runs</h2>
          <div className="mt-5 grid gap-3">
            {runs.length ? runs.map((run) => (
              <Link key={run.runId} href={`/testfall-automation/runs/${run.runId}`} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 transition hover:border-violet-200 hover:bg-violet-50/50">
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
              <Link key={`${artifact.runId}-${artifact.relativePath}`} href={`/testfall-automation/runs/${artifact.runId}`} className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 transition hover:border-violet-200 hover:bg-violet-50/50 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2"><Badge tone="sky">{artifact.kind}</Badge><Badge tone={artifact.guardStatus === "ready_for_review" ? "emerald" : "amber"}>{artifact.guardStatus.replaceAll("_", " ")}</Badge></div>
                  <p className="mt-3 truncate text-sm font-bold text-slate-950">{artifact.name}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{artifact.runTitle}</p>
                </div>
                <div className="text-xs text-slate-400 md:text-right">
                  <p>{(artifact.bytes / 1024).toFixed(1)} KB</p>
                  <p>{formatDateTime(artifact.updatedAt)}</p>
                </div>
              </Link>
            )) : <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">Noch keine Artefakte vorhanden.</p>}
          </div>
        </Card>
      </div>
    </TestForgeShell>
  );
}
