import fs from "node:fs";
import path from "node:path";

export type TestForgePreset = "generic" | "tconsulting";

export type GenerateTestfallRunInput = {
  sourceText: string;
  projectName?: string;
  preset?: string;
  exportTargets?: string[];
  sourceName?: string;
  sourceKind?: "textarea" | "upload";
  templateText?: string;
  templateName?: string;
};

type TestStep = {
  step: number;
  action: string;
  expected: string;
};

type TestcaseVariant = "positive" | "negative" | "edge_regression" | "permission" | "integration_export";

type GeneratedTestcase = {
  id: string;
  title: string;
  variant: TestcaseVariant;
  category: string;
  priority: "High" | "Medium" | "Low";
  risk: "high" | "medium" | "low";
  preconditions: string[];
  test_data: string[];
  steps: TestStep[];
  expected_result: string;
  source_requirement: string;
  template_alignment?: string;
  quality?: TestcaseQuality;
};

type DomainProfile = "document_accessibility" | "access_security" | "export_reporting" | "integration" | "validation" | "business_process" | "core_flow";

type TestcaseQuality = {
  score: number;
  level: "strong" | "usable" | "needs_review";
  domain_profile: DomainProfile;
  checks: string[];
  warnings: string[];
};

type QualityStatus = "ready_for_review" | "review_required" | "missing_testcases" | "missing_exports";

const workspace = process.env.OPENCLAW_WORKSPACE ?? path.join(process.env.USERPROFILE ?? process.env.HOME ?? "C:\\Users\\openc", ".openclaw", "workspace");
const runsRoot = path.join(workspace, "testfall-pilot", "runs");
const requiredExports = ["testcases.json", "testcases.md", "testcases.csv", "testcases.xlsx", "review-summary.md", "review-package-manifest.json", "quality-report.json"];

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

function createStoreZip(zipPath: string, entries: { fileName: string; buffer: Buffer }[]) {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();

  for (const entry of entries) {
    const name = Buffer.from(entry.fileName, "utf8");
    const data = entry.buffer;
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    chunks.push(local, name, data);

    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0x0800, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(dosTime, 12);
    header.writeUInt16LE(dosDate, 14);
    header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(data.length, 20);
    header.writeUInt32LE(data.length, 24);
    header.writeUInt16LE(name.length, 28);
    header.writeUInt32LE(offset, 42);
    central.push(header, name);
    offset += local.length + name.length + data.length;
  }

  const centralSize = central.reduce((sum, chunk) => sum + chunk.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  fs.writeFileSync(zipPath, Buffer.concat([...chunks, ...central, end]));
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "run";
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
}

function splitRequirements(sourceText: string) {
  const cleaned = sourceText.replace(/\r\n/g, "\n").trim();
  const lines = cleaned.split("\n").map((line) => line.trim()).filter(Boolean);
  const candidates = new Map<string, string>();
  const addCandidate = (value: string) => {
    const normalized = value
      .replace(/^(?:[-*•]\s*)?(?:\d+[.)]\s*)?/, "")
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .replace(/\s+/g, " ")
      .trim();
    if (normalized.length < 14) return;
    const key = normalized.toLowerCase().slice(0, 180);
    if (!candidates.has(key)) candidates.set(key, normalized.slice(0, 900));
  };

  const explicit = lines
    .filter((line) => /^(?:[-*]\s*)?(?:REQ|AC|AK|FR|NFR|US|Story|Given|Wenn|Falls|Als\b|Der Nutzer|Die Nutzerin|Das System)/i.test(line) || /^\d+[.)]/.test(line))
    .map((line) => line.replace(/^(?:[-*]\s*)?(?:\d+[.)]\s*)?/, "").trim())
    .filter((line) => line.length > 12);

  for (const item of explicit) addCandidate(item);
  for (const line of lines) {
    if (/^\|.+\|$/.test(line)) addCandidate(line.split("|").map((cell) => cell.trim()).filter(Boolean).join(" · "));
    if (/[,;\t]/.test(line) && line.length > 24) addCandidate(line.split(/\t|;|,/).map((cell) => cell.trim()).filter(Boolean).join(" · "));
    if (/muss|soll|kann|darf|wenn|falls|validier|prüf|export|import|speicher|send|berechtig|rolle|status|fehler|pflicht|akzeptanz|expected|then|given/i.test(line)) addCandidate(line);
  }

  const paragraphs = cleaned.split(/\n\s*\n|(?<=[.!?])\s+(?=[A-ZÄÖÜ])/).map((item) => item.trim()).filter((item) => item.length > 24);
  for (const paragraph of paragraphs) addCandidate(paragraph);

  if (!candidates.size) addCandidate(cleaned);
  return Array.from(candidates.values()).slice(0, 40);
}

function shortRequirement(requirement: string) {
  return requirement.replace(/^(als|as a|user story:?)\s+/i, "").replace(/\s+/g, " ").slice(0, 92);
}

function inferCategory(requirement: string, preset: TestForgePreset) {
  const text = requirement.toLowerCase();
  if (/barrierefrei|accessibility|wcag|pdf\/a|pdf|serienbrief|formularvorlage|dms|dokument/.test(text)) return "Document Accessibility";
  if (/login|auth|rolle|berechtigung|permission|passwort/.test(text)) return "Access & Security";
  if (/export|csv|excel|xlsx|download|bericht|report/.test(text)) return "Export & Reporting";
  if (/api|schnittstelle|integration|import|sync/.test(text)) return "Integration";
  if (/zahlung|rechnung|angebot|kunde|crm/.test(text)) return preset === "tconsulting" ? "Consulting Workflow" : "Business Process";
  if (/fehler|validierung|pflicht|error|required/.test(text)) return "Validation";
  return "Core Flow";
}

function inferDomainProfile(requirement: string, preset: TestForgePreset): DomainProfile {
  const category = inferCategory(requirement, preset);
  if (category === "Document Accessibility") return "document_accessibility";
  if (category === "Access & Security") return "access_security";
  if (category === "Export & Reporting") return "export_reporting";
  if (category === "Integration") return "integration";
  if (category === "Validation") return "validation";
  if (category === "Business Process" || category === "Consulting Workflow") return "business_process";
  return "core_flow";
}

function inferRisk(requirement: string): GeneratedTestcase["risk"] {
  const text = requirement.toLowerCase();
  if (/barrierefrei|accessibility|wcag|pdf\/a|serienbrief|formularvorlage|dms/.test(text)) return "medium";
  if (/sicherheit|security|zahlung|payment|daten|privacy|kundendaten|kritisch|löschen|delete/.test(text)) return "high";
  if (/export|import|integration|rolle|berechtigung|frist|deadline|validierung/.test(text)) return "medium";
  return "low";
}

function extractTemplateHints(templateText: string) {
  const lines = templateText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const headerLine = lines.find((line) => /[,;|\t]/.test(line));
  const columns = headerLine?.split(/\t|;|,|\|/).map((column) => column.trim()).filter((column) => column.length > 1).slice(0, 24) ?? [];
  const preview = lines.slice(0, 6).join(" | ").replace(/\s+/g, " ").slice(0, 260);
  return { columns, preview };
}

function extractConcreteHints(requirement: string, templateHints?: ReturnType<typeof extractTemplateHints>) {
  const compact = requirement.replace(/\s+/g, " ").trim();
  const quoted = Array.from(compact.matchAll(/["“”'`„‚]([^"“”'`„‚]{3,80})["“”'`„‚]/g)).map((match) => match[1].trim());
  const ids = Array.from(compact.matchAll(/\b[A-ZÄÖÜ]{2,}[-_/]?[A-Z0-9ÄÖÜ]{1,}\b|\b\d{3,}\b/g)).map((match) => match[0]);
  const fields = Array.from(compact.matchAll(/\b(?:Feld|Spalte|Attribut|Status|Typ|Art|Rolle|User|Benutzer|Kunde|Dokument|Datei|Rechnung|Angebot|Auftrag|Projekt)\s*[:=\-]?\s*([A-ZÄÖÜa-zäöü0-9 _./-]{3,60})/g)).map((match) => match[0].trim());
  const emails = Array.from(compact.matchAll(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)).map((match) => match[0]);
  const dates = Array.from(compact.matchAll(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g)).map((match) => match[0]);
  const amounts = Array.from(compact.matchAll(/\b\d+(?:[.,]\d{2})?\s?(?:€|EUR|%|Stk\.|Tage|Wochen|Monate)\b/gi)).map((match) => match[0]);
  const statusWords = Array.from(compact.matchAll(/\b(?:offen|neu|aktiv|inaktiv|freigegeben|abgelehnt|storniert|bezahlt|gebucht|gesendet|importiert|exportiert|archiviert|fehlerhaft|gültig|ungültig)\b/gi)).map((match) => match[0]);
  const templateColumns = templateHints?.columns.slice(0, 8) ?? [];
  const data = Array.from(new Set([...quoted, ...fields, ...emails, ...dates, ...amounts, ...ids, ...statusWords])).slice(0, 8);
  return { data, templateColumns };
}

function makePreconditions(requirement: string, category: string, templateHints: ReturnType<typeof extractTemplateHints>) {
  const hints = extractConcreteHints(requirement, templateHints);
  const preconditions = [
    `${category}-Bereich ist in einer Review-/Testumgebung erreichbar`,
    `Ausgangszustand zur Anforderung vorbereitet: ${shortRequirement(requirement)}`,
  ];
  if (hints.templateColumns.length) preconditions.push(`Vorlage geladen; relevante Spalten: ${hints.templateColumns.join(", ")}`);
  else preconditions.push("Keine Vorlage geliefert; Struktur wird aus der Quelldatei abgeleitet");
  if (hints.data.length) preconditions.push(`Konkrete Referenzwerte aus der Quelle identifiziert: ${hints.data.slice(0, 5).join(", ")}`);
  return preconditions;
}

function makeTestData(requirement: string, variantSuffix: string, variant: TestcaseVariant, templateHints: ReturnType<typeof extractTemplateHints>) {
  const hints = extractConcreteHints(requirement, templateHints);
  const data = [`Variante: ${variantSuffix}`];
  if (hints.data.length) data.push(`Quellnahe Testdaten: ${hints.data.join(" | ")}`);
  else data.push(`Testdaten aus Anforderung ableiten: ${shortRequirement(requirement)}`);
  if (hints.templateColumns.length) data.push(`Zu befüllende Vorlagenspalten prüfen: ${hints.templateColumns.join(" | ")}`);
  if (variant === "negative") data.push("Negativdaten: Pflichtwert leer, ungültiges Format oder widersprüchlicher Status");
  if (variant === "edge_regression") data.push("Randdaten: Minimal-/Maximalwert, Sonderzeichen, Duplikat oder Wiederholung");
  if (variant === "permission") data.push("Rollendaten: berechtigte Rolle plus eingeschränkte Gegenrolle");
  if (variant === "integration_export") data.push("Export-/Folgedaten: erzeugte ID, Status, Datei/Report und Übergabezeitpunkt prüfen");
  return data;
}

function isDocumentAccessibilityRequirement(requirement: string) {
  return /barrierefrei|accessibility|wcag|pdf\/a|pdf|serienbrief|formularvorlage|dms|dokument/i.test(requirement);
}

function makeDocumentAccessibilitySteps(requirement: string, variant: TestcaseVariant): TestStep[] {
  const short = shortRequirement(requirement);
  if (variant === "negative") {
    return [
      { step: 1, action: "Im DMS eine nicht barrierefreie oder beschädigte Formularvorlage als Gegenprobe auswählen, z. B. ohne Tags, mit leerem Alternativtext oder falscher Lesereihenfolge.", expected: "Die Gegenprobe ist eindeutig als nicht barrierefrei prüfbar und vom positiven Referenzfall getrennt." },
      { step: 2, action: "Die Vorlage in einem Serienbrief verwenden und denselben Empfänger-/Datensatzkontext wie im positiven Fall wählen.", expected: "Der Serienbrief kann reproduzierbar mit identischem fachlichem Inhalt gestartet werden." },
      { step: 3, action: "Serienbrief erzeugen und als PDF ausgeben.", expected: "Das System erzeugt ein PDF oder meldet nachvollziehbar, warum die Vorlage nicht verarbeitet werden kann." },
      { step: 4, action: "PDF mit einem Accessibility-/PDF-Prüfwerkzeug gegen Tags, Überschriftenstruktur, Formularfelder, Tabellenstruktur und Lesereihenfolge prüfen.", expected: "Die Barrierefreiheitsmängel werden erkannt; das Ergebnis wird nicht fälschlich als vollständig barrierefrei bewertet." },
      { step: 5, action: "Prüfen, ob DMS-Metadaten, Dokumentenstatus und Ablage trotz fehlerhafter Vorlage korrekt nachvollziehbar bleiben.", expected: "Der Fehlerzustand ist dokumentiert; es entsteht keine unkontrollierte oder falsch freigegebene Dokumentversion." },
      { step: 6, action: "Die Vorlage korrigieren oder durch eine barrierefreie Referenzvorlage ersetzen und den Serienbrief erneut erzeugen.", expected: "Nach Korrektur entsteht ein prüfbares PDF ohne die zuvor festgestellten Accessibility-Mängel." },
      { step: 7, action: "Abweichung mit Vorlage, generiertem PDF, Prüfbericht und DMS-Dokument-ID dokumentieren.", expected: `Der Negativtest zu "${short}" ist fachlich nachvollziehbar und reproduzierbar.` },
    ];
  }
  if (variant === "edge_regression") {
    return [
      { step: 1, action: "Eine barrierefreie DMS-Formularvorlage mit mehreren Seiten, Überschriften, Tabellen, Formularfeldern und Sonderzeichen vorbereiten.", expected: "Die Vorlage enthält typische Randfälle, bleibt aber fachlich gültig." },
      { step: 2, action: "Serienbrief mit mehreren Empfängerdatensätzen erzeugen, darunter lange Namen, Umlaute, Sonderzeichen und leere optionale Felder.", expected: "Alle Datensätze werden verarbeitet; es kommt nicht zu Layoutabbrüchen oder abgeschnittenen Inhalten." },
      { step: 3, action: "Für mindestens zwei erzeugte PDFs Tags, Lesereihenfolge, Formularfeldnamen und Tabellenstruktur prüfen.", expected: "Die Barrierefreiheitsstruktur bleibt über alle Serienbriefvarianten hinweg erhalten." },
      { step: 4, action: "PDF-Metadaten, Spracheinstellung, Dokumenttitel und PDF/A- bzw. Accessibility-Konformität prüfen.", expected: "Metadaten und Konformitätsmerkmale bleiben korrekt gesetzt." },
      { step: 5, action: "Erzeugte Dokumente im DMS erneut öffnen, herunterladen und erneut prüfen.", expected: "Ablage, Download und erneute Prüfung verändern die Accessibility-Struktur nicht." },
      { step: 6, action: "Regression prüfen: dieselbe Vorlage für einen einfachen Standarddatensatz erneut ausführen.", expected: "Der Standardfall bleibt erfolgreich und wird nicht durch Randfalldaten beeinflusst." },
      { step: 7, action: "Prüfberichte und betroffene Serienbrief-Dokument-IDs im Testergebnis verlinken.", expected: "Der Randfall ist mit konkreten Nachweisen review-fähig dokumentiert." },
    ];
  }
  if (variant === "permission") {
    return [
      { step: 1, action: "Mit einer Rolle anmelden, die DMS-Formularvorlagen lesen und Serienbriefe erzeugen darf.", expected: "Die barrierefreie Formularvorlage ist sichtbar und kann für Serienbriefe ausgewählt werden." },
      { step: 2, action: "Serienbrief mit der barrierefreien Vorlage erzeugen und PDF im DMS ablegen.", expected: "Dokument wird erzeugt, gespeichert und bleibt der berechtigten Rolle zugänglich." },
      { step: 3, action: "Mit einer eingeschränkten Rolle anmelden, die keine Vorlagen ändern oder keine DMS-Dokumente exportieren darf.", expected: "Die eingeschränkte Rolle ist aktiv und besitzt weniger Rechte." },
      { step: 4, action: "Versuchen, die Formularvorlage zu ändern, Barrierefreiheitsmerkmale zu entfernen oder das PDF zu exportieren.", expected: "Unzulässige Änderungen/Exports werden verhindert oder eindeutig protokolliert." },
      { step: 5, action: "Direkten URL-/Dokumentenaufruf auf Vorlage und erzeugtes PDF versuchen.", expected: "Berechtigungen werden auch bei Direktaufruf angewendet." },
      { step: 6, action: "Mit berechtigter Rolle prüfen, ob Vorlage und erzeugtes PDF weiterhin unverändert barrierefrei sind.", expected: "Die Accessibility-Eigenschaften wurden durch unberechtigte Zugriffe nicht verändert." },
      { step: 7, action: "Rollen, Berechtigungsfehler und betroffene Dokument-IDs dokumentieren.", expected: "Die DMS-Berechtigungsprüfung ist vollständig nachvollziehbar." },
    ];
  }
  if (variant === "integration_export") {
    return [
      { step: 1, action: "Barrierefreie DMS-Formularvorlage im Serienbriefprozess auswählen und Empfängerdaten laden.", expected: "Vorlage und Datenquelle sind eindeutig ausgewählt." },
      { step: 2, action: "Serienbrief ausführen und PDF-Dokument erzeugen.", expected: "Das PDF wird erzeugt und erhält eine eindeutige Dokument-ID im DMS." },
      { step: 3, action: "PDF aus dem DMS herunterladen oder an den vorgesehenen Folgeprozess übergeben.", expected: "Download/Übergabe funktioniert ohne Dateibeschädigung." },
      { step: 4, action: "Heruntergeladenes/übergebenes PDF auf Tags, Lesereihenfolge, Formularfelder, Sprache und PDF-Konformität prüfen.", expected: "Die Accessibility-Merkmale bleiben auch nach DMS-Ablage und Export erhalten." },
      { step: 5, action: "Dokumentenmetadaten aus dem DMS mit PDF-Metadaten und Serienbriefdaten vergleichen.", expected: "Titel, Dokumenttyp, ID, Empfängerbezug und Status sind konsistent." },
      { step: 6, action: "Erzeugung/Export wiederholen und Versionierung bzw. Duplikatverhalten prüfen.", expected: "Keine ungewollten Duplikate; Versionen und Zeitstempel sind nachvollziehbar." },
      { step: 7, action: "DMS-ID, Exportdatei, Prüfbericht und Übergabeziel im Testergebnis dokumentieren.", expected: "Der Folgeprozess ist end-to-end nachweisbar." },
    ];
  }
  return [
    { step: 1, action: "Barrierefreie DMS-Formularvorlage im Testsystem öffnen und strukturelle Merkmale prüfen: Tags, Überschriften, Sprache, Lesereihenfolge und Formularfelder.", expected: "Die Vorlage ist im DMS verfügbar und besitzt die erwarteten Accessibility-Strukturmerkmale." },
    { step: 2, action: "Die Formularvorlage in einem Serienbrief auswählen und einen repräsentativen Empfänger-/Datensatz laden.", expected: "Der Serienbrief übernimmt Vorlage und Datenquelle ohne Warnungen oder Strukturverlust." },
    { step: 3, action: "Serienbrief erzeugen und als PDF speichern/ausgeben.", expected: "Das PDF wird erfolgreich erzeugt und im DMS oder Zielordner abgelegt." },
    { step: 4, action: "Generiertes PDF mit Accessibility-Prüfung öffnen und Tags, Überschriftenhierarchie, Lesereihenfolge, Formularfeldnamen und Alternativtexte prüfen.", expected: "Die Barrierefreiheitsinformationen aus der DMS-Formularvorlage bleiben im erzeugten PDF erhalten." },
    { step: 5, action: "PDF-Inhalte gegen Serienbriefdaten prüfen: Empfängerwerte, dynamische Felder, Pflichttexte und Dokumentlayout.", expected: "Alle Serienbriefdaten sind korrekt eingefügt, lesbar und vollständig." },
    { step: 6, action: "Dokument im DMS erneut öffnen, herunterladen und Accessibility-Prüfung wiederholen.", expected: "DMS-Ablage und Download verändern die Accessibility-Merkmale nicht." },
    { step: 7, action: "Testergebnis mit DMS-Dokument-ID, erzeugter PDF-Datei und Accessibility-Prüfbericht dokumentieren.", expected: `Die Anforderung "${short}" ist mit konkretem PDF-Nachweis review-fähig bestätigt.` },
  ];
}

function makeSteps(requirement: string, category: string, variant: TestcaseVariant): TestStep[] {
  const short = shortRequirement(requirement);
  if (isDocumentAccessibilityRequirement(requirement)) return makeDocumentAccessibilitySteps(requirement, variant);
  if (variant === "negative") {
    return [
      { step: 1, action: "Testumgebung öffnen und mit einer fachlich passenden Rolle anmelden.", expected: "Die Anwendung ist erreichbar, die Rolle ist aktiv und der Ausgangszustand ist eindeutig dokumentiert." },
      { step: 2, action: `Ausgangsdaten für die Anforderung \"${short}\" vorbereiten, dabei bewusst eine ungültige oder unvollständige Eingabe einplanen.`, expected: "Gültige Basisdaten sind vorhanden und der negative Testdatenanteil ist nachvollziehbar markiert." },
      { step: 3, action: "Den betroffenen Geschäftsprozess bis zum relevanten Eingabepunkt ausführen.", expected: "Das System zeigt den korrekten Prozessschritt und erlaubt die Prüfung der Validierung." },
      { step: 4, action: "Ungültige, fehlende oder fachlich widersprüchliche Werte eingeben.", expected: "Das System akzeptiert die Eingabe nicht stillschweigend und zeigt eine verständliche Validierung." },
      { step: 5, action: "Speichern, Fortfahren oder Export bewusst auslösen.", expected: "Der fehlerhafte Ablauf wird blockiert oder als Fehler gekennzeichnet; es entsteht kein falscher finaler Datensatz." },
      { step: 6, action: "Fehlermeldung, Feldmarkierung, Logik und weiterhin sichtbare Benutzereingaben prüfen.", expected: "Fehlerhinweise sind fachlich korrekt, reproduzierbar und die Eingaben bleiben für Korrektur nachvollziehbar." },
      { step: 7, action: "Eingabe korrigieren und den Schritt erneut ausführen.", expected: `Nach Korrektur läuft der ${category}-Ablauf erfolgreich weiter und die vorherige Validierung ist nicht mehr aktiv.` },
    ];
  }
  if (variant === "edge_regression") {
    return [
      { step: 1, action: "Testumgebung öffnen, Rolle anmelden und einen bereits bestehenden Referenzdatensatz identifizieren.", expected: "Referenzdaten sind sichtbar und können vor/nach der Ausführung verglichen werden." },
      { step: 2, action: `Für \"${short}\" einen Randfall vorbereiten, z. B. Maximalwert, Minimalwert, Sonderzeichen, leere optionale Felder oder Wiederholung.`, expected: "Der Randfall ist eindeutig dokumentiert und fachlich plausibel." },
      { step: 3, action: "Den Hauptprozess mit dem Randfall ausführen.", expected: "Der Prozess bleibt stabil; keine technischen Fehler oder UI-Abbrüche treten auf." },
      { step: 4, action: "Zwischenergebnisse, Pflichtfelder, Statuswechsel und automatische Berechnungen prüfen.", expected: "Alle Zwischenergebnisse entsprechen der Anforderung und bleiben konsistent." },
      { step: 5, action: "Den Vorgang speichern, erneut öffnen und mit dem Referenzdatensatz vergleichen.", expected: "Gespeicherte Werte bleiben unverändert korrekt und sind nach erneutem Öffnen vollständig nachvollziehbar." },
      { step: 6, action: "Falls vorhanden Export, Bericht, Schnittstelle oder Folgeprozess auslösen.", expected: "Nachgelagerte Artefakte enthalten die Randfalldaten korrekt und ohne Formatverlust." },
      { step: 7, action: "Regression prüfen: angrenzende Standardfunktion mit normalen Daten erneut ausführen.", expected: `Die Standardfunktion im Bereich ${category} ist durch den Randfall nicht beeinträchtigt.` },
    ];
  }
  if (variant === "permission") {
    return [
      { step: 1, action: "Testumgebung öffnen und mit einer berechtigten Referenzrolle anmelden.", expected: "Die berechtigte Rolle hat Zugriff auf den relevanten Bereich und der Ausgangszustand ist dokumentiert." },
      { step: 2, action: `Für \"${short}\" einen Datensatz oder Prozesszustand vorbereiten, der rollenabhängig sichtbar oder änderbar sein soll.`, expected: "Der fachliche Kontext ist vorhanden und eindeutig einer Berechtigungsprüfung zuordenbar." },
      { step: 3, action: "Den Ablauf mit der berechtigten Rolle vollständig ausführen.", expected: "Die Aktion ist erlaubt und führt zum erwarteten fachlichen Ergebnis." },
      { step: 4, action: "Abmelden und mit einer eingeschränkten oder fachlich unpassenden Rolle erneut anmelden.", expected: "Die eingeschränkte Rolle ist aktiv und besitzt nicht dieselben Rechte wie die Referenzrolle." },
      { step: 5, action: "Denselben Bereich, Datensatz oder Prozessschritt aufrufen.", expected: "Das System verhindert unzulässigen Zugriff oder blendet nicht erlaubte Funktionen nachvollziehbar aus." },
      { step: 6, action: "Direkten Aufruf, erneutes Speichern oder technische Umgehung über URL/Reload versuchen.", expected: "Auch direkte oder wiederholte Aufrufe umgehen die Berechtigung nicht." },
      { step: 7, action: "Berechtigungsprüfung dokumentieren und betroffene Rollen/Statuswerte notieren.", expected: `Die Berechtigungslogik für ${category} ist review-fähig dokumentiert.` },
    ];
  }
  if (variant === "integration_export") {
    return [
      { step: 1, action: "Testumgebung öffnen und relevante Ausgangsdaten für Export, Import, Bericht oder Folgeprozess vorbereiten.", expected: "Alle benötigten Daten sind vorhanden und eindeutig dem Testfall zuordenbar." },
      { step: 2, action: `Den fachlichen Ablauf für \"${short}\" bis zum Abschluss ausführen.`, expected: "Der Hauptprozess endet erfolgreich und erzeugt einen prüfbaren Zielzustand." },
      { step: 3, action: "Nachgelagerte Funktion auslösen, z. B. Export, Download, Bericht, Schnittstelle, Benachrichtigung oder Statusübergabe.", expected: "Das nachgelagerte Artefakt bzw. der Folgeprozess wird erzeugt oder gestartet." },
      { step: 4, action: "Inhalt des Artefakts oder Folgeprozesses gegen die Eingabedaten prüfen.", expected: "Alle relevanten Felder, Werte, Formate und IDs stimmen mit dem fachlichen Vorgang überein." },
      { step: 5, action: "Sonderzeichen, leere optionale Felder und längere Werte im Artefakt prüfen.", expected: "Formatierung und Daten bleiben vollständig, lesbar und ohne abgeschnittene Inhalte erhalten." },
      { step: 6, action: "Den Vorgang erneut ausführen oder aktualisieren.", expected: "Es entstehen keine unerwünschten Duplikate; Versionierung, Zeitstempel oder Status sind nachvollziehbar." },
      { step: 7, action: "Ablageort, Download, Importfähigkeit oder Übergabeprotokoll dokumentieren.", expected: `Der ${category}-Folgeprozess ist nachvollziehbar, reproduzierbar und review-fähig.` },
    ];
  }
  return [
    { step: 1, action: "Testumgebung öffnen und mit einer fachlich passenden Rolle anmelden.", expected: "Die Anwendung ist erreichbar, die Rolle ist aktiv und es werden keine technischen Fehler angezeigt." },
    { step: 2, action: `Ausgangssituation für \"${short}\" herstellen: benötigte Daten, Status und Berechtigungen vorbereiten.`, expected: "Alle Vorbedingungen sind erfüllt, die relevanten UI-Elemente oder Schnittstellen sind verfügbar." },
    { step: 3, action: "Den fachlichen Hauptablauf starten und die erste relevante Eingabe ausführen.", expected: "Das System übernimmt die Eingabe und zeigt einen nachvollziehbaren nächsten Prozesszustand." },
    { step: 4, action: "Alle weiteren Pflichtangaben und fachlichen Werte gemäß Anforderung erfassen.", expected: "Pflichtfelder, Auswahlwerte und abhängige Felder verhalten sich konsistent zur Spezifikation." },
    { step: 5, action: "Den Ablauf abschließen, speichern, bestätigen oder ausführen.", expected: "Der Vorgang wird erfolgreich abgeschlossen und eine eindeutige Bestätigung bzw. ein Zielstatus wird angezeigt." },
    { step: 6, action: "Ergebnisdaten, Status, Folgeaktionen und gespeicherte Informationen prüfen.", expected: `Das erwartete Ergebnis für ${category} ist sichtbar, korrekt gespeichert und für Review nachvollziehbar.` },
    { step: 7, action: "Run abschließend dokumentieren: Testdaten, Screenshots/Belege und Abweichungen erfassen.", expected: "Der Testfall ist review-fähig dokumentiert; offene Punkte sind klar markiert statt erfunden." },
  ];
}

function evaluateTestcaseQuality(testcase: Omit<GeneratedTestcase, "quality">, domainProfile: DomainProfile): TestcaseQuality {
  const warnings: string[] = [];
  const checks: string[] = [];
  const allText = [
    testcase.title,
    testcase.preconditions.join("\n"),
    testcase.test_data.join("\n"),
    testcase.steps.map((step) => `${step.action} ${step.expected}`).join("\n"),
    testcase.expected_result,
  ].join("\n");

  let score = 100;
  const stepCount = testcase.steps.length;
  if (stepCount >= 7) checks.push("7+ fachliche Schritte vorhanden");
  else {
    warnings.push("Zu wenige Schritte für einen review-starken Testfall");
    score -= 18;
  }

  const expectedPerStep = testcase.steps.every((step) => step.expected.trim().length > 24);
  if (expectedPerStep) checks.push("Jeder Schritt hat ein erwartetes Ergebnis");
  else {
    warnings.push("Mindestens ein Schritt hat kein ausreichend konkretes erwartetes Ergebnis");
    score -= 18;
  }

  if (testcase.source_requirement.length > 20) checks.push("Quellanforderung ist referenziert");
  else {
    warnings.push("Quellanforderung fehlt oder ist zu kurz");
    score -= 12;
  }

  const genericPhrases = [
    "konkrete kundendaten im review ergänzen",
    "eindeutige test-id je ausführung verwenden",
    "benötigte testrolle und basisdaten sind angelegt",
  ];
  const genericHits = genericPhrases.filter((phrase) => allText.toLowerCase().includes(phrase));
  if (!genericHits.length) checks.push("Keine alten generischen Platzhalter erkannt");
  else {
    warnings.push(`Generische Platzhalter erkannt: ${genericHits.join(", ")}`);
    score -= 25;
  }

  const concreteSignals = (allText.match(/\b(?:DMS|PDF|PDF\/A|WCAG|Tags|Lesereihenfolge|Formularfeld|Dokument-ID|Export|Import|Rolle|Status|Pflichtfeld|Metadaten|Download|Prüfbericht)\b/gi) ?? []).length;
  if (concreteSignals >= 3) checks.push("Konkrete fachliche Prüfsignale vorhanden");
  else {
    warnings.push("Zu wenige konkrete fachliche Prüfsignale; Testfall braucht wahrscheinlich Domänenanreicherung oder KI-Modus");
    score -= 20;
  }

  if (domainProfile === "document_accessibility") {
    const required = ["PDF", "DMS", "Lesereihenfolge", "Tags"];
    const missing = required.filter((term) => !allText.toLowerCase().includes(term.toLowerCase()));
    if (!missing.length) checks.push("Document-Accessibility-Pflichtprüfungen enthalten");
    else {
      warnings.push(`Document-Accessibility-Prüfungen fehlen: ${missing.join(", ")}`);
      score -= missing.length * 8;
    }
  }

  const normalizedScore = Math.max(0, Math.min(100, score));
  return {
    score: normalizedScore,
    level: normalizedScore >= 82 ? "strong" : normalizedScore >= 65 ? "usable" : "needs_review",
    domain_profile: domainProfile,
    checks,
    warnings,
  };
}

function buildTestcases(requirements: string[], preset: TestForgePreset, templateText = ""): GeneratedTestcase[] {
  const templateHints = extractTemplateHints(templateText);
  const variants: Array<{ variant: TestcaseVariant; label: string; suffix: string }> = [
    { variant: "positive", label: "Positivfall", suffix: "erfolgreicher Standardablauf" },
    { variant: "negative", label: "Negativ-/Validierungsfall", suffix: "fehlerhafte oder unvollständige Eingaben" },
    { variant: "edge_regression", label: "Randfall/Regression", suffix: "Grenzwerte und Folgeprozess" },
    { variant: "permission", label: "Berechtigungsfall", suffix: "Rollen, Rechte und Zugriffsschutz" },
    { variant: "integration_export", label: "Export-/Folgeprozessfall", suffix: "Download, Schnittstelle, Bericht oder Übergabe" },
  ];

  return requirements.flatMap((requirement, requirementIndex) => {
    const baseRisk = inferRisk(requirement);
    const category = inferCategory(requirement, preset);
    const domainProfile = inferDomainProfile(requirement, preset);
    return variants.map((variantConfig, variantIndex) => {
      const risk = variantConfig.variant === "negative" && baseRisk === "low" ? "medium" : baseRisk;
      const testcaseWithoutQuality: Omit<GeneratedTestcase, "quality"> = {
        id: `TF-${String(requirementIndex + 1).padStart(3, "0")}-${String(variantIndex + 1).padStart(2, "0")}`,
        title: `${category}: ${variantConfig.label} · ${shortRequirement(requirement)}`,
        variant: variantConfig.variant,
        category,
        priority: risk === "high" ? "High" : risk === "medium" ? "Medium" : "Low",
        risk,
        preconditions: makePreconditions(requirement, category, templateHints),
        test_data: makeTestData(requirement, variantConfig.suffix, variantConfig.variant, templateHints),
        steps: makeSteps(requirement, category, variantConfig.variant),
        expected_result: `${variantConfig.label}: Fachliches Ergebnis entspricht der Anforderung; Abweichungen sind reproduzierbar dokumentiert und nach Vorlage reviewbar.`,
        source_requirement: requirement,
        template_alignment: templateHints.columns.length ? `Ausgabe orientiert an Vorlagenspalten: ${templateHints.columns.join(", ")}` : templateHints.preview ? `Vorlagenhinweis: ${templateHints.preview}` : undefined,
      };
      return { ...testcaseWithoutQuality, quality: evaluateTestcaseQuality(testcaseWithoutQuality, domainProfile) } satisfies GeneratedTestcase;
    });
  });
}

function findOpenQuestions(sourceText: string, requirements: string[]) {
  const lower = sourceText.toLowerCase();
  const questions = new Set<string>();
  if (!/(rolle|user|nutzer|admin|berechtigung)/.test(lower)) questions.add("Welche Nutzerrolle(n) sollen die Testfälle abdecken?");
  if (!/(vorbedingung|given|voraussetzung|testdaten|daten)/.test(lower)) questions.add("Welche Vorbedingungen und Testdaten sind verbindlich?");
  if (!/(erwartet|expected|akzeptanz|akzeptanzkriter|dann|then)/.test(lower)) questions.add("Welche erwarteten Ergebnisse gelten als Abnahmekriterium?");
  if (requirements.length < 2) questions.add("Gibt es weitere fachliche Varianten oder Negativfälle, die ergänzt werden sollen?");
  return Array.from(questions);
}

function csvCell(value: unknown) {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function xmlEscape(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function columnName(index: number) {
  let name = "";
  let current = index + 1;
  while (current > 0) {
    const modulo = (current - 1) % 26;
    name = String.fromCharCode(65 + modulo) + name;
    current = Math.floor((current - modulo) / 26);
  }
  return name;
}

function writeXlsx(filePath: string, testcases: GeneratedTestcase[]) {
  const rows = [
    ["Testfall-ID", "Testfall-Titel", "Variante", "Kategorie", "Priorität", "Risiko", "Quality Score", "Quality Level", "Domain Profile", "Quality Warnungen", "Vorbedingungen", "Testdaten", "Step-Nr", "Aktion", "Erwartetes Ergebnis je Step", "Gesamterwartung", "Quellanforderung", "Vorlagenbezug"],
    ...testcases.flatMap((testcase) => testcase.steps.map((step, stepIndex) => [
      stepIndex === 0 ? testcase.id : "",
      stepIndex === 0 ? testcase.title : "",
      stepIndex === 0 ? testcase.variant : "",
      stepIndex === 0 ? testcase.category : "",
      stepIndex === 0 ? testcase.priority : "",
      stepIndex === 0 ? testcase.risk : "",
      stepIndex === 0 ? testcase.quality?.score ?? "" : "",
      stepIndex === 0 ? testcase.quality?.level ?? "" : "",
      stepIndex === 0 ? testcase.quality?.domain_profile ?? "" : "",
      stepIndex === 0 ? testcase.quality?.warnings.join("\n") ?? "" : "",
      stepIndex === 0 ? testcase.preconditions.join("\n") : "",
      stepIndex === 0 ? testcase.test_data.join("\n") : "",
      step.step,
      step.action,
      step.expected,
      stepIndex === 0 ? testcase.expected_result : "",
      stepIndex === 0 ? testcase.source_requirement : "",
      stepIndex === 0 ? testcase.template_alignment ?? "" : "",
    ])),
  ];
  const sheetRows = rows.map((row, rowIndex) => {
    const cells = row.map((cell, cellIndex) => `<c r="${columnName(cellIndex)}${rowIndex + 1}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(cell)}</t></is></c>`).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");

  const entries = [
    { fileName: "[Content_Types].xml", buffer: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`) },
    { fileName: "_rels/.rels", buffer: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`) },
    { fileName: "docProps/core.xml", buffer: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>TestForge Testfälle</dc:title><dc:creator>TestForge</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created></cp:coreProperties>`) },
    { fileName: "docProps/app.xml", buffer: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>TestForge</Application></Properties>`) },
    { fileName: "xl/workbook.xml", buffer: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Testfaelle" sheetId="1" r:id="rId1"/></sheets></workbook>`) },
    { fileName: "xl/_rels/workbook.xml.rels", buffer: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`) },
    { fileName: "xl/worksheets/sheet1.xml", buffer: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`) },
  ];
  createStoreZip(filePath, entries);
}

function toCsv(testcases: GeneratedTestcase[]) {
  const header = ["id", "title", "variant", "category", "priority", "risk", "quality_score", "quality_level", "domain_profile", "quality_warnings", "preconditions", "test_data", "steps", "expected_result", "source_requirement", "template_alignment"];
  const rows = testcases.map((testcase) => [
    testcase.id,
    testcase.title,
    testcase.variant,
    testcase.category,
    testcase.priority,
    testcase.risk,
    testcase.quality?.score ?? "",
    testcase.quality?.level ?? "",
    testcase.quality?.domain_profile ?? "",
    testcase.quality?.warnings.join(" | ") ?? "",
    testcase.preconditions,
    testcase.test_data,
    testcase.steps.map((step) => `${step.step}. ${step.action} => ${step.expected}`).join("\n"),
    testcase.expected_result,
    testcase.source_requirement,
    testcase.template_alignment ?? "",
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
}

function toMarkdown(project: string, testcases: GeneratedTestcase[], openQuestions: string[]) {
  const body = testcases.map((testcase) => [
    `## ${testcase.id} · ${testcase.title}`,
    `- Variante: ${testcase.variant}`,
    `- Kategorie: ${testcase.category}`,
    `- Priorität: ${testcase.priority}`,
    `- Risiko: ${testcase.risk}`,
    `- Quality: ${testcase.quality?.level ?? "n/a"} (${testcase.quality?.score ?? "n/a"}/100)`,
    ...(testcase.quality?.warnings.length ? [`- Quality-Warnungen: ${testcase.quality.warnings.join("; ")}`] : []),
    `- Quelle: ${testcase.source_requirement}`,
    ...(testcase.template_alignment ? [`- Vorlagenbezug: ${testcase.template_alignment}`] : []),
    "",
    "### Schritte",
    ...testcase.steps.map((step) => `${step.step}. **Aktion:** ${step.action}\n   **Erwartet:** ${step.expected}`),
    "",
    `**Gesamterwartung:** ${testcase.expected_result}`,
  ].join("\n")).join("\n\n");

  const questions = openQuestions.length ? openQuestions.map((question) => `- ${question}`).join("\n") : "- Keine offenen Fragen erkannt.";
  return `# Testfälle · ${project}\n\n${body}\n\n# Offene Fragen\n\n${questions}\n`;
}

function templateMetadata(templateText: string | undefined, templateName: string | undefined) {
  const text = templateText?.trim() ?? "";
  return text ? { provided: true, name: templateName || "template-context.txt", bytes: Buffer.byteLength(text, "utf8"), preview: text.replace(/\s+/g, " ").slice(0, 240) } : { provided: false };
}

function buildQuality(testcases: GeneratedTestcase[], openQuestions: string[], missingExports: string[]) {
  const testcaseCount = testcases.length;
  const stepCount = testcases.reduce((sum, testcase) => sum + testcase.steps.length, 0);
  const averageTestcaseQuality = testcaseCount ? Math.round(testcases.reduce((sum, testcase) => sum + (testcase.quality?.score ?? 0), 0) / testcaseCount) : 0;
  const weakTestcases = testcases.filter((testcase) => testcase.quality?.level === "needs_review").map((testcase) => testcase.id);
  const issues = [
    ...(testcaseCount === 0 ? ["Keine Testfälle erzeugt"] : []),
    ...(stepCount < testcaseCount * 3 ? ["Zu wenige konkrete Steps"] : []),
    ...(averageTestcaseQuality < 70 ? [`Durchschnittliche Testfallqualität zu niedrig: ${averageTestcaseQuality}/100`] : []),
    ...(weakTestcases.length ? [`Testfälle mit Review-Bedarf: ${weakTestcases.slice(0, 12).join(", ")}`] : []),
    ...(openQuestions.length ? [`${openQuestions.length} offene Review-Frage(n)`] : []),
    ...(missingExports.length ? [`Fehlende Exporte: ${missingExports.join(", ")}`] : []),
  ];
  const status: QualityStatus = testcaseCount === 0 ? "missing_testcases" : missingExports.length ? "missing_exports" : openQuestions.length ? "review_required" : "ready_for_review";
  const score = Math.max(0, Math.min(100, Math.round((averageTestcaseQuality || 75) - openQuestions.length * 8 - missingExports.length * 18 - (testcaseCount < 2 ? 10 : 0))));
  return { status, score, testcase_count: testcaseCount, step_count: stepCount, average_testcase_quality: averageTestcaseQuality, weak_testcases: weakTestcases, open_questions_count: openQuestions.length, missing_exports: missingExports, issues };
}

export function generateTestfallRun(input: GenerateTestfallRunInput) {
  const sourceText = input.sourceText.trim();
  if (sourceText.length < 20) throw new Error("Bitte mindestens 20 Zeichen Spezifikation eingeben.");

  const project = (input.projectName?.trim() || "TestForge MVP Run").slice(0, 120);
  const preset: TestForgePreset = input.preset === "tconsulting" ? "tconsulting" : "generic";
  const selectedExports = input.exportTargets?.length ? input.exportTargets : ["json", "markdown", "csv", "manifest"];
  const sourceName = (input.sourceName?.trim() || (input.sourceKind === "upload" ? "uploaded-source.txt" : "manual-form")).slice(0, 140);
  const sourceKind = input.sourceKind === "upload" ? "upload" : "textarea";
  const templateText = input.templateText?.trim() ?? "";
  const templateName = input.templateName?.trim() || (templateText ? "template-context.txt" : undefined);
  const template = templateMetadata(templateText, templateName);
  const runId = `${timestamp()}-testforge-${slugify(project)}`;
  const runDir = path.join(runsRoot, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const requirements = splitRequirements(sourceText);
  const testcases = buildTestcases(requirements, preset, templateText);
  const openQuestions = findOpenQuestions(sourceText, requirements);
  const createdAt = new Date().toISOString();
  const summary = {
    preset,
    testcase_count: testcases.length,
    step_count: testcases.reduce((sum, testcase) => sum + testcase.steps.length, 0),
    open_questions_count: openQuestions.length,
    risk_level: testcases.some((testcase) => testcase.risk === "high") ? "high" : testcases.some((testcase) => testcase.risk === "medium") ? "medium" : "low",
  };

  fs.writeFileSync(path.join(runDir, "source-input.txt"), sourceText, "utf8");
  if (templateText) fs.writeFileSync(path.join(runDir, "template-context.txt"), templateText, "utf8");

  const testcasesPayload = { project, run_id: runId, created_at: createdAt, generator: "testforge-local-mvp", source: { kind: sourceKind, name: sourceName }, template, export_targets: selectedExports, summary, testcases, open_questions: openQuestions };
  fs.writeFileSync(path.join(runDir, "testcases.json"), JSON.stringify(testcasesPayload, null, 2), "utf8");
  fs.writeFileSync(path.join(runDir, "testcases.md"), toMarkdown(project, testcases, openQuestions), "utf8");
  fs.writeFileSync(path.join(runDir, "testcases.csv"), toCsv(testcases), "utf8");
  writeXlsx(path.join(runDir, "testcases.xlsx"), testcases);

  fs.writeFileSync(path.join(runDir, "review-summary.md"), "", "utf8");
  fs.writeFileSync(path.join(runDir, "quality-report.json"), "{}\n", "utf8");
  const missingExports = requiredExports.filter((file) => file !== "review-package-manifest.json" && !fs.existsSync(path.join(runDir, file)));
  const quality = buildQuality(testcases, openQuestions, missingExports);
  const reviewSummary = [
    `# Review Summary · ${project}`,
    "",
    `- Run: ${runId}`,
    `- Preset: ${preset}`,
    `- Quelle: ${sourceKind === "upload" ? `Upload ${sourceName}` : "Textarea"}`,
    `- Vorlage: ${template.provided ? `${template.name} (${template.bytes} bytes)` : "keine"}`,
    `- Quality: ${quality.status} (${quality.score}/100)`,
    `- Durchschnittliche Testfallqualität: ${quality.average_testcase_quality}/100`,
    `- Testfälle mit Review-Bedarf: ${quality.weak_testcases.length ? quality.weak_testcases.join(", ") : "keine"}`,
    `- Testfälle: ${quality.testcase_count}`,
    `- Steps: ${quality.step_count}`,
    `- Offene Fragen: ${quality.open_questions_count}`,
    "",
    "## Review-Hinweise",
    ...(quality.issues.length ? quality.issues.map((issue) => `- ${issue}`) : ["- Keine blockierenden MVP-Hinweise erkannt."]),
    ...(template.provided ? ["", "## Vorlagen-Kontext", `- Datei: ${template.name}`, `- Preview: ${template.preview}`] : []),
  ].join("\n");
  fs.writeFileSync(path.join(runDir, "review-summary.md"), `${reviewSummary}\n`, "utf8");

  const manifest = {
    run_id: runId,
    project,
    created_at: createdAt,
    generator: "testforge-local-mvp",
    preset,
    local_only: true,
    external_calls: false,
    source: { kind: sourceKind, name: sourceName, artifact: "source-input.txt" },
    template,
    export_targets: selectedExports,
    artifacts: [...requiredExports, "source-input.txt", ...(templateText ? ["template-context.txt"] : []), "review-package.zip"],
    quality,
  };
  fs.writeFileSync(path.join(runDir, "quality-report.json"), JSON.stringify(quality, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(runDir, "review-package-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  const packageFiles = [...requiredExports, "source-input.txt", ...(templateText ? ["template-context.txt"] : [])]
    .filter((fileName) => fs.existsSync(path.join(runDir, fileName)))
    .map((fileName) => ({ fileName, buffer: fs.readFileSync(path.join(runDir, fileName)) }));
  createStoreZip(path.join(runDir, "review-package.zip"), packageFiles);

  return { runId, runDir, manifest };
}
