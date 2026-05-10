import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Badge, Card, TestForgeHeader, TestForgeShell } from "@/components/testforge-shell";
import { getTestfallAutomationRun } from "@/lib/testfall-automation";
import { formatDateTime } from "@/lib/ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ runId: string }> };

export default async function TestfallAutomationRunPage({ params }: Props) {
  const { runId } = await params;
  const run = getTestfallAutomationRun(runId);
  if (!run) notFound();

  return (
    <TestForgeShell active="detail">
      <TestForgeHeader
        title={run.title}
        subtitle="Run-Detailansicht für Manifest, Testfälle, offene Fragen und Artefakte"
        action={<Link href="/testfall-automation" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700">← Dashboard</Link>}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Status" value={run.guardStatus.replaceAll("_", " ")} tone={run.guardStatus === "ready_for_review" ? "emerald" : "amber"} />
        <Metric label="Testfälle" value={run.testcaseCount} tone="violet" />
        <Metric label="Steps" value={run.stepCount} tone="sky" />
        <Metric label="Offene Fragen" value={run.openQuestionsCount} tone={run.openQuestionsCount ? "amber" : "emerald"} />
        <Metric label="Artefakte" value={run.artifacts.length} tone="violet" />
      </section>

      <Card className="mt-8">
        <div className="flex flex-wrap gap-2">
          <Badge tone={run.guardStatus === "ready_for_review" ? "emerald" : "amber"}>{run.guardStatus.replaceAll("_", " ")}</Badge>
          <Badge tone="sky">{run.riskLevel ?? "Risiko offen"}</Badge>
          {run.project ? <Badge tone="violet">{run.project}</Badge> : null}
        </div>
        <div className="mt-5 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
          <p className="break-all">Run-ID: {run.runId}</p>
          <p>Aktualisiert: {formatDateTime(run.updatedAt)}</p>
          {run.createdAt ? <p>Erstellt: {formatDateTime(run.createdAt)}</p> : null}
          {run.missingFiles.length ? <p className="text-amber-600">Fehlende MVP-Dateien: {run.missingFiles.join(", ")}</p> : null}
        </div>
      </Card>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Manifest / Run Log">
          {run.manifest ? <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">{JSON.stringify(run.manifest, null, 2)}</pre> : <Empty>Kein Manifest oder Run Log gefunden.</Empty>}
        </Panel>
        <Panel title="Review Summary">
          {run.summaryMarkdown ? <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-600">{run.summaryMarkdown}</pre> : <Empty>Keine review-summary.md gefunden.</Empty>}
        </Panel>
      </section>

      <Card className="mt-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">Testfälle</h2>
          <Badge tone="violet">{run.testcases.length}</Badge>
        </div>
        {run.testcases.length ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {run.testcases.map((testcase, index) => (
              <article key={`${testcase.id ?? "tc"}-${index}`} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="violet">{testcase.id ?? `TC-${index + 1}`}</Badge>
                  <Badge tone="sky">{testcase.category ?? "Kategorie offen"}</Badge>
                  <Badge tone={testcase.priority?.toLowerCase().includes("high") ? "rose" : "slate"}>{testcase.priority ?? "Priorität offen"}</Badge>
                  <Badge tone="amber">Risiko {testcase.risk ?? "offen"}</Badge>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-950">{testcase.title ?? "Unbenannter Testfall"}</h3>
                <p className="mt-2 text-sm text-slate-500">{testcase.stepsCount} Steps</p>
                {testcase.sourceRequirement ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">Quelle: {testcase.sourceRequirement}</p> : null}
              </article>
            ))}
          </div>
        ) : <Empty>Keine testcases.json oder keine Testfälle darin gefunden.</Empty>}
      </Card>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Open Questions">
          {run.openQuestions.length ? <ul className="grid gap-2 text-sm text-slate-600">{run.openQuestions.map((question) => <li key={question} className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800">• {question}</li>)}</ul> : <Empty>Keine offenen Fragen im Run-Datensatz.</Empty>}
        </Panel>
        <Panel title="Export / Artifacts">
          {run.artifacts.length ? (
            <div className="grid gap-2">
              {run.artifacts.map((artifact) => (
                <div key={artifact.relativePath} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge tone="sky">{artifact.kind}</Badge>
                    <span className="text-xs font-semibold text-slate-400">{(artifact.bytes / 1024).toFixed(1)} KB</span>
                  </div>
                  <p className="mt-2 break-all text-xs text-slate-500">{artifact.relativePath}</p>
                </div>
              ))}
            </div>
          ) : <Empty>Keine Artefakte im Run-Verzeichnis gefunden.</Empty>}
        </Panel>
      </section>
    </TestForgeShell>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: "violet" | "emerald" | "amber" | "sky" }) {
  const map = {
    violet: "text-violet-700 bg-violet-50",
    emerald: "text-emerald-700 bg-emerald-50",
    amber: "text-amber-700 bg-amber-50",
    sky: "text-sky-700 bg-sky-50",
  } as const;
  return (
    <Card>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-3 rounded-2xl px-3 py-2 text-2xl font-bold tracking-[-0.04em] ${map[tone]}`}>{value}</p>
    </Card>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <h2 className="mb-4 text-xl font-bold tracking-[-0.03em]">{title}</h2>
      {children}
    </Card>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">{children}</p>;
}
