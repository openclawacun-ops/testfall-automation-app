import { deleteScheduledCalendarItem, scheduleUnplannedCalendarItem } from "@/app/actions";
import type { ScheduledCalendarItem } from "@/lib/openclaw-data";

const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const longDays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const hours = Array.from({ length: 16 }, (_, i) => i + 7);
const slotTimes = Array.from({ length: 33 }, (_, i) => {
  const minutes = 7 * 60 + i * 30;
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
});

function timeLabel(minutes?: number) {
  if (minutes === undefined) return "ohne Uhrzeit";
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function currentWeekDay() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function kindLabel(kind: ScheduledCalendarItem["kind"]) {
  return kind === "task" ? "Aufgabe" : "Kalender";
}

function groupByKind(items: ScheduledCalendarItem[]) {
  return {
    calendar: items.filter((item) => item.kind === "calendar"),
    task: items.filter((item) => item.kind === "task"),
  };
}

function EventDetails({ item, compact = false }: { item: ScheduledCalendarItem; compact?: boolean }) {
  const defaultEnd = "10:00";
  return (
    <details className={`group border border-stone-800 bg-[#0d0c09] open:border-[#b8943a]/45 open:bg-[#18130c] ${compact ? "p-3" : "p-2"}`}>
      <summary className="cursor-pointer list-none marker:hidden">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c6a04a]">{kindLabel(item.kind)} · {timeLabel(item.startMinutes)}</span>
            <span className="mt-1 block line-clamp-2 text-sm font-medium text-stone-100 group-open:text-[#e6c66a]">{item.title}</span>
          </span>
          <span className="text-stone-600 group-open:text-[#c6a04a]">+</span>
        </span>
      </summary>
      <p className="mt-3 text-xs leading-5 text-stone-400">{item.excerpt || "Kein weiterer Text in der Quelle."}</p>
      <p className="mt-3 break-all border-t border-stone-800 pt-2 text-[10px] text-stone-600">{item.sourceRelativePath}</p>
      {item.startMinutes === undefined || item.day === undefined ? (
        <form action={scheduleUnplannedCalendarItem} className="mt-3 grid gap-2 border-t border-stone-800 pt-3">
          <input type="hidden" name="sourceRelativePath" value={item.sourceRelativePath} />
          <input type="hidden" name="title" value={item.title} />
          <label className="grid gap-1 text-[10px] uppercase tracking-wide text-stone-500">Tag
            <select name="day" defaultValue={currentWeekDay()} className="rounded-md border border-stone-800 bg-[#080806] px-2 py-2 text-xs text-stone-100 outline-none">
              {longDays.map((day, index) => <option key={day} value={index}>{day}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-[10px] uppercase tracking-wide text-stone-500">Start
              <select name="start" defaultValue="09:00" className="rounded-md border border-stone-800 bg-[#080806] px-2 py-2 text-xs text-stone-100 outline-none">
                {slotTimes.slice(0, -1).map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-[10px] uppercase tracking-wide text-stone-500">Ende
              <select name="end" defaultValue={defaultEnd} className="rounded-md border border-stone-800 bg-[#080806] px-2 py-2 text-xs text-stone-100 outline-none">
                {slotTimes.slice(1).map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
            </label>
          </div>
          <button className="rounded-md bg-[#b8943a] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-black transition hover:bg-[#cba64d]">In Stundenplan einfügen</button>
        </form>
      ) : null}
    </details>
  );
}

export function CalendarTimetable({ items }: { items: ScheduledCalendarItem[] }) {
  const scheduled = items.filter((item) => item.day !== undefined && item.startMinutes !== undefined);
  const unscheduled = items.filter((item) => item.day === undefined || item.startMinutes === undefined);
  const unscheduledByKind = groupByKind(unscheduled);
  const today = currentWeekDay();
  const start = 7 * 60;
  const end = 23 * 60;
  const hourHeight = 76;
  const gridHeight = hours.length * hourHeight;
  const total = end - start;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = nowMinutes >= start && nowMinutes <= end;

  return (
    <div className="grid gap-5 2xl:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-lg border border-stone-800 bg-[#14120e] shadow-2xl shadow-black/20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 bg-[#0d0b08] px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c6a04a]">Wochenraster</p>
            <p className="mt-1 text-xs text-stone-500">Klick auf Einträge öffnet Details aus der echten Quelldatei.</p>
          </div>
          <div className="flex gap-2 text-[10px] uppercase tracking-wide text-stone-500">
            <span className="border border-[#b8943a]/35 bg-[#b8943a]/12 px-2 py-1 text-[#e6c66a]">Termin</span>
            <span className="border border-stone-700 bg-[#0d0c09] px-2 py-1">Heute markiert</span>
          </div>
        </div>
        <div className="mc-scrollbar overflow-x-auto">
          <div className="min-w-[1080px]">
            <div className="sticky top-0 z-30 grid grid-cols-[76px_repeat(7,minmax(136px,1fr))] border-b border-stone-800 bg-[#0d0b08] text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              <div className="p-3 text-[#c6a04a]">Zeit</div>
              {days.map((day, dayIndex) => (
                <div key={day} className={`border-l border-stone-800 p-3 text-center ${dayIndex === today ? "bg-[#b8943a]/10 text-[#e6c66a]" : ""}`}>
                  <span className="block text-[10px] text-stone-600">{longDays[dayIndex]}</span>
                  <span className="mt-1 block text-sm">{day}</span>
                </div>
              ))}
            </div>
            <div className="relative grid grid-cols-[76px_repeat(7,minmax(136px,1fr))]" style={{ height: gridHeight }}>
              <div className="bg-[#0d0b08]">
                {hours.map((hour) => <div key={hour} className="border-b border-stone-800/70 px-3 pt-2 text-[11px] text-stone-500" style={{ height: hourHeight }}>{String(hour).padStart(2, "0")}:00</div>)}
              </div>
              {days.map((day, dayIndex) => (
                <div key={day} className={`relative border-l border-stone-800/80 ${dayIndex === today ? "bg-[#b8943a]/[0.035]" : ""}`}>
                  {hours.map((hour) => <div key={hour} className="border-b border-stone-800/55" style={{ height: hourHeight }} />)}
                  {dayIndex === today && showNowLine ? <div className="absolute left-0 right-0 z-10 border-t border-[#e6c66a]/80" style={{ top: Math.max(0, ((nowMinutes - start) / total) * gridHeight) }}><span className="absolute -top-2 left-1 bg-[#0d0b08] px-1 text-[10px] text-[#e6c66a]">jetzt</span></div> : null}
                  {scheduled.filter((item) => item.day === dayIndex).map((item) => {
                    const itemStart = item.startMinutes ?? start;
                    const itemEnd = item.endMinutes ?? itemStart + 60;
                    const top = Math.max(0, ((itemStart - start) / total) * gridHeight);
                    const height = Math.max(54, ((itemEnd - itemStart) / total) * gridHeight);
                    return (
                      <details key={item.id} className="group absolute left-2 right-2 z-20 border border-[#b8943a]/35 bg-[#2a210e]/95 p-2 shadow-lg shadow-black/30 open:z-40 open:border-[#e6c66a]/60 open:bg-[#201906]" style={{ top, minHeight: height }}>
                        <summary className="cursor-pointer list-none marker:hidden">
                          <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#e6c66a]">{timeLabel(item.startMinutes)} - {timeLabel(item.endMinutes)}</span>
                          <span className="mt-1 block line-clamp-2 text-xs font-semibold leading-4 text-stone-100">{item.title}</span>
                        </summary>
                        <p className="mt-2 text-[11px] leading-4 text-stone-300">{item.excerpt}</p>
                        <p className="mt-2 break-all border-t border-[#b8943a]/20 pt-2 text-[10px] text-stone-500">{kindLabel(item.kind)} · {item.sourceRelativePath}</p>
                        <form action={deleteScheduledCalendarItem} className="mt-2">
                          <input type="hidden" name="sourceRelativePath" value={item.sourceRelativePath} />
                          <input type="hidden" name="lineIndex" value={item.id.split(":").at(-1) ?? ""} />
                          <button className="rounded-md border border-red-400/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-200 hover:bg-red-400/10">Aus Stundenplan löschen</button>
                        </form>
                      </details>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-stone-800 bg-[#14120e] p-5 shadow-2xl shadow-black/20">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c6a04a]">Ohne festen Slot</p>
        <h3 className="mt-2 text-lg font-semibold text-stone-50">Ungeplante echte Einträge</h3>
        <p className="mt-2 text-xs leading-5 text-stone-500">Aufgaben und Kalenderdateien ohne erkennbare Uhrzeit bleiben hier, getrennt nach Typ.</p>
        <div className="mt-4 grid max-h-[760px] gap-5 overflow-y-auto pr-1 mc-scrollbar">
          {(["calendar", "task"] as const).map((kind) => {
            const group = unscheduledByKind[kind];
            return (
              <section key={kind}>
                <div className="mb-2 flex items-center justify-between border-b border-stone-800 pb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">{kindLabel(kind)}</h4>
                  <span className="text-xs text-stone-600">{group.length}</span>
                </div>
                <div className="grid gap-2">
                  {group.length ? group.map((item) => <EventDetails key={item.id} item={item} compact />) : <p className="border border-dashed border-stone-800 bg-[#0d0c09] p-3 text-xs leading-5 text-stone-600">Keine ungeplanten {kindLabel(kind).toLowerCase()}-Einträge gefunden.</p>}
                </div>
              </section>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
