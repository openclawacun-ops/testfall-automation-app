import { MetricCard, PageHeader, Shell, StatusPill } from "@/components/mission-components";
import type { AgentInfo } from "@/lib/openclaw-data";
import { getMissionData } from "@/lib/openclaw-data";
import { statusLabel } from "@/lib/ui";

export const dynamic = "force-dynamic";

type AgentCharacter = {
  archetype: string;
  symbol: string;
  mission: string;
  recommendedUse: string;
  visual: string;
};

const characterById: Record<string, AgentCharacter> = {
  aurus: {
    archetype: "Operator / Chief of Staff",
    symbol: "⚜️",
    mission: "Koordiniert Prioritäten, verteilt Arbeit, hält Kontext zusammen und sorgt dafür, dass aus Ideen echte nächste Schritte werden.",
    recommendedUse: "Nutzen für Planung, Entscheidungen, Kundensituation, Delegation und Gesamtüberblick.",
    visual: "Command",
  },
  cornus: {
    archetype: "Implementation Engineer",
    symbol: "</>",
    mission: "Baut Features, fixt Bugs, prüft Builds und übersetzt Anforderungen in robuste, wartbare Software.",
    recommendedUse: "Nutzen für Coding, Refactors, Tests, technische Diagnose und Umsetzungsarbeit.",
    visual: "Code",
  },
  maurus: {
    archetype: "Marketing / Growth Strategist",
    symbol: "✦",
    mission: "Schärft Positionierung, Content, Kampagnen und Wachstumshebel mit Blick auf konkrete Business-Wirkung.",
    recommendedUse: "Nutzen für Angebote, Landingpages, Social Content, Funnel-Ideen und Kundenkommunikation.",
    visual: "Growth",
  },
  romus: {
    archetype: "Research / Intelligence Analyst",
    symbol: "◈",
    mission: "Sammelt Signale, verdichtet Recherche und macht aus verstreuter Information handlungsfähige Lagebilder.",
    recommendedUse: "Nutzen für Markt-/Tool-Recherche, Wettbewerbschecks, Quellenarbeit und Briefings.",
    visual: "Intel",
  },
  finus: {
    archetype: "Finance Research Analyst",
    symbol: "€",
    mission: "Recherchiert aktuelle Finanz-Tipps, Trends, Tools, Chancen und Risiken quellenbasiert — ohne Anlage-, Steuer- oder Rechtsberatung zu ersetzen.",
    recommendedUse: "Nutzen für Finanz-Briefings, Banken-/Broker-/ETF-/Zins-Recherche, Risiko-Checks und praktische Entscheidungsgrundlagen.",
    visual: "Finance",
  },
};

function characterFor(agent: AgentInfo): AgentCharacter {
  return characterById[agent.id.toLowerCase()] ?? {
    archetype: agent.role || "Spezialagent",
    symbol: agent.name.slice(0, 1).toUpperCase(),
    mission: agent.role || "Übernimmt spezialisierte Aufgaben im OpenClaw-Team.",
    recommendedUse: "Nutzen, wenn diese Rolle am besten zum Auftrag passt.",
    visual: "Agent",
  };
}

function AgentCharacterCard({ agent }: { agent: AgentInfo }) {
  const character = characterFor(agent);
  return (
    <article className="relative overflow-hidden rounded-lg border border-stone-800/90 bg-[#14120e] p-5 shadow-2xl shadow-black/20 transition hover:border-[#b8943a]/55 hover:bg-[#19150f]">
      <div className="absolute right-0 top-0 h-28 w-28 border-l border-b border-[#b8943a]/15 bg-[#b8943a]/5" />
      <div className="relative flex items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center border border-[#b8943a]/40 bg-[#0d0b08] text-2xl font-semibold text-[#e6c66a] shadow-inner shadow-black/40">
          {character.symbol}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c6a04a]">{agent.id}</p>
            <StatusPill>{statusLabel(agent.status)}</StatusPill>
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.015em] text-stone-50">{agent.name}</h3>
          <p className="mt-1 text-sm font-medium text-stone-300">{character.archetype}</p>
        </div>
      </div>

      <div className="relative mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">Mission</p>
          <p className="mt-2 text-sm leading-6 text-stone-400">{character.mission}</p>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">Empfohlener Einsatz</p>
          <p className="mt-2 text-sm leading-6 text-stone-400">{character.recommendedUse}</p>
        </div>
        <dl className="grid gap-2 text-xs text-stone-400">
          <div className="border border-stone-800 bg-[#0d0c09] p-3">
            <dt className="text-stone-600">Model</dt>
            <dd className="mt-1 break-all text-stone-200">{agent.model}</dd>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-stone-800 bg-[#0d0c09] p-3">
              <dt className="text-stone-600">Memory</dt>
              <dd className="mt-1 text-lg font-semibold text-stone-100">{agent.memoryFiles}</dd>
            </div>
            <div className="border border-stone-800 bg-[#0d0c09] p-3">
              <dt className="text-stone-600">Visual</dt>
              <dd className="mt-1 text-lg font-semibold text-[#e6c66a]">{character.visual}</dd>
            </div>
          </div>
          <div className="border border-stone-800 bg-[#0d0c09] p-3">
            <dt className="text-stone-600">Workspace</dt>
            <dd className="mt-1 break-all text-stone-300">{agent.workspace}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default function TeamPage() {
  const data = getMissionData();
  return (
    <Shell data={data}>
      <PageHeader eyebrow="Team" title="Agenten & Charaktere" description="Das OpenClaw-Team als nutzbare Rollenkarte: wer wofür gedacht ist, welches Modell läuft und wann du welchen Agenten einsetzen solltest." />
      <div className="space-y-8 p-6 md:p-9">
        <section className="grid gap-4 md:grid-cols-3">{data.runtime.map((item) => <MetricCard key={item.label} label={item.label} value={statusLabel(item.value)} detail={item.detail} />)}</section>
        <section className="grid gap-4 xl:grid-cols-2">
          {data.agents.map((agent) => <AgentCharacterCard key={agent.id} agent={agent} />)}
        </section>
        <section className="grid gap-4 xl:grid-cols-2">
          {data.channels.map((channel) => <MetricCard key={channel.id} label={channel.label} value={channel.connected ? "verbunden" : channel.configured ? "konfiguriert" : "offen"} detail={channel.detail} />)}
        </section>
      </div>
    </Shell>
  );
}
