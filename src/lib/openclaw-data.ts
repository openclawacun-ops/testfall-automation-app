import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export type AgentInfo = {
  id: string;
  name: string;
  role: string;
  model: string;
  fallbackModels: string[];
  workspace: string;
  status: "ready" | "missing-workspace";
  memoryFiles: number;
};

export type FileItem = {
  title: string;
  path: string;
  relativePath: string;
  type: string;
  size: number;
  updatedAt: string;
  excerpt: string;
  status?: string;
  owner?: string;
  project?: string;
  assigned?: string;
  created?: string;
  progress?: {
    total: number;
    done: number;
    percent: number;
  };
  nextActions: string[];
};

export type WorkspaceKind = "tasks" | "projects";

export type FileItemDetail = FileItem & { raw: string };

export type ActiveRoadmap = {
  title: string;
  path: string;
  relativePath: string;
  updatedAt?: string;
  excerpt: string;
  openActions: string[];
};

export type ScheduledCalendarItem = {
  id: string;
  title: string;
  sourcePath: string;
  sourceRelativePath: string;
  day?: number;
  dayLabel?: string;
  startMinutes?: number;
  endMinutes?: number;
  excerpt: string;
  kind: "calendar" | "task";
};

export type RuntimeSignal = {
  label: string;
  value: string;
  tone: "good" | "warn" | "info";
  detail: string;
};

export type LinearSnapshot = {
  generatedAt: string;
  organization?: { name?: string; urlKey?: string };
  metrics: {
    totalIssues: number;
    byState: Record<string, number>;
    activeCount: number;
    activeLimit: number;
    activeLimitOk: boolean;
    blockedCount: number;
    doneThisWeek: number;
  };
  focus: {
    active: { identifier: string; title: string; state: string; project?: string; url?: string }[];
    blocked: { identifier: string; title: string; state: string; project?: string; url?: string }[];
    recentDone: { identifier: string; title: string; updatedAt: string; project?: string; url?: string }[];
  };
};

export type N8nWorkflowStatus = {
  id: string;
  name: string;
  active: boolean;
  triggerCount?: number;
  nodeTypes: string[];
};

export type LinearOpsGuard = {
  generatedAt?: string;
  status: string;
  checks: { name: string; ok: boolean; detail: string }[];
};

export type TestfallPilotOutput = {
  title: string;
  path: string;
  relativePath: string;
  updatedAt: string;
  kind: "markdown" | "csv" | "qcCsv" | "xlsx" | "json";
  size: number;
  customer?: string;
  testCaseId?: string;
  steps?: number;
};

export type TestfallPilotSourceGroup = {
  sourceFile: string;
  title?: string;
  customer?: string;
  testCases: number;
  steps: number;
  packageCommand: string;
};

export type TestfallPilotPackage = {
  name: string;
  packagePath: string;
  manifestPath: string;
  updatedAt: string;
  bytes: number;
  mode?: string;
  sourceFile?: string;
  testCases: number;
  files: number;
  verifyCommand: string;
};

export type TestfallPilotStatus = {
  inboxCount: number;
  processedCount: number;
  outputCount: number;
  qcCsvCount: number;
  xlsxCount: number;
  latestOutputAt?: string;
  latestReportAt?: string;
  latestReportPath?: string;
  latestPackagePath?: string;
  latestPackageBytes?: number;
  latestReportSummary?: { testCases?: number; groups?: number; totalSteps?: number; qcCsv?: number; qcXlsx?: number };
  sourceGroups: TestfallPilotSourceGroup[];
  packages: TestfallPilotPackage[];
  outputs: TestfallPilotOutput[];
};

export type ChannelStatus = {
  id: string;
  label: string;
  running: boolean;
  connected: boolean;
  configured: boolean;
  tone: "good" | "warn" | "info";
  detail: string;
  botUsername?: string;
  lastError?: string;
};

export type MissionData = {
  generatedAt: string;
  paths: {
    workspace: string;
    openclawHome: string;
    config: string;
    obsidianVault: string;
  };
  agents: AgentInfo[];
  tasks: FileItem[];
  projects: FileItem[];
  memory: FileItem[];
  docs: FileItem[];
  calendar: FileItem[];
  activeRoadmap?: ActiveRoadmap;
  scheduledCalendar: ScheduledCalendarItem[];
  cronJobs: { total: number; source: string; note: string };
  runtime: RuntimeSignal[];
  channels: ChannelStatus[];
  linear?: LinearSnapshot;
  n8nWorkflows: N8nWorkflowStatus[];
  linearOpsGuard?: LinearOpsGuard;
  testfallPilot?: TestfallPilotStatus;
  health: { label: string; value: string; tone: "good" | "warn" | "info" }[];
};

type OpenClawAgentConfig = {
  id: string;
  name?: string;
  default?: boolean;
  workspace?: string;
  model?: string | { primary?: string; fallbacks?: string[] };
  identity?: { name?: string; theme?: string; emoji?: string };
};

type OpenClawConfig = {
  agents?: {
    defaults?: {
      workspace?: string;
      model?: { primary?: string };
    };
    list?: OpenClawAgentConfig[];
  };
  channels?: Record<string, unknown>;
};

const USER_HOME = process.env.USERPROFILE ?? process.env.HOME ?? "C:\\Users\\openc";
const WORKSPACE = process.env.OPENCLAW_WORKSPACE ?? path.join(USER_HOME, ".openclaw", "workspace");
const OPENCLAW_HOME = process.env.OPENCLAW_HOME ?? path.dirname(WORKSPACE);
const CONFIG_PATH = path.join(OPENCLAW_HOME, "openclaw.json");
const OBSIDIAN_VAULT = path.join(USER_HOME, "Documents", "OpenClaw-Obsidian-Memory");

const IGNORED_DIRS = new Set(["node_modules", ".next", ".git", "sessions", "credentials", "plugin-runtime-deps", "mission-control"]);

function safeRead(filePath: string): string {
  try {
    return fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf8").replace(/^\uFEFF/, "");
  } catch {
    return "";
  }
}

function readJson(filePath: string): OpenClawConfig {
  const raw = safeRead(filePath);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as OpenClawConfig;
  } catch {
    return {};
  }
}

export function ensureWorkspaceDirs() {
  for (const dir of ["tasks", "projects", "calendar", "docs"]) {
    const full = path.join(WORKSPACE, dir);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  }
}

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || `item-${Date.now()}`;
}

export function writeWorkspaceMarkdown(kind: "tasks" | "projects", title: string, body: string) {
  ensureWorkspaceDirs();
  const now = new Date().toISOString().slice(0, 10);
  const filePath = path.join(WORKSPACE, kind, `${slugify(title)}.md`);
  const defaultBody = kind === "tasks"
    ? `# ${title}\n\nStatus: backlog\nProject: OpenClaw Mission Control\nOwner: Acun / Aurus\nCreated: ${now}\n\n## Objective\n\n${body || "Describe the task objective."}\n\n## Checklist\n\n- [ ] Define next action\n`
    : `# ${title}\n\nStatus: active\nOwner: Acun / Aurus\nCreated: ${now}\n\n## Goal\n\n${body || "Describe the project goal."}\n\n## Next actions\n\n- Define first milestone\n`;
  fs.writeFileSync(filePath, defaultBody, "utf8");
  return filePath;
}

function listFiles(root: string, extensions = [".md", ".json", ".json5", ".txt"]): string[] {
  if (!fs.existsSync(/*turbopackIgnore: true*/ root)) return [];
  const out: string[] = [];
  const walk = (dir: string, depth = 0) => {
    if (depth > 8) return;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(/*turbopackIgnore: true*/ dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) walk(full, depth + 1);
        continue;
      }
      if (entry.isFile() && extensions.includes(path.extname(entry.name).toLowerCase())) out.push(full);
    }
  };
  walk(root);
  return out;
}

function titleFromContent(filePath: string, raw: string): string {
  const heading = raw.split(/\r?\n/).find((line) => line.trim().startsWith("# "));
  if (heading) return heading.replace(/^#\s+/, "").trim();
  return path.basename(filePath);
}

function fieldFromContent(raw: string, field: string): string | undefined {
  const match = raw.match(new RegExp(`^${field}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim();
}

function progressFromContent(raw: string): FileItem["progress"] {
  const checkboxes = Array.from(raw.matchAll(/^\s*- \[( |x|X)\]/gm));
  const total = checkboxes.length;
  const done = checkboxes.filter((match) => match[1].toLowerCase() === "x").length;
  return total ? { total, done, percent: Math.round((done / total) * 100) } : undefined;
}

function nextActionsFromContent(raw: string): string[] {
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+(Next actions|Nächste Schritte|Naechste Schritte|Checklist|Objective|Goal)\s*$/i.test(line.trim()));
  if (start < 0) return [];

  const actions: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) break;
    const match = line.match(/^\s*-\s+(?:\[[ xX]\]\s*)?(.+)$/);
    if (match?.[1]) actions.push(match[1].trim());
    if (actions.length >= 5) break;
  }
  return actions;
}

function openChecklistItemsFromContent(raw: string, limit = 12): string[] {
  const actions: string[] = [];
  for (const match of raw.matchAll(/^\s*- \[ \]\s+(.+)$/gm)) {
    const action = match[1]?.trim();
    if (action) actions.push(action);
    if (actions.length >= limit) break;
  }
  return actions;
}

function collectActiveRoadmap(): ActiveRoadmap | undefined {
  const filePath = path.join(OBSIDIAN_VAULT, "Agent-Shared", "active-roadmap.md");
  if (!fs.existsSync(filePath)) return undefined;
  const raw = safeRead(filePath);
  const stat = fs.statSync(filePath);
  const cleaned = raw.replace(/\s+/g, " ").trim();
  return {
    title: titleFromContent(filePath, raw),
    path: filePath,
    relativePath: path.relative(OBSIDIAN_VAULT, filePath),
    updatedAt: stat.mtime.toISOString(),
    excerpt: cleaned.slice(0, 260),
    openActions: openChecklistItemsFromContent(raw),
  };
}

function toFileItem(filePath: string, root: string): FileItem {
  const raw = safeRead(filePath);
  const stat = fs.statSync(filePath);
  const rel = path.relative(root, filePath);
  const cleaned = raw.replace(/\s+/g, " ").trim();
  return {
    title: titleFromContent(filePath, raw),
    path: filePath,
    relativePath: rel,
    type: path.extname(filePath).replace(".", "") || "file",
    size: stat.size,
    updatedAt: stat.mtime.toISOString(),
    excerpt: cleaned.slice(0, 220),
    status: fieldFromContent(raw, "Status"),
    owner: fieldFromContent(raw, "Owner"),
    project: fieldFromContent(raw, "Project"),
    assigned: fieldFromContent(raw, "Assigned"),
    created: fieldFromContent(raw, "Created"),
    progress: progressFromContent(raw),
    nextActions: nextActionsFromContent(raw),
  };
}

export function detailSlug(item: Pick<FileItem, "relativePath">) {
  return slugify(item.relativePath.replace(/\\/g, "/"));
}

function workspaceKindRoot(kind: WorkspaceKind) {
  return path.join(WORKSPACE, kind);
}

export function getWorkspaceItems(kind: WorkspaceKind): FileItem[] {
  return listFiles(workspaceKindRoot(kind), [".md", ".json", ".json5"]).map((file) => toFileItem(file, WORKSPACE)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getWorkspaceItemDetail(kind: WorkspaceKind, slug: string): FileItemDetail | undefined {
  const item = getWorkspaceItems(kind).find((candidate) => detailSlug(candidate) === slug);
  return item ? { ...item, raw: safeRead(item.path) } : undefined;
}

export function updateWorkspaceMarkdownStatus(kind: WorkspaceKind, relativePath: string, status: string) {
  const allowed = new Set(["backlog", "active", "in-progress", "blocked", "done"]);
  if (!allowed.has(status)) throw new Error("Unsupported status");

  const root = workspaceKindRoot(kind);
  const normalizedRelativePath = relativePath.replace(/\\/g, "/");
  const pathInsideKind = normalizedRelativePath.startsWith(`${kind}/`) ? normalizedRelativePath.slice(kind.length + 1) : normalizedRelativePath;
  const filePath = path.resolve(root, pathInsideKind);
  const relativeToRoot = path.relative(root, filePath);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot) || !fs.existsSync(filePath)) throw new Error("File is outside workspace kind");
  if (path.extname(filePath).toLowerCase() !== ".md") throw new Error("Status editing is only supported for markdown files");

  const raw = safeRead(filePath);
  const updated = /^Status:\s*.*$/im.test(raw)
    ? raw.replace(/^Status:\s*.*$/im, `Status: ${status}`)
    : raw.replace(/^(# .+\r?\n)/, `$1\nStatus: ${status}\n`);
  fs.writeFileSync(filePath, updated, "utf8");
  return filePath;
}

function getAgents(config: OpenClawConfig): AgentInfo[] {
  const defaultsWorkspace = config.agents?.defaults?.workspace ?? WORKSPACE;
  const list = Array.isArray(config.agents?.list) ? config.agents.list : [];
  return list.map((agent) => {
    const workspace = agent.workspace ?? defaultsWorkspace;
    const model = typeof agent.model === "string" ? agent.model : agent.model?.primary ?? config.agents?.defaults?.model?.primary ?? "default";
    const fallbackModels = typeof agent.model === "object" && Array.isArray(agent.model.fallbacks) ? agent.model.fallbacks : [];
    const memoryFiles = [path.join(workspace, "MEMORY.md"), ...listFiles(path.join(workspace, "memory"), [".md"])].filter((p) => fs.existsSync(p)).length;
    return {
      id: agent.id,
      name: agent.name ?? agent.identity?.name ?? agent.id,
      role: agent.identity?.theme ?? (agent.default ? "operator / default agent" : "agent"),
      model,
      fallbackModels,
      workspace,
      status: fs.existsSync(workspace) ? "ready" : "missing-workspace",
      memoryFiles,
    };
  });
}

function collectMemory(config: OpenClawConfig): FileItem[] {
  const roots = new Set<string>([WORKSPACE]);
  for (const agent of config.agents?.list ?? []) {
    if (agent.workspace) roots.add(agent.workspace);
  }
  const files: string[] = [];
  for (const root of roots) {
    const longTerm = path.join(root, "MEMORY.md");
    if (fs.existsSync(longTerm)) files.push(longTerm);
    files.push(...listFiles(path.join(root, "memory"), [".md"]));
  }
  return files.map((file) => toFileItem(file, OPENCLAW_HOME)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function collectDocs(config: OpenClawConfig): FileItem[] {
  const roots = new Set<string>([path.join(WORKSPACE, "docs")]);
  for (const agent of config.agents?.list ?? []) {
    if (agent.workspace) roots.add(path.join(agent.workspace, "docs"));
  }
  const files = Array.from(roots).flatMap((root) => listFiles(root));
  const unique = Array.from(new Set(files));
  return unique.map((file) => toFileItem(file, OPENCLAW_HOME)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function collectLinearSnapshot(): LinearSnapshot | undefined {
  const filePath = path.join(WORKSPACE, "docs", "linear-current-snapshot.json");
  const raw = safeRead(filePath);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as LinearSnapshot;
    if (!parsed.metrics || !parsed.focus) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function collectN8nWorkflows(): N8nWorkflowStatus[] {
  const filePath = path.join(WORKSPACE, "docs", "n8n-linear-automation", "exported-all.json");
  const raw = safeRead(filePath);
  if (!raw) return [];
  try {
    const workflows = JSON.parse(raw) as Array<{ id?: string; name?: string; active?: boolean; triggerCount?: number; nodes?: Array<{ type?: string }> }>;
    if (!Array.isArray(workflows)) return [];
    return workflows
      .filter((workflow) => workflow.name?.toLowerCase().includes("linear"))
      .map((workflow) => ({
        id: workflow.id || "unversioned",
        name: workflow.name || "Unnamed workflow",
        active: workflow.active === true,
        triggerCount: workflow.triggerCount,
        nodeTypes: Array.from(new Set((workflow.nodes ?? []).map((node) => node.type).filter((type): type is string => Boolean(type)))),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

function collectLinearOpsGuard(): LinearOpsGuard | undefined {
  const filePath = path.join(WORKSPACE, "docs", "linear-ops-guard-report.md");
  const raw = safeRead(filePath);
  if (!raw) return undefined;
  const generatedAt = raw.match(/^Generated:\s*(.+)$/m)?.[1]?.trim();
  const status = raw.match(/^Status:\s*(.+)$/m)?.[1]?.trim() ?? "unknown";
  const checks = Array.from(raw.matchAll(/^- \[(x| )\]\s+(.+?)\s+—\s+(.+)$/gm)).map((match) => ({
    ok: match[1] === "x",
    name: match[2]?.trim() ?? "Check",
    detail: match[3]?.trim() ?? "",
  }));
  return { generatedAt, status, checks };
}

function runOpenClaw(args: string[], timeout = 3500): string {
  try {
    return execFileSync("openclaw", args, { encoding: "utf8", timeout, windowsHide: true });
  } catch (error) {
    return error instanceof Error ? error.message : "unavailable";
  }
}

function parseJsonObject(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

function getChannelStatuses(config: OpenClawConfig): ChannelStatus[] {
  const raw = runOpenClaw(["channels", "status", "--probe", "--json"], 8000);
  const parsed = parseJsonObject(raw) as { channels?: Record<string, Record<string, unknown>>; channelAccounts?: Record<string, Record<string, unknown>[]> } | null;
  const configuredIds = Object.keys(config.channels ?? {});
  const ids = new Set<string>([...configuredIds, ...Object.keys(parsed?.channels ?? {})]);

  return Array.from(ids).map((id) => {
    const channel = parsed?.channels?.[id] ?? {};
    const account = parsed?.channelAccounts?.[id]?.[0] ?? {};
    const probe = (channel.probe ?? account.probe ?? {}) as Record<string, unknown>;
    const bot = (probe.bot ?? {}) as Record<string, unknown>;
    const running = channel.running === true || account.running === true;
    const connected = account.connected === true || (probe.ok === true && running);
    const configured = channel.configured === true || configuredIds.includes(id);
    const lastError = String(channel.lastError ?? account.lastError ?? probe.error ?? "");
    const tone: ChannelStatus["tone"] = connected ? "good" : configured ? "warn" : "info";
    return {
      id,
      label: id === "telegram" ? "Telegram" : id,
      running,
      connected,
      configured,
      tone,
      detail: connected ? "Live probe OK" : lastError || "Configured but not connected",
      botUsername: typeof bot.username === "string" ? bot.username : undefined,
      lastError: lastError || undefined,
    };
  });
}

const DAY_NAMES = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const DAY_ALIASES: Record<string, number> = {
  montag: 0, mo: 0, monday: 0, mon: 0,
  dienstag: 1, di: 1, tuesday: 1, tue: 1,
  mittwoch: 2, mi: 2, wednesday: 2, wed: 2,
  donnerstag: 3, do: 3, thursday: 3, thu: 3,
  freitag: 4, fr: 4, friday: 4, fri: 4,
  samstag: 5, sa: 5, saturday: 5, sat: 5,
  sonntag: 6, so: 6, sunday: 6, sun: 6,
};

function minutesFromTime(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function dayFromText(text: string): number | undefined {
  const normalized = text.toLowerCase();
  for (const [alias, day] of Object.entries(DAY_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(normalized)) return day;
  }
  const isoDate = normalized.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoDate) {
    const jsDay = new Date(`${isoDate[1]}T12:00:00`).getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }
  return undefined;
}

function cleanScheduleTitle(line: string): string {
  return line
    .replace(/^\s*[-*]\s*(?:\[[ xX]\]\s*)?/, "")
    .replace(/\b(?:montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|mo|di|mi|do|fr|sa|so|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b:?/gi, "")
    .replace(/\b20\d{2}-\d{2}-\d{2}\b/g, "")
    .replace(/\b\d{1,2}:\d{2}\s*(?:[-–]\s*\d{1,2}:\d{2})?/g, "")
    .replace(/^[:—–-]+\s*/, "")
    .trim();
}

function scheduledSourceFromLine(line: string): string | undefined {
  return line.match(/<!--\s*source:\s*([^>]+?)\s*-->/i)?.[1]?.trim();
}

function collectScheduledCalendar(calendarFiles: string[], tasks: FileItem[]): ScheduledCalendarItem[] {
  const scheduled: ScheduledCalendarItem[] = [];
  const manuallyScheduledSources = new Set<string>();

  for (const file of calendarFiles) {
    const raw = safeRead(file);
    let currentDay: number | undefined;
    raw.split(/\r?\n/).forEach((line, index) => {
      const scheduledSource = scheduledSourceFromLine(line);
      if (scheduledSource) manuallyScheduledSources.add(scheduledSource.replace(/\\/g, "/"));
      const lineDay = dayFromText(line);
      if (/^#+\s+/.test(line) && lineDay !== undefined) currentDay = lineDay;
      const timeMatch = line.match(/\b(\d{1,2}:\d{2})(?:\s*[-–]\s*(\d{1,2}:\d{2}))?/);
      if (!timeMatch) return;
      const day = lineDay ?? currentDay;
      const startMinutes = minutesFromTime(timeMatch[1]);
      const endMinutes = timeMatch[2] ? minutesFromTime(timeMatch[2]) : Math.min(startMinutes + 60, 24 * 60);
      scheduled.push({
        id: `${file}:${index}`,
        title: cleanScheduleTitle(line).replace(/<!--.*?-->/g, "").trim() || titleFromContent(file, raw),
        sourcePath: file,
        sourceRelativePath: path.relative(WORKSPACE, file),
        day,
        dayLabel: day !== undefined ? DAY_NAMES[day] : undefined,
        startMinutes,
        endMinutes: Math.max(endMinutes, startMinutes + 30),
        excerpt: line.replace(/<!--.*?-->/g, "").trim(),
        kind: "calendar",
      });
    });

    if (!scheduled.some((item) => item.sourcePath === file)) {
      const item = toFileItem(file, WORKSPACE);
      scheduled.push({
        id: file,
        title: item.title,
        sourcePath: file,
        sourceRelativePath: item.relativePath,
        excerpt: item.excerpt,
        kind: "calendar",
      });
    }
  }

  for (const task of tasks.filter((task) => !["done", "complete", "completed", "erledigt"].includes((task.status ?? "").toLowerCase()) && !manuallyScheduledSources.has(task.relativePath.replace(/\\/g, "/"))).slice(0, 12)) {
    scheduled.push({
      id: task.path,
      title: task.title,
      sourcePath: task.path,
      sourceRelativePath: task.relativePath,
      excerpt: task.excerpt,
      kind: "task",
    });
  }

  return scheduled;
}

export function scheduleCalendarItem(sourceRelativePath: string, title: string, day: number, start: string, end: string) {
  ensureWorkspaceDirs();
  if (!Number.isInteger(day) || day < 0 || day > 6) throw new Error("Unsupported day");
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) throw new Error("Unsupported time");
  const filePath = path.join(WORKSPACE, "calendar", "manual-schedule.md");
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "# Manual Schedule\n\n## Geplante Einträge\n", "utf8");
  const safeTitle = (title || "Geplanter Eintrag").replace(/[\r\n]+/g, " ").trim();
  const safeSource = sourceRelativePath.replace(/\\/g, "/").replace(/-->/g, "");
  fs.appendFileSync(filePath, `\n- ${DAY_NAMES[day]} ${start}-${end} ${safeTitle} <!-- source: ${safeSource} -->\n`, "utf8");
  return filePath;
}

export function deleteScheduledCalendarLine(sourceRelativePath: string, lineIndex: number) {
  const filePath = path.resolve(WORKSPACE, sourceRelativePath);
  const relative = path.relative(WORKSPACE, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(filePath)) throw new Error("File is outside workspace");
  const lines = safeRead(filePath).split(/\r?\n/);
  if (lineIndex < 0 || lineIndex >= lines.length) throw new Error("Line does not exist");
  lines.splice(lineIndex, 1);
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

export function packageTestfallPilotSource(sourceFile: string, allLatest = false) {
  const root = path.join(WORKSPACE, "testfall-pilot");
  const reportJsonPath = path.join(root, "reports", "latest-testfall-pilot-report.json");
  const latestReport = fs.existsSync(reportJsonPath) ? JSON.parse(safeRead(reportJsonPath)) as { groups?: { sourceFile?: string }[] } : {};
  const knownSources = new Set((latestReport.groups ?? []).map((group) => group.sourceFile).filter(Boolean));
  const args = ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(WORKSPACE, "automations", "package_testfall_pilot.ps1"), "-Verify"];
  if (allLatest) {
    args.push("-AllLatest");
  } else {
    const source = sourceFile.trim();
    if (!source || !knownSources.has(source)) throw new Error("Unknown testfall pilot source");
    args.push("-Source", source);
  }
  execFileSync("powershell", args, { cwd: WORKSPACE, windowsHide: true, timeout: 120000, stdio: "pipe" });
}

function collectTestfallPilot(): TestfallPilotStatus | undefined {
  const root = path.join(WORKSPACE, "testfall-pilot");
  if (!fs.existsSync(root)) return undefined;
  const inboxRoot = path.join(root, "inbox");
  const processedRoot = path.join(root, "processed");
  const outRoot = path.join(root, "out");
  const reportJsonPath = path.join(root, "reports", "latest-testfall-pilot-report.json");
  const reportMdPath = path.join(root, "reports", "latest-testfall-pilot-report.md");
  const packagesRoot = path.join(root, "packages");
  const packagePath = path.join(packagesRoot, "latest-testfall-pilot-review-package.zip");
  let latestReport: { generatedAt?: string; summary?: TestfallPilotStatus["latestReportSummary"]; groups?: { sourceFile?: string; title?: string; customer?: string; cases?: { steps?: number }[] }[] } = {};
  if (fs.existsSync(reportJsonPath)) {
    try { latestReport = JSON.parse(safeRead(reportJsonPath)) as typeof latestReport; } catch { latestReport = {}; }
  }
  const outputs = listFiles(outRoot, [".md", ".csv", ".json", ".xlsx"]).map((file): TestfallPilotOutput => {
    const stat = fs.statSync(file);
    const raw = path.extname(file).toLowerCase() === ".md" || path.extname(file).toLowerCase() === ".json" ? safeRead(file) : "";
    const base = path.basename(file);
    const kind: TestfallPilotOutput["kind"] = base.endsWith("-tconsulting-qc-import.csv") ? "qcCsv" : path.extname(file).toLowerCase() === ".xlsx" ? "xlsx" : path.extname(file).toLowerCase() === ".json" ? "json" : path.extname(file).toLowerCase() === ".csv" ? "csv" : "markdown";
    let parsed: Record<string, unknown> = {};
    if (path.extname(file).toLowerCase() === ".json" && raw) {
      try { parsed = JSON.parse(raw) as Record<string, unknown>; } catch { parsed = {}; }
    }
    const customer = typeof parsed.customer === "string" ? parsed.customer : raw.match(/^- Customer:\s*(.+)$/m)?.[1]?.trim();
    const testCaseId = typeof parsed.id === "string" ? parsed.id : raw.match(/^- ID:\s*(.+)$/m)?.[1]?.trim();
    const steps = Array.isArray(parsed.steps) ? parsed.steps.length : undefined;
    return {
      title: raw ? titleFromContent(file, raw) : base,
      path: file,
      relativePath: path.relative(WORKSPACE, file),
      updatedAt: stat.mtime.toISOString(),
      kind,
      size: stat.size,
      customer,
      testCaseId,
      steps,
    };
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const packages = fs.existsSync(packagesRoot)
    ? fs.readdirSync(packagesRoot)
      .filter((name) => name.endsWith("-manifest.json"))
      .map((name) => {
        const manifestPath = path.join(packagesRoot, name);
        const manifestRaw = safeRead(manifestPath);
        let manifest: { mode?: string; sourceFile?: string; package?: string; selectedTestCases?: unknown[]; files?: unknown[]; copied?: unknown[] } = {};
        try { manifest = JSON.parse(manifestRaw) as typeof manifest; } catch { manifest = {}; }
        const packageRelative = manifest.package ?? name.replace(/-manifest\.json$/i, ".zip");
        const resolvedPackagePath = path.isAbsolute(packageRelative) ? packageRelative : path.join(WORKSPACE, packageRelative);
        const manifestStat = fs.statSync(manifestPath);
        const packageExists = fs.existsSync(resolvedPackagePath);
        return {
          name: name.replace(/-manifest\.json$/i, ""),
          packagePath: packageExists ? path.relative(WORKSPACE, resolvedPackagePath) : packageRelative,
          manifestPath: path.relative(WORKSPACE, manifestPath),
          updatedAt: manifestStat.mtime.toISOString(),
          bytes: packageExists ? fs.statSync(resolvedPackagePath).size : 0,
          mode: manifest.mode,
          sourceFile: manifest.sourceFile,
          testCases: manifest.selectedTestCases?.length ?? 0,
          files: manifest.files?.length ?? manifest.copied?.length ?? 0,
          verifyCommand: `node .\\automations\\verify_testfall_package.mjs --package=${packageExists ? path.relative(WORKSPACE, resolvedPackagePath) : packageRelative} --manifest=${path.relative(WORKSPACE, manifestPath)}`,
        };
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 8)
    : [];
  const latestOutputAt = outputs[0]?.updatedAt;
  return {
    inboxCount: listFiles(inboxRoot, [".md", ".txt"]).length,
    processedCount: listFiles(processedRoot, [".md", ".txt"]).length,
    outputCount: outputs.length,
    qcCsvCount: outputs.filter((output) => output.kind === "qcCsv").length,
    xlsxCount: outputs.filter((output) => output.kind === "xlsx").length,
    latestOutputAt,
    latestReportAt: latestReport.generatedAt,
    latestReportPath: fs.existsSync(reportMdPath) ? path.relative(WORKSPACE, reportMdPath) : undefined,
    latestPackagePath: fs.existsSync(packagePath) ? path.relative(WORKSPACE, packagePath) : undefined,
    latestPackageBytes: fs.existsSync(packagePath) ? fs.statSync(packagePath).size : undefined,
    latestReportSummary: latestReport.summary,
    sourceGroups: (latestReport.groups ?? []).slice(0, 10).map((group) => ({
      sourceFile: group.sourceFile ?? 'unknown',
      title: group.title,
      customer: group.customer,
      testCases: group.cases?.length ?? 0,
      steps: group.cases?.reduce((sum, item) => sum + (item.steps ?? 0), 0) ?? 0,
      packageCommand: `.\\automations\\package_testfall_pilot.ps1 -Source "${group.sourceFile ?? 'unknown'}" -Verify`,
    })),
    packages,
    outputs: outputs.slice(0, 30),
  };
}

function getRuntimeSignals(config: OpenClawConfig): RuntimeSignal[] {
  const status = runOpenClaw(["gateway", "status"]);
  const channelCount = Object.keys(config.channels ?? {}).length;
  const gatewayOk = /Connectivity probe:\s*ok/i.test(status) || /Runtime:\s*running/i.test(status);
  const telegramWarning = status.includes("ECONNREFUSED") ? "Gateway probe refused connection" : "See channel card for live channel state";

  return [
    {
      label: "Gateway",
      value: gatewayOk ? "running" : "unknown",
      tone: gatewayOk ? "good" : "warn",
      detail: gatewayOk ? "OpenClaw gateway status probe reports a running local gateway." : status.slice(0, 180),
    },
    {
      label: "Configured channels",
      value: String(channelCount),
      tone: channelCount ? "good" : "warn",
      detail: channelCount ? Object.keys(config.channels ?? {}).join(", ") : "No configured channel blocks found in openclaw.json.",
    },
    {
      label: "Telegram",
      value: config.channels?.telegram ? "configured" : "missing",
      tone: config.channels?.telegram ? "info" : "warn",
      detail: config.channels?.telegram ? telegramWarning : "Telegram is not configured.",
    },
  ];
}

export function getMissionData(): MissionData {
  ensureWorkspaceDirs();

  const config = readJson(CONFIG_PATH);
  const tasks = getWorkspaceItems("tasks");
  const projects = getWorkspaceItems("projects");
  const calendarFiles = listFiles(path.join(WORKSPACE, "calendar"), [".md", ".json", ".json5"]);
  const calendar = calendarFiles.map((file) => toFileItem(file, WORKSPACE)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const activeRoadmap = collectActiveRoadmap();
  const memory = collectMemory(config);
  const docs = collectDocs(config);
  const agents = getAgents(config);
  const runtime = getRuntimeSignals(config);
  const channels = getChannelStatuses(config);
  const linear = collectLinearSnapshot();
  const n8nWorkflows = collectN8nWorkflows();
  const linearOpsGuard = collectLinearOpsGuard();
  const testfallPilot = collectTestfallPilot();
  const activeTasks = tasks.filter((task) => !["done", "complete", "completed"].includes((task.status ?? "").toLowerCase()));

  return {
    generatedAt: new Date().toISOString(),
    paths: { workspace: WORKSPACE, openclawHome: OPENCLAW_HOME, config: CONFIG_PATH, obsidianVault: OBSIDIAN_VAULT },
    agents,
    tasks,
    projects,
    memory,
    docs,
    calendar,
    activeRoadmap,
    scheduledCalendar: collectScheduledCalendar(calendarFiles, tasks),
    runtime,
    channels,
    linear,
    n8nWorkflows,
    linearOpsGuard,
    testfallPilot,
    cronJobs: { total: 0, source: "OpenClaw cron runtime", note: "No cron jobs were found during discovery; live cron API/CLI polling remains Phase 3." },
    health: [
      { label: "Agenten", value: String(agents.length), tone: agents.length ? "good" : "warn" },
      { label: "Aktive Aufgaben", value: String(activeTasks.length), tone: activeTasks.length ? "good" : "info" },
      { label: "Projekte", value: String(projects.length), tone: projects.length ? "good" : "warn" },
      { label: "Memory-Dateien", value: String(memory.length), tone: memory.length ? "good" : "warn" },
      { label: "Gateway", value: runtime[0]?.value ?? "unknown", tone: runtime[0]?.tone ?? "info" },
      { label: "Obsidian", value: fs.existsSync(OBSIDIAN_VAULT) ? "verbunden" : "fehlt", tone: fs.existsSync(OBSIDIAN_VAULT) ? "good" : "warn" },
    ],
  };
}
