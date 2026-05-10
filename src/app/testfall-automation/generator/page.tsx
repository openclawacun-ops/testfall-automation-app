import { generateTestForgeRun } from "@/app/actions";
import { Badge, Card, TestForgeHeader, TestForgeShell } from "@/components/testforge-shell";

export const dynamic = "force-dynamic";

const exportTargets = [
  { value: "markdown", label: "Markdown" },
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "manifest", label: "Manifest" },
  { value: "xlsx", label: "XLSX" },
];
const gates = [
  "Lokale Verarbeitung: keine externen Calls, keine Kundendatenübertragung",
  "Review-Fragen werden sichtbar markiert, statt Details zu erfinden",
  "Uploads: .txt, .md, .csv, .json, .docx und .xlsx für Kunden-Spezifikationen",
  "MVP-Exports: JSON, Markdown, CSV, XLSX, Summary, Manifest und ZIP",
];

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function TestfallGeneratorPage({ searchParams }: Props) {
  const error = (await searchParams)?.error;

  return (
    <TestForgeShell active="generator">
      <TestForgeHeader title="Generator" subtitle="Aus Rohtext lokal review-fähige Testfälle erzeugen" />

      <form action={generateTestForgeRun} className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.03em]">Eingabequelle</h2>
              <p className="mt-1 text-sm text-slate-500">Spezifikation einfügen oder hochladen, Projekt setzen und lokal generieren.</p>
            </div>
            <Badge tone="emerald">lokal aktiv</Badge>
          </div>

          <label className="mt-6 block text-sm font-bold text-slate-700" htmlFor="projectName">Projektname</label>
          <input
            id="projectName"
            name="projectName"
            defaultValue="TestForge MVP Run"
            className="mt-2 w-full rounded-2xl border border-white/80 bg-white/72 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none backdrop-blur-xl transition focus:border-slate-400 focus:bg-white focus:shadow-[0_14px_34px_rgba(15,23,42,0.07)]"
          />

          {error ? (
            <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">{error}</div>
          ) : null}

          <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor="sourceText">Anforderung / Spezifikation</label>
          <textarea
            id="sourceText"
            name="sourceText"
            minLength={20}
            className="mt-2 min-h-64 w-full resize-y rounded-3xl border border-white/80 bg-white/72 px-5 py-4 text-sm leading-6 text-slate-700 shadow-sm outline-none backdrop-blur-xl transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:shadow-[0_14px_34px_rgba(15,23,42,0.07)]"
            placeholder="Textarea nutzen oder unten eine .txt/.md/.csv/.json/.docx/.xlsx-Datei hochladen. Beispiel: Als Support-Mitarbeiter möchte ich Kundentickets filtern ..."
          />

          <div className="mt-5 grid gap-4 rounded-3xl border border-dashed border-slate-300 bg-white/55 p-5 shadow-inner shadow-slate-200/50 backdrop-blur-xl md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-800" htmlFor="sourceFile">Quelldatei (optional)</label>
              <input id="sourceFile" name="sourceFile" type="file" multiple accept=".txt,.md,.csv,.json,.docx,.xlsx,text/plain,text/markdown,application/json,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white" />
              <p className="mt-2 text-xs leading-5 text-slate-500">Eine Datei erzeugt einen Run. Mehrere Dateien erzeugen je Datei einen eigenen Run.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800" htmlFor="templateFile">Vorlage / Template (optional)</label>
              <input id="templateFile" name="templateFile" type="file" accept=".txt,.md,.csv,.json,.docx,.xlsx,text/plain,text/markdown,application/json,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white" />
              <p className="mt-2 text-xs leading-5 text-slate-500">Wird als Template-Kontext gespeichert und im Manifest/Review sichtbar.</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 content-start">
          <Card>
            <h2 className="text-xl font-bold tracking-[-0.03em]">Preset</h2>
            <div className="mt-4 grid gap-3">
              <label className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/62 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl">
                <input type="radio" name="preset" value="generic" defaultChecked className="mt-1 accent-slate-950" />
                <span><span className="block">Generic</span><span className="block text-xs font-medium text-slate-400">Neutraler MVP-Testfallgenerator</span></span>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/62 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl">
                <input type="radio" name="preset" value="tconsulting" className="mt-1 accent-slate-950" />
                <span><span className="block">Tconsulting</span><span className="block text-xs font-medium text-slate-400">Leicht auf Consulting-/QA-Review getrimmt</span></span>
              </label>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold tracking-[-0.03em]">Ziel-Export</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {exportTargets.map((target) => (
                <label key={target.value} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/62 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl">
                  <input name="exportTargets" value={target.value} type="checkbox" defaultChecked className="accent-slate-950" />
                  {target.label}
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold tracking-[-0.03em]">Quality Gates</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
              {gates.map((gate) => <li key={gate} className="rounded-2xl border border-white/80 bg-white/62 px-4 py-3 shadow-sm backdrop-blur-xl">✓ {gate}</li>)}
            </ul>
          </Card>

          <button type="submit" className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-[0_20px_45px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-800">Run lokal generieren</button>
          <p className="text-center text-xs text-slate-400">Einzeldatei öffnet danach die Detailansicht. Mehrere Dateien öffnen die Bibliothek.</p>
        </div>
      </form>
    </TestForgeShell>
  );
}
