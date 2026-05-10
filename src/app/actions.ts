"use server";

import { revalidatePath } from "next/cache";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { deleteScheduledCalendarLine, detailSlug, getWorkspaceItemDetail, packageTestfallPilotSource, scheduleCalendarItem, updateWorkspaceMarkdownStatus, writeWorkspaceMarkdown } from "@/lib/openclaw-data";
import type { WorkspaceKind } from "@/lib/openclaw-data";

const workspace = process.env.OPENCLAW_WORKSPACE ?? path.join(process.env.USERPROFILE ?? process.env.HOME ?? "C:\\Users\\openc", ".openclaw", "workspace");

function revalidateMissionControl() {
  for (const route of ["/", "/tasks", "/projects", "/calendar", "/memory", "/docs", "/team", "/tconsulting", "/tconsulting/testfall-pilot", "/taurus"]) revalidatePath(route);
}

async function fileToText(file: File | null, fallback = "") {
  if (!file || file.size === 0) return fallback;
  return Buffer.from(await file.arrayBuffer()).toString("utf8").replace(/^\uFEFF/, "");
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
