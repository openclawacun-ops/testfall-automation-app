import fs from "node:fs";
import path from "node:path";
import { getMissionData } from "@/lib/openclaw-data";
import { PageHeader, Shell } from "@/components/mission-components";

export const dynamic = "force-dynamic";

type ContentDoc = {
  title: string;
  label: string;
  path: string;
  relativePath: string;
  excerpt: string;
  updatedAt?: string;
};

const WORKSPACE = path.resolve(process.cwd(), "..");
const OBSIDIAN = path.join(process.env.USERPROFILE ?? "C:\\Users\\openc", "Documents", "OpenClaw-Obsidian-Memory");

const contentFiles = [
  ["Integrated Plan", path.join(OBSIDIAN, "40_Business", "AI Transformation Account Integrated Plan.md")],
  ["30-Day Plan", path.join(OBSIDIAN, "40_Business", "AI Transformation Account 30-Day Plan.md")],
  ["30-Day Calendar", path.join(OBSIDIAN, "40_Business", "AI Transformation Account 30-Day Calendar.md")],
  ["Account Setup", path.join(OBSIDIAN, "40_Business", "AI Transformation Account Setup.md")],
  ["Source Assets", path.join(OBSIDIAN, "40_Business", "AI Transformation Source Assets Checklist.md")],
  ["Service Offer", path.join(OBSIDIAN, "40_Business", "AI Transformation Content Sprint Offer.md")],
  ["Core Concept", path.join(OBSIDIAN, "40_Business", "AI Face Body Transformation Content Account.md")],
  ["Hooks & Scripts", path.join(OBSIDIAN, "40_Business", "AI Transformation Account Hooks and Scripts.md")],
  ["Mission Summary", path.join(WORKSPACE, "docs", "ai-transformation-mission-control-summary.md")],
  ["Calendar CSV", path.join(WORKSPACE, "docs", "ai-transformation-30-day-calendar.csv")],
  ["Launch Task", path.join(WORKSPACE, "tasks", "ai-transformation-account-30-day-launch.md")],
  ["Project", path.join(WORKSPACE, "projects", "ai-transformation-content-account.md")],
  ["Pipeline README", path.join(WORKSPACE, "projects", "ai-transformation-content-pipeline", "README.md")],
  ["Week 1 Batch", path.join(WORKSPACE, "projects", "ai-transformation-content-pipeline", "tracking", "week1_batch.csv")],
] as const;

function readDoc(label: string, filePath: string): ContentDoc | null {
  try {
    const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    const stat = fs.statSync(filePath);
    const title = raw.split(/\r?\n/).find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() || path.basename(filePath);
    const excerpt = raw
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.startsWith("#"))
      .slice(0, 5)
      .join(" ")
      .slice(0, 420);
    return {
      title,
      label,
      path: filePath,
      relativePath: filePath.startsWith(WORKSPACE) ? path.relative(WORKSPACE, filePath) : path.relative(OBSIDIAN, filePath),
      excerpt,
      updatedAt: stat.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
}

export default function ContentPage() {
  const data = getMissionData();
  const docs = contentFiles.map(([label, filePath]) => readDoc(label, filePath)).filter((doc): doc is ContentDoc => Boolean(doc));
  const week1 = docs.find((doc) => doc.label === "Week 1 Batch");
  const pipeline = docs.find((doc) => doc.label === "Pipeline README");

  const stats = [
    ["Content-Artefakte", docs.length, "Obsidian + lokale Workspace-Dateien"],
    ["30-Tage Plan", "60", "2 Videos/Tag: 12:15 und 18:30"],
    ["Woche 1 Batch", "14", "Produktionsordner vorbereitet"],
    ["Service", "Sprint", "499-1.500 EUR Pilot/Standard"],
  ];

  return (
    <Shell data={data}>
      <PageHeader
        eyebrow="Content Account"
        title="AI Transformation Content Hub"
        description="Eigenes Fenster fuer alles, was zu Acuns AI Face/Body Transformation Account in Obsidian und Mission Control entstanden ist: Plan, Kalender, Angebot, Setup, Source Assets und Produktionspipeline."
      />

      <div className="space-y-8 p-6 md:p-9">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, detail]) => (
            <div key={label} className="rounded-[4px] border border-fuchsia-400/20 bg-[#111722] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-fuchsia-300">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-50">{value}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[4px] border border-fuchsia-400/25 bg-[#111722] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fuchsia-300">Positionierung</p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-50">Ein Gesicht. Hundert Rollen. Eine Lektion pro Video.</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Acun verwandelt sich mit KI in Rollen, Archetypen und Kampagnenlooks. Der Account validiert Formate, baut Portfolio auf und fuehrt spaeter in den AI Transformation Content Sprint.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {["@hundertrollen als bevorzugter Handle", "2 Posts pro Tag fuer 30 Tage", "Nur eigene/freigegebene Assets", "Kein automatisches Posting ohne Freigabe"].map((item) => (
                <div key={item} className="rounded-[4px] border border-[#222936] bg-[#090e17] px-4 py-3 text-sm text-slate-300">• {item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-[4px] border border-[#222936] bg-[#111722] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fuchsia-300">Naechste Produktion</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-50">Video 001 — Selfie AI Glow-Up</h3>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
              <li>• Slot: 04.05.2026, 12:15 Europe/Berlin</li>
              <li>• Hook: Aus diesem normalen Selfie wurde DAS...</li>
              <li>• CTA: Bewerte 1-10</li>
              <li>• Blocker: Acun-approved Selfie/Referenzbild</li>
            </ul>
            <p className="mt-4 rounded-[4px] border border-amber-400/25 bg-amber-400/10 p-3 text-xs leading-5 text-amber-100">
              Source Assets Drop: projects/ai-transformation-content-pipeline/source-assets/acun-approved/
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-[4px] border border-[#222936] bg-[#111722] p-6 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fuchsia-300">Obsidian / Workspace</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-50">Alle Content-Artefakte</h3>
              </div>
              <span className="rounded-[3px] bg-fuchsia-500/10 px-2 py-1 text-[10px] font-semibold text-fuchsia-200">{docs.length} Dateien</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {docs.map((doc) => (
                <article key={doc.path} className="rounded-[4px] border border-[#222936] bg-[#090e17] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-300">{doc.label}</p>
                  <h4 className="mt-2 line-clamp-2 text-base font-semibold text-slate-50">{doc.title}</h4>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{doc.excerpt || doc.relativePath}</p>
                  <div className="mt-3 space-y-1 text-[10px] text-slate-600">
                    <p className="truncate">{doc.relativePath}</p>
                    <p>Aktualisiert: {formatDate(doc.updatedAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[4px] border border-[#222936] bg-[#111722] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fuchsia-300">KI-Service</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-50">AI Transformation Content Sprint</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">7-14 Tage Sprint fuer Creator, Coaches, Personal Brands und lokale Premium-Businesses.</p>
              <ul className="mt-4 space-y-2 text-xs leading-5 text-slate-300">
                <li>• Pilot: 499-750 EUR</li>
                <li>• Standard: 1.250-1.500 EUR</li>
                <li>• Retainer: 1.500-3.000 EUR/Monat</li>
              </ul>
            </div>

            <div className="rounded-[4px] border border-[#222936] bg-[#111722] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fuchsia-300">Pipeline</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-50">Local-only Workflow</h3>
              <p className="mt-3 text-xs leading-5 text-slate-500">{pipeline?.relativePath}</p>
              <ol className="mt-4 space-y-2 text-xs leading-5 text-slate-300">
                <li>1. Script</li>
                <li>2. Shotlist</li>
                <li>3. Assets</li>
                <li>4. Editing</li>
                <li>5. QA</li>
                <li>6. Posting Brief</li>
              </ol>
            </div>

            <div className="rounded-[4px] border border-[#222936] bg-[#111722] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fuchsia-300">Week 1</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-50">14 geplante Videos</h3>
              <p className="mt-3 text-xs leading-5 text-slate-500">{week1?.relativePath}</p>
            </div>
          </aside>
        </section>
      </div>
    </Shell>
  );
}
