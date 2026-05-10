import { getMissionData } from "@/lib/openclaw-data";
import { splitDone } from "@/lib/ui";
import { CreateForm, ItemCard, PageHeader, Shell } from "@/components/mission-components";

export const dynamic = "force-dynamic";

export default function TasksPage() {
  const data = getMissionData();
  const { active, done } = splitDone(data.tasks);

  return (
    <Shell data={data}>
      <PageHeader eyebrow="Work Queue" title="Aufgaben" description="Aktive Aufgaben bleiben oben. Erledigte Aufgaben sind getrennt, damit die Queue nicht voll läuft." />
      <div className="space-y-8 p-6 md:p-9">
        <CreateForm type="task" />

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c6a04a]">Aktiv</p>
              <h2 className="text-lg font-semibold text-stone-50">Offene Aufgaben</h2>
            </div>
            <span className="text-xs text-stone-500">{active.length} offen</span>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {active.length ? active.map((item) => <ItemCard key={item.path} item={item} kind="tasks" />) : <p className="rounded-lg border border-stone-800 bg-[#14120e] p-5 text-sm text-stone-500">Keine offenen Aufgaben.</p>}
          </div>
        </section>

        <details className="rounded-lg border border-stone-800 bg-[#11100c]">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-stone-200 marker:hidden">
            Erledigte Aufgaben anzeigen · {done.length}
          </summary>
          <div className="grid gap-4 border-t border-stone-800 p-5 xl:grid-cols-2">
            {done.length ? done.map((item) => <ItemCard key={item.path} item={item} kind="tasks" dense />) : <p className="text-sm text-stone-500">Noch keine erledigten Aufgaben.</p>}
          </div>
        </details>
      </div>
    </Shell>
  );
}
