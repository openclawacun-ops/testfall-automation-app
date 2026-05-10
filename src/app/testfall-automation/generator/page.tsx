import { Badge, Card, TestForgeHeader, TestForgeShell } from "@/components/testforge-shell";

export const dynamic = "force-dynamic";

const exportTargets = ["Markdown", "CSV", "QC/ALM", "XLSX"];
const gates = [
  "Mindestangaben: Zielsystem, Rolle, Vorbedingungen und erwartetes Ergebnis",
  "Offene Annahmen werden sichtbar als Review-Fragen markiert",
  "Keine externe Übergabe ohne menschliche Freigabe",
];

export default function TestfallGeneratorPage() {
  return (
    <TestForgeShell active="generator">
      <TestForgeHeader title="Generator" subtitle="Bereite Anforderungen für die lokale Testfall-Erzeugung vor" />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.03em]">Eingabequelle</h2>
              <p className="mt-1 text-sm text-slate-500">Text einfügen oder Datei-Zone für die spätere Anbindung nutzen.</p>
            </div>
            <Badge tone="amber">UI-MVP</Badge>
          </div>

          <label className="mt-6 block text-sm font-bold text-slate-700" htmlFor="source-text">Anforderung / Spezifikation</label>
          <textarea
            id="source-text"
            className="mt-2 min-h-56 w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white"
            placeholder="Beispiel: Als Nutzer möchte ich ... Akzeptanzkriterien: ..."
          />

          <div className="mt-5 rounded-3xl border border-dashed border-violet-200 bg-violet-50/60 p-8 text-center">
            <p className="text-sm font-bold text-violet-700">Datei hier ablegen</p>
            <p className="mt-1 text-sm text-violet-500">Upload-Anbindung folgt · aktuell keine Dateiaktion</p>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card>
            <h2 className="text-xl font-bold tracking-[-0.03em]">Ziel-Export</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {exportTargets.map((target) => (
                <label key={target} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" defaultChecked={target === "Markdown" || target === "CSV"} className="accent-violet-600" />
                  {target}
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold tracking-[-0.03em]">Quality Gates</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
              {gates.map((gate) => <li key={gate} className="rounded-2xl bg-slate-50 px-4 py-3">✓ {gate}</li>)}
            </ul>
          </Card>

          <button type="button" disabled className="rounded-2xl bg-slate-300 px-6 py-4 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed">Generator-Anbindung folgt</button>
          <p className="text-center text-xs text-slate-400">Keine externen Aktionen, keine Kundendatenübertragung.</p>
        </div>
      </div>
    </TestForgeShell>
  );
}
