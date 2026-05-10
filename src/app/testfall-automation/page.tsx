import Link from "next/link";
import { Badge, Card, PrimaryAction, TestForgeHeader, TestForgeShell } from "@/components/testforge-shell";
import { getTestfallAutomationCockpit, type TestfallRunSummary } from "@/lib/testfall-automation";
import { formatDateTime } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default function TestfallAutomationPage() {
  const cockpit = getTestfallAutomationCockpit();
  const ready = cockpit.runs.filter((run) => run.guardStatus === "ready_for_review").length;
  const needsReview = cockpit.runs.filter((run) => run.guardStatus !== "ready_for_review").length;
  const openQuestions = cockpit.runs.reduce((sum, run) => sum + run.openQuestionsCount, 0);

  return (
    <TestForgeShell active="dashboard">
      <TestForgeHeader
        title="Dashboard"
        subtitle="Überblick über deine Testfälle"
        action={<PrimaryAction href="/testfall-automation/generator">Generieren</PrimaryAction>}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gesamt" value={cockpit.totals.testcases || cockpit.totals.runs} detail={`${cockpit.totals.runs} Runs · ${cockpit.totals.steps} Steps`} tone="violet" />
        <StatCard label="Bestanden" value={ready} detail="Review Ready" tone="emerald" />
        <StatCard label="Fehlgeschlagen" value={needsReview} detail="Needs Review" tone="rose" />
        <StatCard label="Entwürfe" value={openQuestions} detail="Offene Fragen" tone="amber" />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-950">Letzte Testfälle</h2>
              <p className="mt-1 text-sm text-slate-500">Lokale Runs aus {cockpit.runsRoot}</p>
            </div>
            <Badge tone="violet">{cockpit.runs.length} Einträge</Badge>
          </div>

          {cockpit.runs.length ? (
            <div className="grid gap-3">
              {cockpit.runs.map((run) => <RunRow key={run.runId} run={run} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">Noch keine lokalen Runs gefunden. Der Generator bleibt im MVP UI-only vorbereitet.</div>
          )}
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">MVP Flow</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Vom Rohtext zum Review-Paket</h2>
          <div className="mt-6 grid gap-3 text-sm leading-6 text-white/82">
            <p>1. Anforderungen lokal einfügen oder Datei vorbereiten.</p>
            <p>2. Quality Gates prüfen Annahmen, offene Fragen und Abdeckung.</p>
            <p>3. Artefakte für Markdown, CSV, QC/ALM oder XLSX bereitstellen.</p>
          </div>
          <Link href="/testfall-automation/library" className="mt-7 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm">Bibliothek öffnen</Link>
        </Card>
      </section>
    </TestForgeShell>
  );
}

function StatCard({ label, value, detail, tone }: { label: string; value: string | number; detail: string; tone: "violet" | "emerald" | "rose" | "amber" }) {
  const colors = {
    violet: "bg-violet-600 shadow-violet-100",
    emerald: "bg-emerald-500 shadow-emerald-100",
    rose: "bg-rose-500 shadow-rose-100",
    amber: "bg-amber-500 shadow-amber-100",
  } as const;
  return (
    <Card className="flex items-center gap-4">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg ${colors[tone]}`}>●</span>
      <span>
        <span className="block text-sm font-semibold text-slate-500">{label}</span>
        <span className="mt-1 block text-3xl font-bold tracking-[-0.04em] text-slate-950">{value}</span>
        <span className="mt-1 block text-xs font-medium text-slate-400">{detail}</span>
      </span>
    </Card>
  );
}

function RunRow({ run }: { run: TestfallRunSummary }) {
  return (
    <Link href={`/testfall-automation/runs/${run.runId}`} className="grid gap-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-violet-200 hover:bg-violet-50/45 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={run.guardStatus === "ready_for_review" ? "emerald" : "amber"}>{run.guardStatus.replaceAll("_", " ")}</Badge>
          <Badge tone="sky">{run.riskLevel ?? "Risiko offen"}</Badge>
          <Badge tone="violet">{run.project ? "Projekt" : "Run"}</Badge>
        </div>
        <h3 className="mt-3 line-clamp-1 text-base font-bold text-slate-950">{run.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{run.testcaseCount} Testfälle · {run.stepCount} Steps · {run.openQuestionsCount} offene Fragen</p>
      </div>
      <div className="text-left text-sm text-slate-400 md:text-right">
        <p>{formatDateTime(run.updatedAt)}</p>
        <p className="mt-1 font-semibold text-violet-600">Details öffnen →</p>
      </div>
    </Link>
  );
}
