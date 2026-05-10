import { getMissionData } from "@/lib/openclaw-data";
import { splitDone } from "@/lib/ui";
import { CreateForm, ItemCard, PageHeader, Shell } from "@/components/mission-components";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  const data = getMissionData();
  const { active, done } = splitDone(data.projects);

  return (
    <Shell data={data}>
      <PageHeader eyebrow="Portfolio" title="Projekte" description="Aktive Projekte getrennt von abgeschlossenen Phasen, damit der Fokus klar bleibt." />
      <div className="space-y-8 p-6 md:p-9">
        <CreateForm type="project" />

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c6a04a]">Aktiv</p>
              <h2 className="text-lg font-semibold text-stone-50">Laufende Projekte</h2>
            </div>
            <span className="text-xs text-stone-500">{active.length} aktiv</span>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {active.length ? active.map((item) => <ItemCard key={item.path} item={item} kind="projects" />) : <p className="rounded-lg border border-stone-800 bg-[#14120e] p-5 text-sm text-stone-500">Keine aktiven Projekte.</p>}
          </div>
        </section>

        <details className="rounded-lg border border-stone-800 bg-[#11100c]">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-stone-200 marker:hidden">
            Abgeschlossene Projekte/Phasen anzeigen · {done.length}
          </summary>
          <div className="grid gap-4 border-t border-stone-800 p-5 xl:grid-cols-2">
            {done.length ? done.map((item) => <ItemCard key={item.path} item={item} kind="projects" dense />) : <p className="text-sm text-stone-500">Noch keine abgeschlossenen Projekte.</p>}
          </div>
        </details>
      </div>
    </Shell>
  );
}
