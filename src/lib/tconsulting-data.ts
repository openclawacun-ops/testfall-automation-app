import { detailSlug } from "@/lib/openclaw-data";
import type { FileItem, MissionData } from "@/lib/openclaw-data";

export const tconsultingKeywords = /tconsulting|softwaretesting|software testing|qa|quality assurance|testautomation|testautomatisierung|testing|testfall|testfälle|bug|regression|selenium|cypress/i;

export const tconsultingAgents = [
  {
    name: "Maurus",
    role: "Marketing & Growth",
    status: "working",
    color: "#38bdf8",
    activeNow: "Tconsulting Lead-Generierung, LinkedIn-Positionierung und QA-/Testing-Content.",
    keywords: /tconsulting|lead|marketing|linkedin|content|outreach|case stud/i,
    tasks: ["LinkedIn Content zu QA/KI", "Case Studies", "Lead-Listen Banking/Insurance/Automotive", "Outreach Automation"],
  },
  {
    name: "Cornus",
    role: "Coding & QA Automation",
    status: "active",
    color: "#22d3ee",
    activeNow: "Tconsulting Cockpit, QA-Automation-Prototypen und technische Testing-Workflows.",
    keywords: /tconsulting|qa|testing|testautomation|testautomatisierung|selenium|cypress|bug|regression/i,
    tasks: ["Testautomatisierung", "QA Scripts", "API/UI Testing", "KI-Tool Integration"],
  },
  {
    name: "Romus",
    role: "Research & Intelligence",
    status: "working",
    color: "#60a5fa",
    activeNow: "QA-Trends, Tool-Recherche, Wettbewerber und KI-Chancen für Tconsulting.",
    keywords: /tconsulting|research|trend|tool|qa|testing|automation|discovery/i,
    tasks: ["QA Trends", "Konkurrenzanalyse", "Tool Research", "KI-Chancen"],
  },
  {
    name: "Aurus",
    role: "Operator / Execution",
    status: "active",
    color: "#93c5fd",
    activeNow: "Tconsulting Aufgabensteuerung, Wochenplan, Reports, Kunden-Dashboard und Agent-Koordination.",
    keywords: /tconsulting|mission-control|dashboard|discovery|automation|report|planung/i,
    tasks: ["Priorisierung", "Wochenplanung", "Reports", "Agent-Koordination"],
  },
];

export const tconsultingAutomations = [
  "Automatische Testfall-Generierung aus Anforderungen",
  "Bug-Report Analyse & Priorisierung",
  "Regression-Test-Automation",
  "QA Reporting Automation für Kundenstatus",
  "Meeting Notes → QA Tasks / Follow-ups",
  "Marketing Automation für QA-Leads",
];

export const tconsultingPilotOffer = {
  title: "QA Testfall Automation Pilot",
  status: "pilot ready",
  route: "/tconsulting/pilot",
  proof: "Technischer Pilot läuft lokal: 22 generierte Testfälle / 140 Steps im Testfall-Pilot plus REG446/REG447 Expanded v2 mit 13 review-sicheren Testfällen / 68 Steps, QC-CSV, XLSX, Prüfkriterien und Handoff-ZIP.",
  position: "KI-Testfall-Assistent mit Human Review: schneller schreiben, sauberer strukturieren, importfähig vorbereiten — ohne QA-Freigabe zu ersetzen.",
  scope: ["Option A: 1 Woche / 5 Spezifikationen / 2.500 € netto", "Option B: 2 Wochen / 10 Spezifikationen / 4.900 € netto", "QC-nahe CSV/XLSX plus Review-Handoff", "Open-Questions/Mapping-Liste für QC/ALM", "Prozess- und ROI-Empfehlung"],
  nextActions: ["Acun entscheidet Versandvariante: Nachricht, One-Pager, optional REG-Paket", "Tconsulting QC/ALM-Importfähigkeit prüfen lassen", "PDF/A-2a und Negativtestdaten fachlich bestätigen lassen", "Pilotpreis nur nach Acun-Freigabe nach außen nennen"],
};

export const tconsultingTestcaseDeliverables = [
  {
    label: "Markdown Review-Datei",
    path: "tconsulting-testfaelle/completed/tconsulting-testfaelle-fertig.md",
    detail: "Lesbare Übergabe mit beiden Testfällen, Steps, erwarteten Ergebnissen und Annahmen.",
  },
  {
    label: "QC Import CSV",
    path: "tconsulting-testfaelle/completed/tconsulting-testfaelle-fertig-qc-import.csv",
    detail: "23 Importzeilen: 2 Testfälle, jeweils Voraussetzungen plus Design Steps.",
  },
  {
    label: "QC Import XLSX",
    path: "tconsulting-testfaelle/completed/tconsulting-testfaelle-fertig-qc-import.xlsx",
    detail: "Excel-kompatibles Importpaket mit der QC-Vorlagenstruktur.",
  },
  {
    label: "Versandpaket ZIP",
    path: "tconsulting-testfaelle/completed/tconsulting-testfaelle-fertig-versandpaket.zip",
    detail: "Fertiges Paket für E-Mail-Versand, sobald Mail-Auth verfügbar ist.",
  },
  {
    label: "REG446/REG447 Expanded v2 Package",
    path: "taurus/reg446-reg447-2026-05-04/REG446_REG447_Tconsulting_QC_Aurus_expanded_v2_package.zip",
    detail: "13 review-sichere Testfälle / 68 Steps mit QC-CSV, XLSX, JSON, Prüfkriterien und Handoff; fachliche Freigabe und QC/ALM-Importtest offen.",
  },
  {
    label: "Internes Versandpaket v0.9",
    path: "tconsulting-versandpaket-v0.9-2026-05-05.zip",
    detail: "Bündelt Turgay-Draft, One-Pager, Open Questions, Pilotoptionen, Preisempfehlung und REG446/447 Expanded-v2-Paket; intern, nicht an Kunden senden.",
  },
  {
    label: "Customer-safe Demo-Paket",
    path: "tconsulting-customer-safe-demo-package-2026-05-05.zip",
    detail: "Kundentaugliches Demo-/Review-Paket ohne interne Preisempfehlung oder Checklisten; Versand trotzdem nur nach Acun-Freigabe.",
  },
];

export const tconsultingResearchItems = [
  "KI im Software Testing",
  "QA Automation Tools: Selenium, Cypress, API Testing",
  "Banking / Insurance / Automotive Testing Needs",
  "Testpyramide & moderne QA-Prozesse",
  "Lead- und Projektchancen für Tconsulting",
  "DSGVO-sichere KI-Automation in Kundenprojekten",
];

export const tconsultingWeeklyPlan = [
  ["Montag", "QA Discovery + Kundenprozesse", "Aurus / Romus"],
  ["Dienstag", "Testautomation Prototype", "Cornus"],
  ["Mittwoch", "Reporting + Lead Gen", "Maurus / Aurus"],
  ["Donnerstag", "Research + Tool Evaluation", "Romus"],
  ["Freitag", "KPI Review + nächste Prioritäten", "Aurus"],
];

export function tconsultingTaskHref(task: Pick<FileItem, "relativePath">) {
  return `/tconsulting/tasks/${detailSlug(task)}`;
}

export function tconsultingProjectHref(project: Pick<FileItem, "relativePath">) {
  return `/tconsulting/projects/${detailSlug(project)}`;
}

export function isTconsultingItem(item: FileItem) {
  return tconsultingKeywords.test(`${item.title} ${item.project ?? ""} ${item.owner ?? ""} ${item.assigned ?? ""} ${item.excerpt} ${item.relativePath}`);
}

export function getTconsultingTasks(data: MissionData) {
  return data.tasks.filter(isTconsultingItem);
}

export function getTconsultingProjects(data: MissionData) {
  return data.projects.filter(isTconsultingItem);
}

export function agentLiveTasks(agent: (typeof tconsultingAgents)[number], tasks: FileItem[], limit = 3) {
  return tasks.filter((task) => agent.keywords.test(`${task.title} ${task.project ?? ""} ${task.excerpt} ${task.relativePath}`)).slice(0, limit);
}
