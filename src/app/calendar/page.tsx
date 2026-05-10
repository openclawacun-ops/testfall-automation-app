import { CalendarTimetable } from "@/components/calendar-timetable";
import { ItemCard, PageHeader, Shell } from "@/components/mission-components";
import { getMissionData } from "@/lib/openclaw-data";

export const dynamic = "force-dynamic";

export default function CalendarPage() {
  const data = getMissionData();
  const scheduledCount = data.scheduledCalendar.filter((item) => item.day !== undefined && item.startMinutes !== undefined).length;
  const unscheduledCount = data.scheduledCalendar.length - scheduledCount;

  return (
    <Shell data={data}>
      <PageHeader eyebrow="Kalender" title="Interaktiver Wochen-Stundenplan" description="Ein ruhiger Wochenblick von 07:00 bis 23:00: echte erkannte Termine im Raster, echte Aufgaben und Kalenderdateien ohne Uhrzeit sauber gruppiert in der Seitenlane." />
      <div className="space-y-7 p-6 md:p-9">
        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-stone-800 bg-[#14120e] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">Geplante Slots</p>
            <p className="mt-2 text-2xl font-semibold text-stone-50">{scheduledCount}</p>
          </div>
          <div className="rounded-lg border border-stone-800 bg-[#14120e] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">Ohne Uhrzeit</p>
            <p className="mt-2 text-2xl font-semibold text-stone-50">{unscheduledCount}</p>
          </div>
          <div className="rounded-lg border border-stone-800 bg-[#14120e] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">Quellen</p>
            <p className="mt-2 text-2xl font-semibold text-stone-50">{data.calendar.length}</p>
          </div>
        </section>
        <CalendarTimetable items={data.scheduledCalendar} />
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">Kalenderquellen</h3>
          {data.calendar.length ? <div className="grid gap-4 xl:grid-cols-2">{data.calendar.map((item) => <ItemCard key={item.path} item={item} dense />)}</div> : <p className="rounded-lg border border-dashed border-stone-800 bg-[#14120e] p-5 text-sm text-stone-500">Keine Kalenderquellen im Workspace gefunden.</p>}
        </section>
      </div>
    </Shell>
  );
}
