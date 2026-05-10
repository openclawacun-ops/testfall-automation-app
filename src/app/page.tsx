import Link from "next/link";
import { getMissionData } from "@/lib/openclaw-data";
import { doneCount, formatDateTime, splitDone, statusLabel } from "@/lib/ui";
import { ItemCard, MetricCard, PageHeader, Shell, navItems } from "@/components/mission-components";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const data = getMissionData();
  const mainAgent = data.agents.find((agent) => agent.id === "main") ?? data.agents[0];
  const telegram = data.channels.find((channel) => channel.id === "telegram");
  const { active: activeTasks, done: doneTasks } = splitDone(data.tasks);

  return (
    <Shell data={data}>
      <PageHeader
        eyebrow="Dashboard"
        title="Operatives Board"
        description="Klickbare Kommandozentrale für Aufgaben, Projekte, Kalender, Memory, Docs und Agenten. Alles basiert auf lokalen OpenClaw-Dateien und Runtime-Signalen."
      />
      <div className="space-y-8 p-6 md:p-9">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard href="/tasks" label="Aktive Aufgaben" value={data.tasks.length - doneCount(data.tasks)} detail={`${data.tasks.length} Aufgaben insgesamt`} />
          <MetricCard href="/projects" label="Projekte" value={data.projects.length} detail="Portfolio und aktuelle Initiativen" />
          <MetricCard href="/calendar" label="Kalender" value={data.calendar.length} detail="Wochenplan + ungeplante Queue" />
          <MetricCard href="/memory" label="Memory-Dateien" value={data.memory.length} detail="Langzeit- und Tagesnotizen" />
        </section>

        {data.linear ? (
          <section className="rounded-[4px] border border-[#222936] bg-[#111722] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-300">Linear · OpenClaw HQ</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-50">Operative Auslastung</h3>
                <p className="mt-2 text-sm text-slate-500">Read-only Snapshot aus Linear: Blocker, aktive Tasks und Done diese Woche.</p>
                <p className="mt-1 text-xs text-slate-600">Aktualisiert: {formatDateTime(data.linear.generatedAt)}</p>
              </div>
              <div className={`rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${data.linear.metrics.activeLimitOk ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/10 text-red-200"}`}>
                Aktiv: {data.linear.metrics.activeCount}/{data.linear.metrics.activeLimit}
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-[4px] border border-[#222936] bg-[#090e17] p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Issues</p><p className="mt-2 text-2xl font-semibold text-slate-50">{data.linear.metrics.totalIssues}</p></div>
              <div className="rounded-[4px] border border-[#222936] bg-[#090e17] p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Blockiert</p><p className="mt-2 text-2xl font-semibold text-slate-50">{data.linear.metrics.blockedCount}</p></div>
              <div className="rounded-[4px] border border-[#222936] bg-[#090e17] p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Done Woche</p><p className="mt-2 text-2xl font-semibold text-slate-50">{data.linear.metrics.doneThisWeek}</p></div>
              <div className="rounded-[4px] border border-[#222936] bg-[#090e17] p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Ready</p><p className="mt-2 text-2xl font-semibold text-slate-50">{data.linear.metrics.byState.Ready ?? 0}</p></div>
            </div>
            <div className="mt-5 grid gap-2 lg:grid-cols-2">
              {data.linear.focus.active.slice(0, 6).map((issue) => (
                <a key={issue.identifier} href={issue.url} className="rounded-[4px] border border-[#222936] bg-[#090e17] px-4 py-3 transition hover:border-pink-400/50">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-300">{issue.identifier} · {issue.state}</p>
                  <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-100">{issue.title}</p>
                  {issue.project ? <p className="mt-1 text-xs text-slate-600">{issue.project}</p> : null}
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          {navItems.slice(1).map((item) => (
            <Link key={item.href} href={item.href} className="rounded-[4px] border border-[#222936] bg-[#111722] p-6 transition hover:-translate-y-0.5 hover:border-pink-400/60 hover:bg-[#151d29]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-300">{item.eyebrow}</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-50">{item.label}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">Eigenes Fenster öffnen →</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Neueste Aufgaben</h3>
              <Link href="/tasks" className="text-xs font-semibold text-pink-300">Alle öffnen</Link>
            </div>
            <div className="grid gap-3">{activeTasks.slice(0, 4).map((item) => <ItemCard key={item.path} item={item} kind="tasks" dense />)}</div>
            {doneTasks.length ? <p className="mt-3 text-xs text-slate-500">{doneTasks.length} erledigte Aufgaben ausgeblendet · <Link href="/tasks" className="text-pink-300">anzeigen</Link></p> : null}
          </div>
          <aside className="rounded-[4px] border border-[#222936] bg-[#111722] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-300">Agent Panel</p>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[4px] bg-pink-500 text-xl font-semibold text-black">⚜</div>
              <div>
                <h3 className="text-xl font-semibold text-slate-50">{mainAgent?.name ?? "Aurus"}</h3>
                <p className="text-xs text-slate-500">Operator · Koordination · Mission Control</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {data.runtime.map((signal) => (
                <div key={signal.label} className="flex items-center justify-between rounded-[4px] border border-[#222936] bg-[#090e17] px-4 py-3">
                  <div><p className="text-sm font-medium text-slate-100">{signal.label}</p><p className="text-xs text-slate-500">{statusLabel(signal.value)}</p></div>
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-pink-400" />
                </div>
              ))}
              {telegram ? <div className="rounded-[4px] border border-pink-400/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-200">Telegram: {telegram.connected ? "verbunden" : "offline"}{telegram.botUsername ? ` · @${telegram.botUsername}` : ""}</div> : null}
            </div>
          </aside>
        </section>

        {data.activeRoadmap ? (
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[4px] border border-pink-400/25 bg-[#111722] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-300">Active Roadmap</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-50">{data.activeRoadmap.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{data.activeRoadmap.excerpt}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
                <span>{data.activeRoadmap.relativePath}</span>
                {data.activeRoadmap.updatedAt ? <span>Aktualisiert: {formatDateTime(data.activeRoadmap.updatedAt)}</span> : null}
              </div>
            </div>
            <div className="rounded-[4px] border border-[#222936] bg-[#111722] p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-300">Offene Roadmap-Aktionen</p>
                <span className="rounded-[3px] bg-pink-500/10 px-2 py-1 text-[10px] font-semibold text-pink-200">{data.activeRoadmap.openActions.length}</span>
              </div>
              <ul className="grid gap-2 text-sm leading-6 text-slate-300 md:grid-cols-2">
                {data.activeRoadmap.openActions.slice(0, 12).map((action) => (
                  <li key={action} className="rounded-[4px] border border-[#222936] bg-[#090e17] px-3 py-2">• {action}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </Shell>
  );
}
