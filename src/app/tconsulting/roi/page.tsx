import { Shell } from "@/components/mission-components";
import { TActionButton, THeader, TPanel, TPage, TStatCard } from "@/components/tconsulting-components";
import { getMissionData } from "@/lib/openclaw-data";

export const dynamic = "force-dynamic";

const scenarios = [
  {
    label: "Option A · konservativ",
    specs: 5,
    manualHours: 2,
    saving: 30,
    rate: 75,
    price: "2.500 €",
    detail: "Validiert Prozess und QC-Mapping, kein harter ROI-Beweis.",
  },
  {
    label: "Option A · realistisch",
    specs: 5,
    manualHours: 4,
    saving: 50,
    rate: 95,
    price: "2.500 €",
    detail: "Zeigt, ob QA hauptsächlich prüft/korrigiert statt neu zu schreiben.",
  },
  {
    label: "Option B · realistisch",
    specs: 10,
    manualHours: 4,
    saving: 50,
    rate: 95,
    price: "4.900 €",
    detail: "Besserer Proof, weil mehrere echte Spezifikationen Mapping-Probleme sichtbar machen.",
  },
  {
    label: "Option B · ambitioniert",
    specs: 10,
    manualHours: 6,
    saving: 65,
    rate: 120,
    price: "4.900 €",
    detail: "Wirtschaftlich interessant, wenn Spezifikationen regelmäßig verarbeitet werden.",
  },
];

export default function TconsultingRoiPage() {
  const data = getMissionData();
  return (
    <Shell data={data} variant="tconsulting">
      <TPage>
        <THeader
          eyebrow="Tconsulting · Business Case"
          title="QA Pilot ROI / Zeitersparnis"
          description="Interne Kalkulation: Was muss der QA/Testfall Pilot zeigen, damit Tconsulting den Wert erkennt? Keine harten Versprechen — Messmodell für den Pilot."
          action={<div className="flex gap-3"><TActionButton href="/tconsulting" primary>Zur Übersicht</TActionButton><TActionButton href="/tconsulting/pilot">Pilot</TActionButton></div>}
        />
        <div className="space-y-7 p-6 md:p-9">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TStatCard label="Option A" value="2.500 €" detail="1 Woche / 5 Spezifikationen / Validierungspilot." />
            <TStatCard label="Option B" value="4.900 €" detail="2 Wochen / 10 Spezifikationen / Umsetzungspilot." />
            <TStatCard label="Ziel" value="40–60 %" detail="Zu validierende Reduktion manueller Schreibarbeit." />
            <TStatCard label="Grenze" value="Review" detail="Human Review bleibt Pflicht; keine QA-Freigabe durch KI." />
          </section>

          <TPanel eyebrow="ROI-Modell" title="Szenarien für Zeitwert und Pilotlogik">
            <div className="grid gap-3 xl:grid-cols-2">
              {scenarios.map((scenario) => {
                const totalHours = scenario.specs * scenario.manualHours;
                const savedHours = Math.round(totalHours * scenario.saving) / 100;
                const value = Math.round(savedHours * scenario.rate);
                return (
                  <article key={scenario.label} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{scenario.label}</p>
                        <p className="mt-1 text-xs text-slate-500">Preisanker: {scenario.price}</p>
                      </div>
                      <span className="rounded-[4px] border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">{value.toLocaleString("de-DE")} € Zeitwert</span>
                    </div>
                    <div className="mt-4 grid gap-2 text-xs text-slate-300 md:grid-cols-2">
                      <p>{scenario.specs} Spezifikationen</p>
                      <p>{scenario.manualHours} h manuell je Spezifikation</p>
                      <p>{totalHours} h Baseline</p>
                      <p>{scenario.saving} % angenommene Ersparnis</p>
                      <p>{savedHours.toLocaleString("de-DE")} h gespart</p>
                      <p>{scenario.rate} €/h Opportunitätswert</p>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-400">{scenario.detail}</p>
                  </article>
                );
              })}
            </div>
          </TPanel>

          <TPanel eyebrow="Messpunkte" title="Was im Pilot gemessen werden sollte">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {["manuelle geschätzte Erstellzeit vorher", "Generator-/Reviewzeit", "Anzahl Testfälle und Steps", "QA-Korrekturaufwand", "QC/ALM-Importfehler", "wiederverwendbare Mapping-Regeln", "offene Testdaten/Annahmen", "QA-Nutzbarkeit 1–5", "Folgeprozess ja/nein"].map((item) => (
                <div key={item} className="rounded-[6px] border border-sky-400/15 bg-[#0a1d30] p-4 text-sm text-slate-300">• {item}</div>
              ))}
            </div>
          </TPanel>

          <TPanel eyebrow="Aurus Meinung" title="Wie Acun den Preis verteidigen kann">
            <p className="text-sm leading-6 text-slate-300">Der Pilot verkauft nicht nur Stundenersparnis. Er validiert Qualität, QC-/ALM-Mapping, Pflichtfelder, Wiederholbarkeit und einen möglichen Folgeprozess. Kostenloser Demo-Termin ist okay — echte Spezifikationen, Mapping und Auswertung sollten bezahlt sein.</p>
          </TPanel>
        </div>
      </TPage>
    </Shell>
  );
}
