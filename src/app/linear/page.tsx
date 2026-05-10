import Link from "next/link";
import { PageHeader, Shell } from "@/components/mission-components";
import { getMissionData } from "@/lib/openclaw-data";
import { formatDateTime } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default function LinearPage() {
  const data = getMissionData();
  const linear = data.linear;
  const activationWorkflows = [
    {
      id: "linear_polling_bridge_v1",
      label: "Polling Bridge",
      description: "Erzeugt Follow-up-Issues aus Linear-Signalen; write-fähig und deshalb bis expliziter Freigabe inaktiv halten.",
      activateCommand: ".\\automations\\activate_linear_polling_bridge.ps1 -Approved",
      rollbackCommand: ".\\automations\\deactivate_linear_polling_bridge.ps1",
    },
    {
      id: "linear_snapshot_refresh_v1",
      label: "Snapshot Refresh",
      description: "Aktualisiert Mission-Control-Snapshot read-only alle 10 Minuten; als lokale Schedule-HTTP-Automation freigegeben.",
      activateCommand: ".\\automations\\activate_linear_snapshot_refresh.ps1",
      rollbackCommand: ".\\automations\\deactivate_linear_snapshot_refresh.ps1",
    },
  ].map((guard) => ({
    ...guard,
    workflow: data.n8nWorkflows.find((workflow) => workflow.id === guard.id),
  }));
  const activeN8nWorkflows = data.n8nWorkflows.filter((workflow) => workflow.active).length;
  const approvedActiveWorkflows = activationWorkflows.filter((guard) => guard.id === "linear_snapshot_refresh_v1" && guard.workflow?.active).length;
  const approvalRequiredActiveWorkflows = activationWorkflows.filter((guard) => guard.id === "linear_polling_bridge_v1" && guard.workflow?.active).length;

  return (
    <Shell data={data}>
      <PageHeader
        eyebrow="Linear"
        title="OpenClaw HQ Operations"
        description="Read-only Linear-Cockpit für Aurus: aktive Aufgaben, Blocker, Done diese Woche und 5-Task-Limit. Linear bleibt Execution Layer; Mission Control zeigt nur den Zustand."
      />
      <div className="space-y-7 p-6 md:p-9">
        {!linear ? (
          <section className="rounded-[4px] border border-dashed border-[#222936] bg-[#111722] p-6 text-sm text-slate-500">
            Kein Linear-Snapshot gefunden. Erzeuge ihn mit <code className="text-slate-300">node automations/linear_snapshot_export.mjs</code>.
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <Metric label="Issues" value={linear.metrics.totalIssues} />
              <Metric label="Aktiv" value={`${linear.metrics.activeCount}/${linear.metrics.activeLimit}`} tone={linear.metrics.activeLimitOk ? "good" : "warn"} />
              <Metric label="Blockiert" value={linear.metrics.blockedCount} tone={linear.metrics.blockedCount ? "warn" : "good"} />
              <Metric label="Done Woche" value={linear.metrics.doneThisWeek} />
              <Metric label="Ready" value={linear.metrics.byState.Ready ?? 0} />
              <Metric label="n8n aktiv" value={`${activeN8nWorkflows}/${data.n8nWorkflows.length}`} tone={activeN8nWorkflows ? "good" : "info"} />
            </section>

            <section className="rounded-[4px] border border-[#222936] bg-[#111722] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-300">Snapshot</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-50">{linear.organization?.name ?? "Linear"}</h3>
                  <p className="mt-1 text-xs text-slate-600">Aktualisiert: {formatDateTime(linear.generatedAt)}</p>
                </div>
                <span className={`rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${linear.metrics.activeLimitOk ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/10 text-red-200"}`}>
                  Max 5 aktive Tasks: {linear.metrics.activeLimitOk ? "OK" : "Zu viel"}
                </span>
              </div>
              <div className="mt-5 grid gap-2 md:grid-cols-5">
                {Object.entries(linear.metrics.byState).map(([state, count]) => (
                  <div key={state} className="rounded-[4px] border border-[#222936] bg-[#090e17] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">{state}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-50">{count}</p>
                  </div>
                ))}
              </div>
            </section>

            <IssueSection title="Aktive / Ready / Review" empty="Keine aktiven Linear-Issues." issues={linear.focus.active} />
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">n8n Linear-Automationen</h3>
                <span className="rounded-[3px] bg-pink-500/10 px-2 py-1 text-[10px] font-semibold text-pink-200">{data.n8nWorkflows.length}</span>
              </div>
              {data.n8nWorkflows.length ? (
                <div className="grid gap-3 xl:grid-cols-2">
                  {data.n8nWorkflows.map((workflow) => (
                    <div key={`${workflow.id}-${workflow.name}`} className="rounded-[4px] border border-[#222936] bg-[#111722] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-300">{workflow.id}</p>
                          <h4 className="mt-2 text-sm font-semibold text-slate-100">{workflow.name}</h4>
                        </div>
                        <span className={`rounded-[3px] border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${workflow.active ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-slate-600 bg-slate-500/10 text-slate-400"}`}>
                          {workflow.active ? "aktiv" : "inaktiv"}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-600">Nodes: {workflow.nodeTypes.map((type) => type.replace("n8n-nodes-base.", "")).join(", ") || "unbekannt"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-[4px] border border-dashed border-[#222936] bg-[#111722] p-5 text-sm text-slate-500">Keine n8n Linear-Workflows im Export gefunden.</p>
              )}
            </section>

            <section className="rounded-[4px] border border-[#222936] bg-[#111722] p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-300">Automation Guard</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-50">Read-only aktiv, Write-Automation gesperrt</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Nur der read-only Snapshot Refresh darf dauerhaft laufen. Die write-fähige Polling Bridge bleibt bis expliziter Freigabe inaktiv und ist über Boundary-Checks abgesichert.</p>
                </div>
                <span className={`rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${approvalRequiredActiveWorkflows ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}`}>
                  {approvalRequiredActiveWorkflows ? "Write-Workflow aktiv — prüfen" : `${approvedActiveWorkflows}/1 read-only Workflow aktiv`}
                </span>
              </div>
              {data.linearOpsGuard ? (
                <div className={`mt-4 rounded-[4px] border p-4 ${data.linearOpsGuard.status === "OK" ? "border-emerald-400/25 bg-emerald-500/10" : "border-red-400/25 bg-red-500/10"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Ops Guard: {data.linearOpsGuard.status}</p>
                    {data.linearOpsGuard.generatedAt ? <p className="text-xs text-slate-600">{formatDateTime(data.linearOpsGuard.generatedAt)}</p> : null}
                  </div>
                  <ul className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-2">
                    {data.linearOpsGuard.checks.map((check) => (
                      <li key={check.name} className="rounded-[3px] border border-[#222936] bg-[#090e17] px-3 py-2">
                        {check.ok ? "✓" : "!"} {check.name} · {check.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <CommandCard label="Boundary erzwingen" command=".\\automations\\enforce_linear_activation_boundary.ps1" description="Recovery: exportiert n8n, deaktiviert Polling Bridge bei Drift und prüft Guard." status="safe default" tone="good" />
                <CommandCard label="Ops Snapshot manuell aktualisieren" command=".\\automations\\refresh_mission_control_ops.ps1" description="Safe: liest Linear/n8n, schreibt lokale Snapshot-Dateien und prüft Boundary." status="jederzeit manuell" />
                {activationWorkflows.map((guard) => (
                  <CommandCard
                    key={guard.id}
                    label={guard.label}
                    command={`${guard.activateCommand}  |  rollback: ${guard.rollbackCommand}`}
                    description={guard.description}
                    status={guard.id === "linear_polling_bridge_v1" ? (guard.workflow?.active ? "aktiv — sofort prüfen/rollback" : "inaktiv — korrekt bis Freigabe") : guard.workflow?.active ? "aktiv — read-only OK" : guard.workflow ? "inaktiv — prüfen" : "nicht im Export gefunden"}
                    tone={guard.id === "linear_polling_bridge_v1" ? (guard.workflow?.active ? "warn" : "good") : guard.workflow?.active ? "good" : "warn"}
                  />
                ))}
              </div>
            </section>
            <IssueSection title="Blocker" empty="Keine Blocker im Snapshot." issues={linear.focus.blocked} />
            <IssueSection title="Done diese Woche" empty="Noch nichts diese Woche abgeschlossen." issues={linear.focus.recentDone.map((issue) => ({ ...issue, state: "Done" }))} />
          </>
        )}
      </div>
    </Shell>
  );
}

function CommandCard({ label, command, description, status, tone = "info" }: { label: string; command: string; description?: string; status?: string; tone?: "good" | "warn" | "info" }) {
  const statusClass = tone === "good" ? "text-emerald-200" : tone === "warn" ? "text-amber-200" : "text-slate-400";
  return (
    <div className="rounded-[4px] border border-[#222936] bg-[#090e17] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        {status ? <span className={`text-[10px] font-semibold uppercase tracking-wide ${statusClass}`}>{status}</span> : null}
      </div>
      {description ? <p className="mt-2 text-xs leading-5 text-slate-600">{description}</p> : null}
      <code className="mt-2 block break-all rounded-[3px] border border-[#222936] bg-black/25 px-3 py-2 text-xs text-slate-300">{command}</code>
    </div>
  );
}

function Metric({ label, value, tone = "info" }: { label: string; value: string | number; tone?: "good" | "warn" | "info" }) {
  const toneClass = tone === "good" ? "text-emerald-200" : tone === "warn" ? "text-red-200" : "text-slate-50";
  return (
    <div className="rounded-[4px] border border-[#222936] bg-[#111722] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function IssueSection({ title, empty, issues }: { title: string; empty: string; issues: { identifier: string; title: string; state: string; project?: string; url?: string }[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">{title}</h3>
        <span className="rounded-[3px] bg-pink-500/10 px-2 py-1 text-[10px] font-semibold text-pink-200">{issues.length}</span>
      </div>
      {issues.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {issues.map((issue) => (
            <Link key={`${issue.identifier}-${issue.title}`} href={issue.url ?? "#"} className="rounded-[4px] border border-[#222936] bg-[#111722] p-4 transition hover:border-pink-400/50 hover:bg-[#151d29]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-300">{issue.identifier} · {issue.state}</p>
              <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-100">{issue.title}</h4>
              {issue.project ? <p className="mt-2 text-xs text-slate-600">{issue.project}</p> : null}
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-[4px] border border-dashed border-[#222936] bg-[#111722] p-5 text-sm text-slate-500">{empty}</p>
      )}
    </section>
  );
}
