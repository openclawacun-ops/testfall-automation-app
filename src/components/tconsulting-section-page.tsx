import { getMissionData } from "@/lib/openclaw-data";
import { agentLiveTasks, getTconsultingProjects, getTconsultingTasks, tconsultingAgents, tconsultingAutomations, tconsultingPilotOffer, tconsultingResearchItems, tconsultingTestcaseDeliverables, tconsultingWeeklyPlan, tconsultingTaskHref } from "@/lib/tconsulting-data";
import { Shell } from "@/components/mission-components";
import { TActionButton, THeader, TPage, TPanel, TProjectCard, TStatusPill, TTaskCard } from "@/components/tconsulting-components";

type Section = "control-hubs" | "agents" | "tasks" | "projects" | "weekly-plan" | "automation" | "testfaelle" | "pilot" | "reporting" | "research";

const meta: Record<Section, { title: string; eyebrow: string; description: string }> = {
  "control-hubs": { title: "Tconsulting Control Hubs", eyebrow: "00 · Prozessfenster", description: "Eigene Knöpfe für Tconsulting Bot-, Sub-Agent-, QA- und Research-Prozesse." },
  agents: { title: "Tconsulting Agent Overview", eyebrow: "01 · Agenten", description: "Welche KI-Agenten für Tconsulting aktiv sind und woran sie arbeiten." },
  tasks: { title: "Tconsulting Task Management", eyebrow: "02 · Aufgaben", description: "Nur Aufgaben mit Tconsulting-, QA-, Testing- oder Automation-Bezug." },
  projects: { title: "Tconsulting Projekte", eyebrow: "03 · Projekte", description: "Nur Projektdateien und Initiativen mit Tconsulting-Bezug." },
  "weekly-plan": { title: "Tconsulting Wochenplan", eyebrow: "04 · Zeitplan", description: "Fokusblöcke und automatische Priorisierung für den Kunden." },
  automation: { title: "Tconsulting Automation Center", eyebrow: "05 · Automationen", description: "QA-, Marketing-, Reporting- und Operator-Automationen für Tconsulting." },
  testfaelle: { title: "Tconsulting Testfälle", eyebrow: "06 · QA Deliverables", description: "Fertige Testfälle, Importpakete und Versandstatus für Tconsulting." },
  pilot: { title: "QA Testfall Automation Pilot", eyebrow: "07 · Pilot Offer", description: "Aus der fertigen Testfall-Demo wird ein kundenfähiges Pilotangebot für Tconsulting." },
  reporting: { title: "Tconsulting Reporting", eyebrow: "08 · KPIs", description: "Kunden-KPIs, Projekte, Automationen und Agent Performance." },
  research: { title: "Tconsulting Research Hub", eyebrow: "09 · Research", description: "Markttrends, neue Tools und KI-Chancen für Software Testing und QA Automation." },
};

export function TconsultingSectionPage({ section }: { section: Section }) {
  const data = getMissionData();
  const tasks = getTconsultingTasks(data);
  const projects = getTconsultingProjects(data);
  const firstTask = tasks[0];
  const m = meta[section];

  return (
    <Shell data={data} variant="tconsulting">
      <TPage>
        <THeader eyebrow={m.eyebrow} title={m.title} description={m.description} action={<TActionButton href="/tconsulting">Zur Tconsulting Übersicht</TActionButton>} />
        <div className="space-y-7 p-6 md:p-9">
          {section === "control-hubs" ? <TPanel eyebrow="00" title="Konfigurierte Tconsulting Prozessfenster"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{[["Sub-Agent Dispatch", "/tconsulting/agents"], ["QA Automation Pipeline", "/tconsulting/automation"], ["Task Execution Queue", "/tconsulting/tasks"], ["Research & Growth", "/tconsulting/research"]].map(([label, href]) => <div key={label} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4"><p className="text-sm font-semibold text-slate-100">{label}</p><p className="mt-2 text-xs text-slate-500">Bleibt vollständig im Tconsulting-Cockpit.</p><div className="mt-4"><TActionButton href={href} primary>{label}</TActionButton></div></div>)}</div>{firstTask ? <div className="mt-4"><TActionButton href={tconsultingTaskHref(firstTask)} primary>Aktive Tconsulting-Task öffnen</TActionButton></div> : null}</TPanel> : null}

          {section === "agents" ? <TPanel eyebrow="01" title="Agenten & aktive Kundenarbeit"><div className="grid gap-3 md:grid-cols-2">{tconsultingAgents.map((agent) => <article key={agent.name} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4"><div className="flex justify-between gap-3"><div><h3 className="text-lg font-semibold" style={{ color: agent.color }}>{agent.name}</h3><p className="text-xs text-slate-400">{agent.role}</p></div><TStatusPill value={agent.status} /></div><p className="mt-4 rounded-[4px] border border-sky-300/20 bg-sky-400/10 p-3 text-xs leading-5 text-slate-300">{agent.activeNow}</p><div className="mt-3 space-y-2">{agentLiveTasks(agent, tasks, 3).map((task) => <TActionButton key={task.path} href={tconsultingTaskHref(task)}>Live Task: {task.title}</TActionButton>)}</div><ul className="mt-4 text-xs leading-5 text-slate-300">{agent.tasks.map((task) => <li key={task}>• {task}</li>)}</ul></article>)}</div></TPanel> : null}

          {section === "tasks" ? <TPanel eyebrow="02" title="Nur Tconsulting-Aufgaben"><div className="space-y-3">{tasks.length ? tasks.map((task, index) => <TTaskCard key={task.path} task={task} index={index} />) : <p className="text-sm text-slate-400">Noch keine Tconsulting-spezifischen Aufgaben vorhanden.</p>}</div></TPanel> : null}
          {section === "projects" ? <TPanel eyebrow="03" title="Nur Tconsulting-Projekte"><div className="space-y-3">{projects.length ? projects.map((project) => <TProjectCard key={project.path} project={project} />) : <p className="text-sm text-slate-400">Noch keine Tconsulting-spezifischen Projekte vorhanden.</p>}</div></TPanel> : null}
          {section === "weekly-plan" ? <TPanel eyebrow="04" title="Tconsulting Wochenplan"><div className="space-y-3">{tconsultingWeeklyPlan.map(([day, focus, owner]) => <div key={day} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4 text-sm text-slate-300"><strong className="text-sky-200">{day}:</strong> {focus}<p className="text-xs text-slate-500">Owner: {owner}</p></div>)}</div></TPanel> : null}
          {section === "automation" ? <TPanel eyebrow="05" title="Tconsulting Automationen"><ul className="space-y-2 text-sm text-slate-300">{tconsultingAutomations.map((item) => <li key={item} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] px-4 py-3">• {item}</li>)}</ul><div className="mt-4 flex flex-wrap gap-3"><TActionButton href="/tconsulting/testfaelle" primary>Fertige Testfälle öffnen</TActionButton><TActionButton href={tconsultingPilotOffer.route}>Pilot-Angebot öffnen</TActionButton></div></TPanel> : null}
          {section === "testfaelle" ? <TPanel eyebrow="06" title="Fertige Testfall-Übergabe"><div className="grid gap-3 md:grid-cols-2">{tconsultingTestcaseDeliverables.map((item) => <div key={item.path} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4"><p className="text-sm font-semibold text-slate-100">{item.label}</p><p className="mt-2 font-mono text-[11px] text-sky-200">{item.path}</p><p className="mt-2 text-xs leading-5 text-slate-400">{item.detail}</p></div>)}</div><div className="mt-5 rounded-[6px] border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100"><strong>Status:</strong> zwei Testfälle fertig erstellt und lokal verpackt. E-Mail-Versand ist vorbereitet, aber blockiert bis Gmail/gog authentifiziert ist.</div></TPanel> : null}
          {section === "pilot" ? <TPanel eyebrow="07" title={tconsultingPilotOffer.title}><div className="grid gap-4 xl:grid-cols-[1fr_.9fr]"><article className="rounded-[6px] border border-emerald-400/25 bg-emerald-400/10 p-5"><div className="flex flex-wrap items-center gap-3"><TStatusPill value={tconsultingPilotOffer.status} /><span className="text-xs text-emerald-100">Demo-Beweis vorhanden</span></div><p className="mt-4 text-sm leading-6 text-slate-200">{tconsultingPilotOffer.proof}</p><p className="mt-4 text-sm leading-6 text-slate-300">{tconsultingPilotOffer.position}</p><div className="mt-5 flex flex-wrap gap-3"><TActionButton href="/tconsulting/testfaelle" primary>Demo-Outputs öffnen</TActionButton><TActionButton href="/tconsulting/tasks">Pilot-Task Queue</TActionButton></div></article><aside className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-300">Pilot Scope</p><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{tconsultingPilotOffer.scope.map((item) => <li key={item}>• {item}</li>)}</ul><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-300">Nächste Aktionen</p><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{tconsultingPilotOffer.nextActions.map((item) => <li key={item}>• {item}</li>)}</ul></aside></div></TPanel> : null}
          {section === "reporting" ? <TPanel eyebrow="07" title="Tconsulting KPIs"><div className="grid gap-3 md:grid-cols-2">{[["Tconsulting Tasks", tasks.length], ["Tconsulting Projekte", projects.length], ["Automationen", tconsultingAutomations.length], ["Testfall-Outputs", tconsultingTestcaseDeliverables.length], ["Agenten", 4]].map(([label, value]) => <div key={label} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p></div>)}</div></TPanel> : null}
          {section === "research" ? <TPanel eyebrow="08" title="Tconsulting Research"><div className="grid gap-3 md:grid-cols-2">{tconsultingResearchItems.map((item) => <div key={item} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4 text-sm text-slate-300">• {item}</div>)}</div></TPanel> : null}
        </div>
      </TPage>
    </Shell>
  );
}
