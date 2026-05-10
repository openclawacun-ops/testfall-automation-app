"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { inflateRawSync } from "node:zlib";
import { deleteScheduledCalendarLine, detailSlug, getWorkspaceItemDetail, packageTestfallPilotSource, scheduleCalendarItem, updateWorkspaceMarkdownStatus, writeWorkspaceMarkdown } from "@/lib/openclaw-data";
import { generateTestfallRun } from "@/lib/testfall-generator";
import type { WorkspaceKind } from "@/lib/openclaw-data";

const workspace = process.env.OPENCLAW_WORKSPACE ?? path.join(process.env.USERPROFILE ?? process.env.HOME ?? "C:\\Users\\openc", ".openclaw", "workspace");

function revalidateMissionControl() {
  for (const route of ["/", "/tasks", "/projects", "/calendar", "/memory", "/docs", "/team", "/tconsulting", "/tconsulting/testfall-pilot", "/taurus"]) revalidatePath(route);
}

const mvpTextExtensions = new Set([".txt", ".md", ".csv", ".json"]);
const mvpUploadExtensions = new Set([...mvpTextExtensions, ".docx", ".xlsx"]);

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function readZipEntries(buffer: Buffer) {
  const entries = new Map<string, Buffer>();
  let offset = 0;
  while (offset + 30 <= buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature !== 0x04034b50) break;
    const compression = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const name = buffer.subarray(nameStart, nameStart + nameLength).toString("utf8");
    const data = buffer.subarray(dataStart, dataStart + compressedSize);
    if (compression === 0) entries.set(name, data);
    else if (compression === 8) entries.set(name, inflateRawSync(data));
    else throw new Error(`ZIP-Komprimierung ${compression} wird noch nicht unterstützt.`);
    offset = dataStart + compressedSize;
  }
  return entries;
}

function docxBufferToText(buffer: Buffer) {
  const documentXml = readZipEntries(buffer).get("word/document.xml");
  if (!documentXml) throw new Error("DOCX konnte nicht gelesen werden: word/document.xml fehlt.");
  return decodeXmlEntities(documentXml.toString("utf8")
    .replace(/<w:(?:p|br|cr)[^>]*>/g, "\n")
    .replace(/<w:tab[^>]*>/g, "\t")
    .replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function xmlText(value: string) {
  return decodeXmlEntities(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function xlsxBufferToText(buffer: Buffer) {
  const entries = readZipEntries(buffer);
  const sharedStringsXml = entries.get("xl/sharedStrings.xml")?.toString("utf8") ?? "";
  const sharedStrings = Array.from(sharedStringsXml.matchAll(/<si[\s\S]*?<\/si>/g)).map((match) => xmlText(match[0]));
  const worksheets = Array.from(entries.entries())
    .filter(([name]) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
    .sort(([a], [b]) => a.localeCompare(b));

  const rows: string[] = [];
  for (const [sheetName, sheetBuffer] of worksheets) {
    const sheetRows = Array.from(sheetBuffer.toString("utf8").matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g));
    if (!sheetRows.length) continue;
    rows.push(`# ${sheetName.replace(/^xl\/worksheets\//, "").replace(/\.xml$/, "")}`);
    for (const row of sheetRows) {
      const cells = Array.from(row[1].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)).map((cell) => {
        const attrs = cell[1];
        const body = cell[2];
        const value = body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? body.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1] ?? "";
        if (/t="s"/.test(attrs)) return sharedStrings[Number(value)] ?? value;
        return decodeXmlEntities(value).trim();
      }).filter(Boolean);
      if (cells.length) rows.push(cells.join(" | "));
    }
    rows.push("");
  }
  const text = rows.join("\n").trim();
  if (!text) throw new Error("XLSX konnte gelesen werden, enthält aber keine extrahierbaren Tabellenwerte.");
  return text;
}

async function fileToText(file: File | null, fallback = "") {
  if (!file || file.size === 0) return fallback;
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name).toLowerCase();
  if (extension === ".docx") return docxBufferToText(buffer);
  if (extension === ".xlsx") return xlsxBufferToText(buffer);
  return buffer.toString("utf8").replace(/^\uFEFF/, "");
}

async function mvpUploadToText(file: File | null, label: string) {
  if (!file || file.size === 0) return { text: "", name: "" };
  const extension = path.extname(file.name).toLowerCase();
  if (!mvpUploadExtensions.has(extension)) {
    throw new Error(`${label}: Dateityp ${extension || "ohne Endung"} wird im MVP nicht unterstützt. Erlaubt sind .txt, .md, .csv, .json, .docx und .xlsx.`);
  }
  return { text: (await fileToText(file)).trim(), name: file.name };
}

function redirectGeneratorError(message: string) {
  redirect(`/testfall-automation/generator?error=${encodeURIComponent(message)}`);
}

function safeTestfallRunDir(runId: string) {
  if (!/^[\w.-]+$/.test(runId)) return null;
  const runsRoot = path.join(workspace, "testfall-pilot", "runs");
  const resolved = path.resolve(runsRoot, runId);
  const root = path.resolve(runsRoot);
  return resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
}

function readRunJson(runDir: string, fileName: string) {
  try {
    return JSON.parse(fs.readFileSync(path.join(runDir, fileName), "utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function sanitizeEmailFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]+/g, "_").slice(0, 80) || "testforge-email";
}

function mimeBoundary() {
  return `----TestForgeBoundary${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) return;
  writeWorkspaceMarkdown("tasks", title, body);
  revalidateMissionControl();
}

export async function createProject(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) return;
  writeWorkspaceMarkdown("projects", title, body);
  revalidateMissionControl();
}

export async function updateItemStatus(formData: FormData) {
  const kind = String(formData.get("kind") ?? "") as WorkspaceKind;
  const relativePath = String(formData.get("relativePath") ?? "");
  const status = String(formData.get("status") ?? "");
  if (kind !== "tasks" && kind !== "projects") return;
  updateWorkspaceMarkdownStatus(kind, relativePath, status);
  revalidateMissionControl();

  const updated = getWorkspaceItemDetail(kind, detailSlug({ relativePath }));
  if (updated) revalidatePath(`/${kind}/${detailSlug(updated)}`);
}

export async function scheduleUnplannedCalendarItem(formData: FormData) {
  const sourceRelativePath = String(formData.get("sourceRelativePath") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const day = Number(formData.get("day") ?? "");
  const start = String(formData.get("start") ?? "").trim();
  const end = String(formData.get("end") ?? "").trim();
  if (!sourceRelativePath || !title || !Number.isInteger(day) || !start || !end) return;
  scheduleCalendarItem(sourceRelativePath, title, day, start, end);
  revalidateMissionControl();
}

export async function deleteScheduledCalendarItem(formData: FormData) {
  const sourceRelativePath = String(formData.get("sourceRelativePath") ?? "").trim();
  const lineIndex = Number(formData.get("lineIndex") ?? "");
  if (!sourceRelativePath || !Number.isInteger(lineIndex)) return;
  deleteScheduledCalendarLine(sourceRelativePath, lineIndex);
  revalidateMissionControl();
}

export async function packageTestfallPilot(formData: FormData) {
  const sourceFile = String(formData.get("sourceFile") ?? "").trim();
  const allLatest = String(formData.get("allLatest") ?? "") === "true";
  packageTestfallPilotSource(sourceFile, allLatest);
  revalidateMissionControl();
}

export async function generateTestForgeRun(formData: FormData) {
  const sourceFiles = formData.getAll("sourceFile").filter((value): value is File => value instanceof File && value.size > 0);
  const templateFile = formData.get("templateFile") instanceof File ? formData.get("templateFile") as File : null;
  const textareaSource = String(formData.get("sourceText") ?? "").trim();
  const projectName = String(formData.get("projectName") ?? "").trim();
  const preset = String(formData.get("preset") ?? "generic");
  const exportTargets = formData.getAll("exportTargets").map(String);

  const runIds: string[] = [];
  try {
    const uploadedTemplate = await mvpUploadToText(templateFile, "Vorlage");

    if (sourceFiles.length) {
      for (const sourceFile of sourceFiles) {
        const uploadedSource = await mvpUploadToText(sourceFile, `Quelle ${sourceFile.name}`);
        if (!uploadedSource.text) continue;
        const fileProjectName = sourceFiles.length > 1 ? `${projectName || "TestForge Batch"} · ${path.basename(sourceFile.name, path.extname(sourceFile.name))}` : projectName;
        const result = generateTestfallRun({
          sourceText: uploadedSource.text,
          projectName: fileProjectName,
          preset,
          exportTargets,
          sourceName: uploadedSource.name,
          sourceKind: "upload",
          templateText: uploadedTemplate.text,
          templateName: uploadedTemplate.name,
        });
        runIds.push(result.runId);
      }
    } else {
      if (!textareaSource) throw new Error("Bitte Text einfügen oder mindestens eine Quelldatei hochladen.");
      const result = generateTestfallRun({
        sourceText: textareaSource,
        projectName,
        preset,
        exportTargets,
        sourceName: "Textarea",
        sourceKind: "textarea",
        templateText: uploadedTemplate.text,
        templateName: uploadedTemplate.name,
      });
      runIds.push(result.runId);
    }

    if (!runIds.length) throw new Error("Es konnte kein Run erzeugt werden. Bitte prüfe die hochgeladenen Dateien.");
  } catch (error) {
    redirectGeneratorError(error instanceof Error ? error.message : "Generator-Validierung fehlgeschlagen.");
  }

  revalidatePath("/testfall-automation");
  revalidatePath("/testfall-automation/library");
  for (const runId of runIds) revalidatePath(`/testfall-automation/runs/${runId}`);
  if (runIds.length === 1) redirect(`/testfall-automation/runs/${runIds[0]}`);
  redirect(`/testfall-automation/library?batch=${runIds.length}`);
}

export async function regenerateTestForgeRun(formData: FormData) {
  const sourceRunId = String(formData.get("runId") ?? "").trim();
  const runDir = safeTestfallRunDir(sourceRunId);
  if (!runDir || !fs.existsSync(runDir)) redirect("/testfall-automation?error=run-not-found");

  const sourceText = fs.existsSync(path.join(runDir, "source-input.txt")) ? fs.readFileSync(path.join(runDir, "source-input.txt"), "utf8").trim() : "";
  if (!sourceText) redirect(`/testfall-automation/runs/${sourceRunId}?error=missing-source`);

  const templatePath = path.join(runDir, "template-context.txt");
  const templateText = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, "utf8") : "";
  const manifest = readRunJson(runDir, "review-package-manifest.json");
  const testcasesJson = readRunJson(runDir, "testcases.json");
  const project = String(testcasesJson?.project ?? manifest?.project ?? "Regenerated TestForge Run");
  const preset = String(manifest?.preset ?? testcasesJson?.preset ?? "generic");
  const source = typeof manifest?.source === "object" && manifest.source ? manifest.source as Record<string, unknown> : null;
  const template = typeof manifest?.template === "object" && manifest.template ? manifest.template as Record<string, unknown> : null;

  const { runId } = generateTestfallRun({
    sourceText,
    projectName: `${project} · Recheck`,
    preset,
    exportTargets: ["json", "markdown", "csv", "xlsx", "manifest"],
    sourceName: `Recheck von ${String(source?.name ?? sourceRunId)}`,
    sourceKind: "upload",
    templateText,
    templateName: templateText ? `Recheck Vorlage ${String(template?.name ?? "template-context.txt")}` : undefined,
  });

  revalidatePath("/testfall-automation");
  revalidatePath("/testfall-automation/library");
  revalidatePath(`/testfall-automation/runs/${sourceRunId}`);
  revalidatePath(`/testfall-automation/runs/${runId}`);
  redirect(`/testfall-automation/runs/${runId}`);
}

export async function deleteTestForgeRun(formData: FormData) {
  const runId = String(formData.get("runId") ?? "").trim();
  const confirmed = String(formData.get("confirmDelete") ?? "") === "yes";
  const runDir = safeTestfallRunDir(runId);
  if (!confirmed) redirect(runDir ? `/testfall-automation/runs/${encodeURIComponent(runId)}?error=delete-not-confirmed` : "/testfall-automation/library?deleted=missing");
  if (!runDir || !fs.existsSync(runDir)) redirect("/testfall-automation/library?deleted=missing");
  fs.rmSync(runDir, { recursive: true, force: true });
  revalidatePath("/testfall-automation");
  revalidatePath("/testfall-automation/library");
  redirect("/testfall-automation/library?deleted=1");
}

export async function prepareTestForgeEmail(formData: FormData) {
  const runId = String(formData.get("runId") ?? "").trim();
  const to = String(formData.get("to") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim() || "TestForge Testfallpaket";
  const message = String(formData.get("message") ?? "").trim();
  const runDir = safeTestfallRunDir(runId);
  if (!runDir || !fs.existsSync(runDir)) redirect("/testfall-automation/library?email=missing-run");
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) redirect(`/testfall-automation/runs/${encodeURIComponent(runId)}?email=invalid-recipient`);

  const manifest = readRunJson(runDir, "review-package-manifest.json");
  const testcasesJson = readRunJson(runDir, "testcases.json");
  const project = String(testcasesJson?.project ?? manifest?.project ?? "TestForge Run");
  const packagePath = path.join(runDir, "review-package.zip");
  const packageExists = fs.existsSync(packagePath);
  const body = [
    message || `Hallo,\n\nanbei das TestForge Review-Paket für ${project}.\n\nEnthalten sind Testfälle, Quality Report, Requirements Analysis und Exportdateien.\n\nViele Grüße`,
    "",
    "---",
    `Run-ID: ${runId}`,
    `Projekt: ${project}`,
    packageExists ? "Anhang: review-package.zip" : "Hinweis: review-package.zip wurde nicht gefunden; bitte Artefakte im Run prüfen.",
  ].join("\n");

  const draftTxt = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");
  fs.writeFileSync(path.join(runDir, "email-draft.txt"), draftTxt, "utf8");

  const boundary = mimeBoundary();
  const attachment = packageExists ? fs.readFileSync(packagePath).toString("base64").replace(/(.{76})/g, "$1\r\n") : "";
  const emlParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary=\"${boundary}\"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ];
  if (packageExists) {
    emlParts.push(
      `--${boundary}`,
      "Content-Type: application/zip; name=\"review-package.zip\"",
      "Content-Transfer-Encoding: base64",
      "Content-Disposition: attachment; filename=\"review-package.zip\"",
      "",
      attachment,
    );
  }
  emlParts.push(`--${boundary}--`, "");
  fs.writeFileSync(path.join(runDir, `${sanitizeEmailFileName(project)}.eml`), emlParts.join("\r\n"), "utf8");

  revalidatePath(`/testfall-automation/runs/${runId}`);
  redirect(`/testfall-automation/runs/${runId}?email=prepared`);
}

export async function runTaurusTestfallPilot(formData: FormData) {
  const sourceFile = formData.get("sourceFile") instanceof File ? formData.get("sourceFile") as File : null;
  const templateFile = formData.get("templateFile") instanceof File ? formData.get("templateFile") as File : null;
  const sourceText = (await fileToText(sourceFile)).trim();
  const templateText = (await fileToText(templateFile)).trim();
  const projectName = String(formData.get("projectName") ?? "").trim() || "Taurus Testfall Automation Pilot";
  const sourceName = sourceFile?.name || "manual-source.txt";
  if (!sourceText) return;

  const taurusRoot = path.join(workspace, "taurus", "testfall-automation-pilot");
  const intakeDir = path.join(taurusRoot, "intake");
  fs.mkdirSync(intakeDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const safeSourceName = sourceName.replace(/[^a-zA-Z0-9_.-]+/g, "_").slice(0, 80);
  const trainingPath = path.join(workspace, "taurus", "TESTFALL_TRAINING.md");
  const trainingText = fs.existsSync(trainingPath) ? fs.readFileSync(trainingPath, "utf8") : "";
  const inputPath = path.join(intakeDir, `${stamp}-${safeSourceName}.json`);
  const payload = {
    project: projectName,
    output_prefix: `taurus-${projectName}-${safeSourceName}`,
    source: sourceName,
    linear_project: "AI Workflows",
    create_linear_issues: false,
    template_text: templateText,
    taurus_training: trainingText,
    source_text: sourceText,
    quality_directive: "Taurus mode: generate the highest-quality, most concrete QA test cases possible. Use the source only for domain facts. Use template_text only as output/field guidance. Avoid generic filler. Maximize meaningful coverage and detailed observable steps. Mark assumptions instead of inventing missing customer data."
  };
  fs.writeFileSync(inputPath, JSON.stringify(payload, null, 2), "utf8");
  execFileSync(process.execPath, [path.join(workspace, "automations", "full_testcase_generator.mjs"), `--input-json-file=${inputPath}`, "--no-xlsx"], {
    cwd: workspace,
    env: { ...process.env, TESTFALL_SKIP_XLSX: "1" },
    windowsHide: true,
    timeout: 180000,
    maxBuffer: 1024 * 1024 * 8,
  });
  revalidateMissionControl();
}
