import fs from "node:fs";
import path from "node:path";
import { PageHeader, Shell } from "@/components/mission-components";
import { getMissionData } from "@/lib/openclaw-data";
import { formatDateTime } from "@/lib/ui";

export const dynamic = "force-dynamic";

const workspace = process.env.OPENCLAW_WORKSPACE ?? path.join(process.env.USERPROFILE ?? process.env.HOME ?? "C:\\Users\\openc", ".openclaw", "workspace");
const reportsRoot = path.join(workspace, "qa-automation-bundle", "reports");
const packagesRoot = path.join(workspace, "qa-automation-bundle", "packages");

type BundleReport = {
  dir: string;
  updatedAt: string;
  input?: string;
  score?: number;
  status?: string;
  testcases?: number;
  steps?: number;
  errors?: number;
  warnings?: number;
  openQuestions?: number;
  savedMinutes?: number;
  zip?: string;
  summary?: string;
};

function readJson(filePath: string) { try { return JSON.parse(fs.readFileSync(filePath, "utf8")); } catch { return null; } }
function readText(filePath: string) { try { return fs.readFileSync(filePath, "utf8"); } catch { return ""; } }

function getPackages() {
  if (!fs.existsSync(packagesRoot)) return [];
  return fs.readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".zip"))
    .map((entry) => {
      const full = path.join(packagesRoot, entry.name);
      const stat = fs.statSync(full);
      return { name: entry.name, path: path.relative(workspace, full), bytes: stat.size, updatedAt: stat.mtime.toISOString() };
    })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 8);
}

function getReports(): BundleReport[] {
  if (!fs.existsSync(reportsRoot)) return [];
  return fs.readdirSync(reportsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const full = path.join(reportsRoot, entry.name);
      const json = readJson(path.join(full, "qa-bundle-report.json"));
      const stat = fs.statSync(full);
      return {
        dir: path.relative(workspace, full),
        updatedAt: stat.mtime.toISOString(),
        input: json?.input,
        score: json?.quality?.score,
        status: json?.quality?.status,
        testcases: json?.kpi?.testcase_count,
        steps: json?.kpi?.step_count,
        errors: json?.guard?.errors,
        warnings: json?.guard?.warnings,
        openQuestions: json?.questions?.count,
        savedMinutes: json?.kpi?.estimated_saved_minutes,
        zip: fs.existsSync(path.join(full, "qa-automation-bundle-demo-package.zip")) ? path.relative(workspace, path.join(full, "qa-automation-bundle-demo-package.zip")) : undefined,
        summary: readText(path.join(full, "customer-safe-summary.md")).slice(0, 900),
      };
    })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 12);
}

export default function QaBundlePage() {
  const data = getMissionData();
  const reports = getReports();
  const packages = getPackages();
  const latest = reports[0];

  return (
    <Shell data={data}>
      <PageHeader
        eyebrow="QA Automation Bundle"
        title="Testfall-Pilot Add-ons offer-ready machen"
        description="Lokale Angebots-Toolbox für Tconsulting: Import Guard, Coverage Matrix, Open Questions, Bug-Drafts, Regression Pack, Testdatenvorschläge und KPI/ROI-Report — mit Quality Score und Demo-ZIP."
      />
      <div className="space-y-7 p-6 md:p-9">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric label="Reports" value={reports.length} />
          <Metric label="Offer ZIPs" value={packages.length} tone={packages.length ? "good" : "info"} />
          <Metric label="Latest Score" value={latest?.score ?? "—"} tone={(latest?.score ?? 0) >= 85 ? "good" : "warn"} />
          <Metric label="Status" value={latest?.status ?? "—"} tone={latest?.status === "pilot_demo_ready" ? "good" : "warn"} />
          <Metric label="Cases / Steps" value={latest ? `${latest.testcases}/${latest.steps}` : "—"} />
          <Metric label="Saved min" value={latest?.savedMinutes ?? "—"} tone="good" />
        </section>

        <section className="rounded-[4px] border border-emerald-400/20 bg-emerald-500/5 p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">Offer Stack</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["QC/ALM Import Guard", "Pflichtfelder, Step-Struktur, Vague Expected Results"],
              ["Coverage Matrix", "Requirement/Quelle → Testfall → Steps"],
              ["Open Questions", "Testdaten, Umgebung, QC/ALM, Datenschutz"],
              ["Bug Drafts", "Step-Failure → Bugticket-Entwurf"],
              ["Regression Pack", "Risk-/Keyword-basierte Kandidaten"],
              ["Testdaten", "Positive/negative Datenkategorien"],
              ["KPI/ROI", "Zeitersparnis-Schätzung für Pilot"],
              ["Demo ZIP", "Customer-safe Paket mit Verifier"],
            ].map(([title, detail]) => (
              <article key={title} className="rounded-[4px] border border-emerald-400/15 bg-[#07120d] p-4">
                <p className="text-sm font-semibold text-slate-100">{title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        {latest ? (
          <section className="rounded-[4px] border border-sky-400/20 bg-[#071523] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300">Latest verified package</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-50">{latest.status} · {latest.score}/100</h3>
              </div>
              <span className="rounded-[4px] border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-sky-200">{formatDateTime(latest.updatedAt)}</span>
            </div>
            <div className="mt-4 grid gap-2 text-xs text-slate-500">
              <p className="break-all">Input: {latest.input}</p>
              <p className="break-all">Report: {latest.dir}</p>
              {latest.zip ? <p className="break-all">Demo ZIP: {latest.zip}</p> : null}
            </div>
            {latest.summary ? <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-[4px] border border-sky-400/15 bg-[#04101d] p-4 text-xs leading-5 text-slate-300">{latest.summary}</pre> : null}
          </section>
        ) : null}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Offer Packages</h3>
            <span className="rounded-[3px] bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-200">{packages.length}</span>
          </div>
          {packages.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {packages.map((pkg) => (
                <article key={pkg.path} className="rounded-[4px] border border-emerald-400/15 bg-[#111722] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Demo ZIP</p>
                  <h4 className="mt-2 break-all text-sm font-semibold text-slate-100">{pkg.name}</h4>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(pkg.updatedAt)} · {(pkg.bytes / 1024).toFixed(1)} KB</p>
                  <p className="mt-2 break-all text-xs text-slate-600">{pkg.path}</p>
                </article>
              ))}
            </div>
          ) : <p className="rounded-[4px] border border-dashed border-emerald-400/20 bg-[#111722] p-5 text-sm text-slate-500">Noch keine Offer Packages.</p>}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Report History</h3>
            <span className="rounded-[3px] bg-sky-500/10 px-2 py-1 text-[10px] font-semibold text-sky-200">{reports.length}</span>
          </div>
          {reports.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {reports.map((report) => (
                <article key={report.dir} className="rounded-[4px] border border-sky-400/15 bg-[#111722] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">{report.status ?? "unknown"}</p>
                      <h4 className="mt-2 text-sm font-semibold text-slate-100">Score {report.score ?? "—"} · {report.testcases ?? "—"} TF · {report.steps ?? "—"} Steps</h4>
                    </div>
                    <span className="rounded-[3px] border border-sky-400/25 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-200">{report.errors ?? 0} E / {report.warnings ?? 0} W</span>
                  </div>
                  <div className="mt-3 grid gap-1 text-xs text-slate-500">
                    <p>Open Questions: {report.openQuestions ?? "—"} · Saved: {report.savedMinutes ?? "—"} min</p>
                    <p>{formatDateTime(report.updatedAt)}</p>
                    <p className="break-all text-slate-600">{report.dir}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="rounded-[4px] border border-dashed border-sky-400/20 bg-[#111722] p-5 text-sm text-slate-500">Noch keine QA-Bundle-Reports.</p>}
        </section>
      </div>
    </Shell>
  );
}

function Metric({ label, value, tone = "info" }: { label: string; value: string | number; tone?: "good" | "warn" | "info" }) {
  const toneClass = tone === "good" ? "text-emerald-200" : tone === "warn" ? "text-amber-200" : "text-slate-50";
  return (
    <div className="rounded-[4px] border border-sky-400/15 bg-[#111722] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={`mt-3 break-words text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
