import fs from "node:fs";
import path from "node:path";
import { runTaurusTestfallPilot } from "@/app/actions";
import { PageHeader, Shell } from "@/components/mission-components";
import { getMissionData } from "@/lib/openclaw-data";
import { formatDateTime } from "@/lib/ui";

export const dynamic = "force-dynamic";

type TaurusRun = {
  runId: string;
  project: string;
  source: string;
  createdAt: string;
  testcases: number;
  steps: number;
  risk: string;
  template: boolean;
  training: boolean;
  path: string;
  markdown?: string;
  json?: string;
  xlsx?: string;
  zip?: string;
};

const workspace = process.env.OPENCLAW_WORKSPACE ?? path.join(process.env.USERPROFILE ?? process.env.HOME ?? "C:\\Users\\openc", ".openclaw", "workspace");
const runsRoot = path.join(workspace, "testfall-pilot", "runs");
const trainingPath = path.join(workspace, "taurus", "TESTFALL_TRAINING.md");

function readJson(filePath: string) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); } catch { return null; }
}

function getTaurusRuns(): TaurusRun[] {
  if (!fs.existsSync(runsRoot)) return [];
  return fs.readdirSync(runsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.includes("taurus-"))
    .map((entry) => {
      const full = path.join(runsRoot, entry.name);
      const json = readJson(path.join(full, "testcases.json"));
      const stat = fs.statSync(full);
      return {
        runId: json?.run_id ?? entry.name,
        project: json?.project ?? "Taurus Testfall Automation Pilot",
        source: json?.source ?? "—",
        createdAt: json?.created_at ?? stat.mtime.toISOString(),
        testcases: json?.summary?.testcase_count ?? 0,
        steps: json?.summary?.step_count ?? 0,
        risk: json?.summary?.risk_level ?? "—",
        template: Boolean(json?.template?.provided),
        training: Boolean(json?.taurus_training_applied),
        path: path.relative(workspace, full),
        markdown: json?.files?.markdown,
        json: json?.files?.json,
        xlsx: json?.files?.xlsx,
        zip: json?.files?.zip,
      };
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 8);
}

function getTrainingExcerpt() {
  try { return fs.readFileSync(trainingPath, "utf8").split(/\r?\n/).slice(0, 24).join("\n"); } catch { return "Taurus training profile missing."; }
}

export default function TaurusPage() {
  const data = getMissionData();
  const runs = getTaurusRuns();
  const latest = runs[0];

  return (
    <Shell data={data}>
      <PageHeader
        eyebrow="Taurus · Testfall Automation Pilot"
        title="Quelle + Vorlage → hochwertige Testfälle"
        description="Eigenes Taurus-Fenster für Acuns Qualitäts-Pilot: Quelldatei und Vorlage hochladen, lokal generieren, maximale konkrete Testfallabdeckung mit detaillierten Steps erzeugen. Keine Sales-Marge, keine externe Übergabe, kein Linear-Write."
      />
      <div className="space-y-7 p-6 md:p-9">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Taurus Runs" value={runs.length} />
          <Metric label="Latest Cases" value={latest?.testcases ?? "—"} tone={latest ? "good" : "info"} />
          <Metric label="Latest Steps" value={latest?.steps ?? "—"} tone={latest ? "good" : "info"} />
          <Metric label="Training" value={fs.existsSync(trainingPath) ? "aktiv" : "fehlt"} tone={fs.existsSync(trainingPath) ? "good" : "warn"} />
        </section>

        <section className="rounded-[4px] border border-pink-400/20 bg-[#111722] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-300">Generator</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-50">Neuen Taurus-Testfalllauf starten</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Lade eine Spezifikation/Anforderung als Quelle hoch und optional eine Vorlage, deren Feldstruktur Taurus berücksichtigen soll. Die Quelle bestimmt die fachlichen Fakten; die Vorlage bestimmt nur Struktur/Felder.</p>
            </div>
            <span className="rounded-[4px] border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">local only · review-ready</span>
          </div>

          <form action={runTaurusTestfallPilot} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Projekt / Run-Name
              <input name="projectName" defaultValue="Taurus Testfall Automation Pilot" className="rounded-[4px] border border-[#293244] bg-[#070b12] px-3 py-3 text-sm normal-case tracking-normal text-slate-100 outline-none focus:border-pink-400/70" />
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                1 · Quelldatei mit Anforderungen
                <input name="sourceFile" type="file" required accept=".txt,.md,.json,.csv" className="rounded-[4px] border border-dashed border-pink-400/25 bg-[#070b12] px-3 py-4 text-sm normal-case tracking-normal text-slate-300" />
              </label>
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                2 · Vorlage / Importstruktur optional
                <input name="templateFile" type="file" accept=".txt,.md,.json,.csv" className="rounded-[4px] border border-dashed border-sky-400/25 bg-[#070b12] px-3 py-4 text-sm normal-case tracking-normal text-slate-300" />
              </label>
            </div>
            <button className="w-fit rounded-[4px] border border-pink-400/35 bg-pink-500/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-pink-100 transition hover:bg-pink-500/25">Testfälle generieren</button>
          </form>
        </section>

        <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
          <article className="rounded-[4px] border border-emerald-400/20 bg-emerald-500/5 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">Taurus Training</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-50">Qualitätsprofil aktiv</h3>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-[4px] border border-emerald-400/15 bg-[#07120d] p-4 text-xs leading-5 text-slate-300">{getTrainingExcerpt()}</pre>
          </article>
          <article className="rounded-[4px] border border-sky-400/20 bg-[#071523] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300">Qualitätsregeln</p>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-400">
              <li>✓ Keine allgemeinen Füller; jeder Step braucht Aktion, Eingabe, beobachtbares Ergebnis und möglichen Fehler.</li>
              <li>✓ Quelle liefert Fachfakten; Vorlage liefert Struktur/Felder.</li>
              <li>✓ Fehlende Testdaten, Rollen, Umgebung und QC/ALM-Mappings werden als offene Fragen markiert.</li>
              <li>✓ Output ist review-ready, nie automatisch QA-approved.</li>
              <li>✓ Linear-Issues sind hier deaktiviert, damit Qualität zuerst lokal geprüft wird.</li>
            </ul>
          </article>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Neueste Taurus-Läufe</h3>
            <span className="rounded-[3px] bg-pink-500/10 px-2 py-1 text-[10px] font-semibold text-pink-200">{runs.length}</span>
          </div>
          {runs.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {runs.map((run) => (
                <article key={run.runId} className="rounded-[4px] border border-pink-400/15 bg-[#111722] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-300">{run.risk} risk · {run.template ? "template" : "no template"} · {run.training ? "trained" : "untrained"}</p>
                      <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-100">{run.project}</h4>
                    </div>
                    <span className="rounded-[3px] border border-pink-400/25 bg-pink-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-pink-200">{run.testcases} TF / {run.steps} Steps</span>
                  </div>
                  <div className="mt-3 grid gap-1 text-xs text-slate-500">
                    <p>Quelle: {run.source}</p>
                    <p>Erstellt: {formatDateTime(run.createdAt)}</p>
                    <p className="break-all text-slate-600">Run: {run.path}</p>
                    {run.markdown ? <p className="break-all text-slate-600">Markdown: {run.markdown}</p> : null}
                    {run.xlsx ? <p className="break-all text-slate-600">XLSX: {run.xlsx}</p> : null}
                    {run.zip ? <p className="break-all text-slate-600">ZIP: {run.zip}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-[4px] border border-dashed border-pink-400/20 bg-[#111722] p-5 text-sm text-slate-500">Noch kein Taurus-Lauf. Lade Quelle + Vorlage hoch und starte den Generator.</p>
          )}
        </section>
      </div>
    </Shell>
  );
}

function Metric({ label, value, tone = "info" }: { label: string; value: string | number; tone?: "good" | "warn" | "info" }) {
  const toneClass = tone === "good" ? "text-emerald-200" : tone === "warn" ? "text-amber-200" : "text-slate-50";
  return (
    <div className="rounded-[4px] border border-pink-400/15 bg-[#111722] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
