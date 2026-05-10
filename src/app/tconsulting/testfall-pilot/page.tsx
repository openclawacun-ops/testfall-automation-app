import { packageTestfallPilot } from "@/app/actions";
import { PageHeader, Shell } from "@/components/mission-components";
import { getMissionData } from "@/lib/openclaw-data";
import { formatDateTime } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default function TestfallPilotPage() {
  const data = getMissionData();
  const pilot = data.testfallPilot;
  const workflow = data.n8nWorkflows.find((item) => item.id === "testfall_pilot_local_intake_v1");

  return (
    <Shell data={data} variant="tconsulting">
      <PageHeader
        eyebrow="Tconsulting · Testfall Pilot"
        title="Text → Testfälle → QC-Import"
        description="Lokaler Prototyp: Spezifikationstexte aus der Inbox werden in review-sichere Testfälle mit Steps, Expected Results, CSV/QC-CSV, XLSX und Linear Review umgewandelt. Kein Upload, kein öffentlicher Tunnel."
      />
      <div className="space-y-7 p-6 md:p-9">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric label="Inbox" value={pilot?.inboxCount ?? 0} />
          <Metric label="Processed" value={pilot?.processedCount ?? 0} />
          <Metric label="Outputs" value={pilot?.outputCount ?? 0} />
          <Metric label="QC-CSV" value={pilot?.qcCsvCount ?? 0} tone={(pilot?.qcCsvCount ?? 0) ? "good" : "info"} />
          <Metric label="Report Cases" value={pilot?.latestReportSummary?.testCases ?? "—"} tone={pilot?.latestReportSummary?.testCases ? "good" : "info"} />
          <Metric label="n8n" value={workflow?.active ? "aktiv" : "inaktiv"} tone={workflow?.active ? "good" : "warn"} />
        </section>

        <section className="rounded-[4px] border border-sky-400/20 bg-[#071523] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300">Local Intake</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-50">Aktiver Prototyp</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Lege Kundentexte als .txt/.md in <code className="text-slate-300">testfall-pilot/inbox</code>. n8n ruft alle 10 Minuten den lokalen Companion Server auf und erzeugt Output-Dateien in <code className="text-slate-300">testfall-pilot/out</code>.</p>
            </div>
            <span className={`rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${workflow?.active ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-amber-400/30 bg-amber-500/10 text-amber-200"}`}>{workflow?.active ? "n8n Workflow aktiv" : "Workflow prüfen"}</span>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            <Command label="Input" value="testfall-pilot\\inbox\\*.txt" />
            <Command label="Run" value="node .\\automations\\testfall_pilot_generator.mjs" />
            <Command label="Endpoint" value="POST http://127.0.0.1:8765/testfall-pilot" />
            <Command label="Report" value={pilot?.latestReportPath ?? "testfall-pilot\\reports\\latest-testfall-pilot-report.md"} />
          </div>
          <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
            {pilot?.latestOutputAt ? <p>Letzter Output: {formatDateTime(pilot.latestOutputAt)}</p> : null}
            {pilot?.latestReportAt ? <p>Letzter Report: {formatDateTime(pilot.latestReportAt)}</p> : null}
          </div>
        </section>

        {pilot?.latestReportSummary ? (
          <section className="rounded-[4px] border border-emerald-400/20 bg-emerald-500/5 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">Pilot Report</p>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <Metric label="Testfälle" value={pilot.latestReportSummary.testCases ?? 0} tone="good" />
              <Metric label="Gruppen" value={pilot.latestReportSummary.groups ?? 0} tone="good" />
              <Metric label="Steps" value={pilot.latestReportSummary.totalSteps ?? 0} tone="good" />
              <Metric label="XLSX" value={pilot.latestReportSummary.qcXlsx ?? 0} tone="good" />
            </div>
            <div className="mt-4 grid gap-1 text-xs text-slate-500">
              {pilot.latestReportPath ? <p className="break-all">Report: {pilot.latestReportPath}</p> : null}
              {pilot.latestPackagePath ? <p className="break-all">Review-Paket: {pilot.latestPackagePath} {pilot.latestPackageBytes ? `(${Math.round(pilot.latestPackageBytes / 1024)} KB)` : ""}</p> : null}
            </div>
          </section>
        ) : null}

        {pilot?.packages.length ? (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Review-Pakete</h3>
              <span className="rounded-[3px] bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-200">{pilot.packages.length}</span>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {pilot.packages.map((pkg) => (
                <article key={pkg.manifestPath} className="rounded-[4px] border border-amber-400/15 bg-[#071523] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">{pkg.mode ?? "package"}</p>
                      <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-100">{pkg.sourceFile ?? pkg.name}</h4>
                    </div>
                    <span className="rounded-[3px] border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">{Math.round(pkg.bytes / 1024)} KB</span>
                  </div>
                  <div className="mt-3 grid gap-1 text-xs text-slate-500">
                    <p>{pkg.testCases} Testfälle · {pkg.files} Dateien</p>
                    <p>Aktualisiert: {formatDateTime(pkg.updatedAt)}</p>
                    <p className="break-all text-slate-600">ZIP: {pkg.packagePath}</p>
                    <p className="break-all text-slate-600">Manifest: {pkg.manifestPath}</p>
                    <code className="mt-2 block break-all rounded-[3px] bg-[#04101d] p-2 text-[11px] text-slate-300">{pkg.verifyCommand}</code>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {pilot?.sourceGroups.length ? (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Paketierbare Quellen</h3>
              <span className="rounded-[3px] bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-200">{pilot.sourceGroups.length}</span>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              <article className="rounded-[4px] border border-emerald-400/15 bg-[#071523] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Alle neuesten Quellen</p>
                <h4 className="mt-2 text-sm font-semibold text-slate-100">All-Latest Review Package</h4>
                <p className="mt-3 text-xs leading-5 text-slate-500">Baut ein verifiziertes Sammelpaket aus den neuesten Report-Fällen. Lokal, ohne Upload oder Versand.</p>
                <form action={packageTestfallPilot} className="mt-4">
                  <input type="hidden" name="allLatest" value="true" />
                  <button className="rounded-[3px] border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-100 hover:bg-emerald-500/20">All-Latest bauen + prüfen</button>
                </form>
                <code className="mt-3 block break-all rounded-[3px] bg-[#04101d] p-2 text-[11px] text-slate-300">.\automations\package_testfall_pilot.ps1 -AllLatest -Verify</code>
              </article>
              {pilot.sourceGroups.map((group) => (
                <article key={group.sourceFile} className="rounded-[4px] border border-emerald-400/15 bg-[#071523] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">{group.customer ?? "Source"}</p>
                  <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-100">{group.title ?? group.sourceFile}</h4>
                  <div className="mt-3 grid gap-1 text-xs text-slate-500">
                    <p>{group.testCases} Testfall/Testfälle · {group.steps} Steps</p>
                    <p className="break-all text-slate-600">{group.sourceFile}</p>
                    <code className="mt-2 block break-all rounded-[3px] bg-[#04101d] p-2 text-[11px] text-slate-300">{group.packageCommand}</code>
                    <form action={packageTestfallPilot} className="mt-3">
                      <input type="hidden" name="sourceFile" value={group.sourceFile} />
                      <button className="rounded-[3px] border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-100 hover:bg-emerald-500/20">Quelle bauen + prüfen</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Neueste Outputs</h3>
            <span className="rounded-[3px] bg-sky-500/10 px-2 py-1 text-[10px] font-semibold text-sky-200">{pilot?.outputs.length ?? 0}</span>
          </div>
          {pilot?.outputs.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {pilot.outputs.map((output) => (
                <article key={output.relativePath} className="rounded-[4px] border border-sky-400/15 bg-[#071523] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">{output.kind}</p>
                      <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-100">{output.title}</h4>
                    </div>
                    <span className="rounded-[3px] border border-sky-400/25 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-200">{Math.round(output.size / 1024)} KB</span>
                  </div>
                  <div className="mt-3 grid gap-1 text-xs text-slate-500">
                    {output.customer ? <p>Customer: {output.customer}</p> : null}
                    {output.testCaseId ? <p>ID: {output.testCaseId}</p> : null}
                    {output.steps ? <p>Steps: {output.steps}</p> : null}
                    <p>{formatDateTime(output.updatedAt)}</p>
                    <p className="break-all text-slate-600">{output.relativePath}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-[4px] border border-dashed border-sky-400/20 bg-[#071523] p-5 text-sm text-slate-500">Noch keine Testfall-Pilot-Outputs gefunden.</p>
          )}
        </section>

        <section className="rounded-[4px] border border-sky-400/20 bg-[#071523] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300">QA Safety</p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-500 md:grid-cols-2">
            <li>✓ Kein öffentlicher Tunnel / kein Upload</li>
            <li>✓ Annahmen und fehlende Testdaten werden markiert</li>
            <li>✓ Tconsulting-QC-kompatible CSV-Spalten</li>
            <li>✓ XLSX-Konvertierung über lokale Excel-COM, wenn verfügbar</li>
          </ul>
        </section>
      </div>
    </Shell>
  );
}

function Metric({ label, value, tone = "info" }: { label: string; value: string | number; tone?: "good" | "warn" | "info" }) {
  const toneClass = tone === "good" ? "text-emerald-200" : tone === "warn" ? "text-amber-200" : "text-slate-50";
  return (
    <div className="rounded-[4px] border border-sky-400/15 bg-[#071523] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function Command({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[4px] border border-sky-400/15 bg-[#04101d] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <code className="mt-2 block break-all text-xs text-slate-300">{value}</code>
    </div>
  );
}
