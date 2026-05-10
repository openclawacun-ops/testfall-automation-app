import { getMissionData } from "@/lib/openclaw-data";
import { agentLiveTasks, getTconsultingProjects, getTconsultingTasks, tconsultingAgents, tconsultingAutomations, tconsultingResearchItems, tconsultingTaskHref, tconsultingWeeklyPlan } from "@/lib/tconsulting-data";
import { Shell } from "@/components/mission-components";
import { TActionButton, THeader, TPanel, TPage, TProjectCard, TStatCard, TStatusPill, TTaskCard } from "@/components/tconsulting-components";

export const dynamic = "force-dynamic";

const controlHubs = [
  ["Sub-Agent Dispatch", "Tconsulting-Agentenaufgaben für Maurus, Cornus, Romus und Aurus steuern.", "/tconsulting/agents", "Agenten öffnen"],
  ["QA Automation Pipeline", "Testfall-Generierung, Bug-Analyse, Regression und QA Reporting steuern.", "/tconsulting/automation", "Automation Hub"],
  ["Pilot Offer", "Fertige Testfall-Demo in ein 1–2 Wochen Pilotangebot für Tconsulting übersetzen.", "/tconsulting/pilot", "Pilot öffnen"],
  ["ROI & Preislogik", "Zeitersparnis, Preisanker, Messpunkte und Business Case für den QA-Pilot.", "/tconsulting/roi", "ROI öffnen"],
  ["Research & Growth Hub", "QA-Trends, Tools, Branchenchancen und Lead-Ideen sammeln.", "/tconsulting/research", "Research öffnen"],
];

export default function TconsultingDashboard() {
  const data = getMissionData();
  const tTasks = getTconsultingTasks(data);
  const tProjects = getTconsultingProjects(data);
  const firstTask = tTasks[0];

  return (
    <Shell data={data} variant="tconsulting">
      <TPage>
        <THeader
          eyebrow="Tconsulting Mission Control"
          title="QA Automation Command Center"
          description="Eigenes Kunden-Cockpit nur für Tconsulting: IT-Beratung, Software Testing, QA Automation, KI-Agenten, Projekte, Wachstum und Automatisierung. Keine allgemeinen OpenClaw-Aufgaben in dieser Ansicht."
          action={<div className="flex gap-3"><TActionButton href="/tconsulting/tasks" primary>Tconsulting Tasks</TActionButton><TActionButton href="/tconsulting/control-hubs">Control Hubs</TActionButton></div>}
        />

        <div className="space-y-7 p-6 md:p-9">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TStatCard label="Tconsulting Tasks" value={tTasks.length} detail="Nur Aufgaben mit Kundenbezug: Tconsulting, QA, Testing, Automation." />
            <TStatCard label="Tconsulting Projekte" value={tProjects.length} detail="Nur Projektdateien mit QA-/Tconsulting-Bezug." />
            <TStatCard label="REG446/447 v2" value="13 / 68" detail="13 review-sichere Testfälle / 68 Steps, QC-CSV/XLSX, Prüfkriterien und Handoff-ZIP." />
            <TStatCard label="Pilot Status" value="v0.9 ready" detail="Internes Versandpaket vorbereitet; Versand bleibt Acun-Freigabe." />
          </section>

          <TPanel id="pilot-brief" eyebrow="Pilot v0.9 · Ready but not sent" title="Tconsulting QA/Testfall Pilot — aktueller Übergabestand">
            <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
              <article className="rounded-[6px] border border-emerald-400/20 bg-emerald-400/10 p-5">
                <div className="flex flex-wrap items-center gap-3"><TStatusPill value="review-safe" /><span className="text-xs text-emerald-100">Keine externe Übergabe erfolgt</span></div>
                <p className="mt-4 text-sm leading-6 text-slate-200">REG446/REG447 Expanded v2 ist geprüft: 13 Testfälle / 68 Steps, CSV/JSON/XLSX/ZIP konsistent. Es bleibt ein Review-Entwurf ohne finale QA-Freigabe und ohne garantierten QC/ALM-Import.</p>
                <div className="mt-5 grid gap-2 text-xs text-slate-400">
                  <p className="break-all">Paket: taurus/reg446-reg447-2026-05-04/REG446_REG447_Tconsulting_QC_Aurus_expanded_v2_package.zip</p>
                  <p className="break-all">Internes Paket: tconsulting-versandpaket-v0.9-2026-05-05.zip</p>
                  <p className="break-all">Customer-safe Paket: tconsulting-customer-safe-demo-package-2026-05-05.zip</p>
                  <p className="break-all">Boundary: docs/tconsulting-package-boundary-2026-05-05.md</p>
                  <p className="break-all">Verifier: node taurus\reg446-reg447-2026-05-04\verify_reg446_447_expanded_v2.js</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-3"><TActionButton href="/tconsulting/pilot" primary>Pilot-Angebot öffnen</TActionButton><TActionButton href="/tconsulting/roi">ROI öffnen</TActionButton><TActionButton href="/tconsulting/testfaelle">Deliverables öffnen</TActionButton><TActionButton href="/tconsulting/testfall-pilot">Generator öffnen</TActionButton></div>
              </article>
              <aside className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-300">Empfohlene nächste Entscheidung</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  <li>• Option 2: Nachricht + One-Pager an Turgay</li>
                  <li>• Falls Anhang: nur customer-safe Paket, nicht internes v0.9-Paket</li>
                  <li>• REG-Paket zunächst im Termin zeigen oder bewusst anhängen</li>
                  <li>• Pilotpreis nur nach Acun-Freigabe nennen</li>
                  <li>• QC/ALM-Import, PDF/A-2a und Negativdaten kundenseitig bestätigen lassen</li>
                </ul>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-300">Interne Preislogik</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-300"><p>Option A: 2.500 € netto / 1 Woche / 5 Spezifikationen</p><p>Option B: 4.900 € netto / 2 Wochen / 10 Spezifikationen</p></div>
              </aside>
            </div>
          </TPanel>

          <TPanel id="control-hubs" eyebrow="00 · Configured Control Hubs" title="Eigene Tconsulting-Knöpfe und Prozessfenster">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {controlHubs.map(([title, detail, href, cta], index) => (
                <article key={title} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4">
                  <p className="text-sm font-semibold text-slate-100">{title}</p>
                  <p className="mt-2 min-h-12 text-xs leading-5 text-slate-500">{detail}</p>
                  <div className="mt-4"><TActionButton href={href} primary={index === 0}>{cta}</TActionButton></div>
                </article>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {firstTask ? <TActionButton href={tconsultingTaskHref(firstTask)} primary>Aktive Tconsulting-Task öffnen</TActionButton> : null}
              <TActionButton href="/tconsulting/projects">Tconsulting Projekte</TActionButton>
              <TActionButton href="/tconsulting/pilot" primary>Pilot-Angebot</TActionButton>
              <TActionButton href="/tconsulting/roi">ROI / Preislogik</TActionButton>
              <TActionButton href="/tconsulting/reporting">Reporting</TActionButton>
            </div>
          </TPanel>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
            <TPanel id="agents" eyebrow="01 · Agent Overview" title="Agenten & aktuelle Tconsulting-Arbeit">
              <div className="grid gap-3 md:grid-cols-2">
                {tconsultingAgents.map((agent) => (
                  <article key={agent.name} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div><h3 className="text-lg font-semibold" style={{ color: agent.color }}>{agent.name}</h3><p className="text-xs text-slate-400">{agent.role}</p></div>
                      <TStatusPill value={agent.status} />
                    </div>
                    <div className="mt-4 rounded-[4px] border border-sky-300/20 bg-sky-400/10 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">Aktiv woran arbeitet er?</p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">{agent.activeNow}</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      {agentLiveTasks(agent, tTasks, 2).map((task) => <TActionButton key={task.path} href={tconsultingTaskHref(task)}>Live Task: {task.title}</TActionButton>)}
                    </div>
                    <ul className="mt-4 space-y-1.5 text-xs leading-5 text-slate-300">{agent.tasks.map((task) => <li key={task}>• {task}</li>)}</ul>
                  </article>
                ))}
              </div>
            </TPanel>

            <TPanel id="tasks" eyebrow="02 · Task Management" title="Tconsulting-Aufgaben">
              <div className="space-y-3">{tTasks.length ? tTasks.slice(0, 8).map((task, index) => <TTaskCard key={task.path} task={task} index={index} />) : <p className="text-sm text-slate-400">Noch keine Tconsulting-spezifischen Task-Dateien vorhanden.</p>}</div>
            </TPanel>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <TPanel id="projects" eyebrow="03 · Projekte" title="Tconsulting-Projekte & Fortschritt"><div className="space-y-3">{tProjects.length ? tProjects.map((project) => <TProjectCard key={project.path} project={project} />) : <p className="text-sm text-slate-400">Noch keine Tconsulting-spezifischen Projektdateien vorhanden.</p>}</div></TPanel>
            <TPanel id="weekly-plan" eyebrow="04 · Wochenplan" title="Fokusblöcke & Zeitplan"><div className="space-y-3 text-sm text-slate-300">{tconsultingWeeklyPlan.map(([day, focus, owner]) => <div key={day} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4"><strong className="text-sky-200">{day}:</strong> {focus}<p className="text-xs text-slate-500">Owner: {owner}</p></div>)}</div></TPanel>
            <TPanel id="automation" eyebrow="05 · Automation Center" title="QA & Business Automationen"><ul className="space-y-2 text-sm leading-6 text-slate-300">{tconsultingAutomations.map((automation) => <li key={automation} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] px-4 py-3">• {automation}</li>)}</ul></TPanel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
            <TPanel id="reporting" eyebrow="06 · Reporting" title="Tconsulting KPI Dashboard"><div className="grid gap-3 md:grid-cols-2">{[["Leads", "Aufbau", "Maurus"], ["Kundenprojekte", String(tProjects.length), "Aurus"], ["Umsatz", "optional", "Review"], ["QA-Automationen", String(tconsultingAutomations.length), "Cornus"]].map(([label, value, owner]) => <div key={label} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p><p className="text-xs text-slate-500">Owner: {owner}</p></div>)}</div></TPanel>
            <TPanel id="research" eyebrow="07 · Research Hub" title="Markttrends, Tools & KI-Chancen"><div className="grid gap-3 md:grid-cols-2">{tconsultingResearchItems.map((item) => <div key={item} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4 text-sm text-slate-300">• {item}</div>)}</div></TPanel>
          </section>
        </div>
      </TPage>
    </Shell>
  );
}
