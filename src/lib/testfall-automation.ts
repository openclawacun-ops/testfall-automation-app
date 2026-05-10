import fs from "node:fs";
import path from "node:path";

export type TestfallArtifact = {
  name: string;
  kind: string;
  relativePath: string;
  bytes: number;
  updatedAt: string;
};

export type TestfallRunSummary = {
  runId: string;
  title: string;
  project?: string;
  createdAt?: string;
  updatedAt: string;
  testcaseCount: number;
  stepCount: number;
  openQuestionsCount: number;
  riskLevel?: string;
  averageQuality?: number;
  weakTestcases: string[];
  guardStatus: "review_required" | "ready_for_review" | "missing_testcases" | "missing_manifest" | "missing_exports";
  artifacts: TestfallArtifact[];
};

export type TestcaseQualitySummary = {
  score?: number;
  level?: string;
  domainProfile?: string;
  warnings: string[];
};

export type TestfallCase = {
  id?: string;
  title?: string;
  variant?: string;
  category?: string;
  priority?: string;
  risk?: string;
  preconditions: string[];
  testData: string[];
  steps: Array<{ step?: number; action?: string; expected?: string }>;
  expectedResult?: string;
  stepsCount: number;
  sourceRequirement?: string;
  quality?: TestcaseQualitySummary;
};

export type TestfallRunDetail = TestfallRunSummary & {
  manifest: Record<string, unknown> | null;
  qualityReport: Record<string, unknown> | null;
  summaryMarkdown: string;
  requirementsAnalysisMarkdown: string;
  testcases: TestfallCase[];
  openQuestions: string[];
  missingFiles: string[];
};

const workspace = process.env.OPENCLAW_WORKSPACE ?? path.join(process.env.USERPROFILE ?? process.env.HOME ?? "C:\\Users\\openc", ".openclaw", "workspace");
const runsRoot = path.join(workspace, "testfall-pilot", "runs");

const preferredArtifactOrder = ["review-package.zip", "email-draft.txt", "requirements-analysis.md", "requirements-analysis.json", "testcases.md", "testcases.csv", "testcases.json", "review-summary.md", "review-package-manifest.json", "quality-report.json", "source-input.txt", "template-context.txt"];

const artifactKinds: Record<string, string> = {
  "testcases.json": "Testfälle JSON",
  "testcases.md": "Testfälle Markdown",
  "testcases.csv": "CSV Export",
  "qc-import.csv": "QC/ALM Import",
  "testcases.xlsx": "XLSX Export",
  "review-summary.md": "Review Summary",
  "review-package.zip": "Review Package ZIP",
  "automation-run-log.json": "Run Log",
  "quality-report.json": "Quality Report",
  "review-package-manifest.json": "Manifest",
  "requirements-analysis.json": "Requirements Analysis JSON",
  "requirements-analysis.md": "Requirements Analysis",
  "email-draft.txt": "E-Mail Entwurf",
  "source-input.txt": "Quelle",
  "template-context.txt": "Vorlagen-Kontext",
};

function readJson(filePath: string): unknown | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readText(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: unknown): string[] {
  return asArray(value).map(String);
}

function asStepArray(value: unknown): Array<{ step?: number; action?: string; expected?: string }> {
  return asArray(value).map((item) => {
    const record = asRecord(item);
    return {
      step: asNumber(record?.step),
      action: asString(record?.action),
      expected: asString(record?.expected),
    };
  });
}

function safeRunDir(runId: string) {
  if (!/^[\w.-]+$/.test(runId)) return null;
  const full = path.join(runsRoot, runId);
  const resolved = path.resolve(full);
  const root = path.resolve(runsRoot);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
}

export function getTestfallAutomationArtifactPath(runId: string, fileName: string) {
  const runDir = safeRunDir(runId);
  if (!runDir || !fs.existsSync(runDir)) return null;
  if (!fileName || path.basename(fileName) !== fileName || fileName.includes("/") || fileName.includes("\\")) return null;
  const full = path.resolve(runDir, fileName);
  if (!full.startsWith(`${path.resolve(runDir)}${path.sep}`)) return null;
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return null;
  return full;
}

function getArtifacts(runDir: string): TestfallArtifact[] {
  if (!fs.existsSync(runDir)) return [];
  return fs.readdirSync(runDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const full = path.join(runDir, entry.name);
      const stat = fs.statSync(full);
      return {
        name: entry.name,
        kind: artifactKinds[entry.name] ?? (entry.name.endsWith(".eml") ? "E-Mail Datei" : path.extname(entry.name).replace(/^\./, "").toUpperCase() || "Artifact"),
        relativePath: path.relative(workspace, full),
        bytes: stat.size,
        updatedAt: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => {
      const left = preferredArtifactOrder.indexOf(a.name);
      const right = preferredArtifactOrder.indexOf(b.name);
      if (left !== -1 || right !== -1) return (left === -1 ? 999 : left) - (right === -1 ? 999 : right);
      return a.name.localeCompare(b.name);
    });
}

function parseRun(runId: string, runDir: string): TestfallRunSummary {
  const testcasesJson = asRecord(readJson(path.join(runDir, "testcases.json")));
  const manifest = asRecord(readJson(path.join(runDir, "review-package-manifest.json"))) ?? asRecord(readJson(path.join(runDir, "automation-run-log.json")));
  const quality = asRecord(readJson(path.join(runDir, "quality-report.json"))) ?? asRecord(manifest?.quality);
  const summary = asRecord(testcasesJson?.summary);
  const stat = fs.statSync(runDir);
  const artifacts = getArtifacts(runDir);
  const testcaseCount = asNumber(quality?.testcase_count) ?? asNumber(summary?.testcase_count) ?? asArray(testcasesJson?.testcases).length;
  const stepCount = asNumber(quality?.step_count) ?? asNumber(summary?.step_count) ?? asArray(testcasesJson?.testcases).reduce<number>((total, item) => {
    const record = asRecord(item);
    return total + asArray(record?.steps).length;
  }, 0);
  const openQuestionsCount = asNumber(quality?.open_questions_count) ?? asNumber(summary?.open_questions_count) ?? 0;
  const hasTestcases = artifacts.some((artifact) => artifact.name === "testcases.json");
  const hasManifest = artifacts.some((artifact) => artifact.name === "automation-run-log.json" || artifact.name === "review-package-manifest.json");

  const qualityStatus = asString(quality?.status) as TestfallRunSummary["guardStatus"] | undefined;

  return {
    runId,
    title: asString(testcasesJson?.project) ?? asString(manifest?.project) ?? runId.replace(/^\d{8}T\d{6}Z-/, "").replaceAll("-", " "),
    project: asString(testcasesJson?.project) ?? asString(manifest?.project),
    createdAt: asString(testcasesJson?.created_at) ?? asString(manifest?.created_at),
    updatedAt: stat.mtime.toISOString(),
    testcaseCount,
    stepCount,
    openQuestionsCount,
    riskLevel: asString(summary?.risk_level),
    averageQuality: asNumber(quality?.average_testcase_quality),
    weakTestcases: asStringArray(quality?.weak_testcases),
    guardStatus: qualityStatus ?? (!hasTestcases ? "missing_testcases" : !hasManifest ? "missing_manifest" : openQuestionsCount > 0 ? "review_required" : "ready_for_review"),
    artifacts,
  };
}

export function getTestfallAutomationRuns(limit = 12): TestfallRunSummary[] {
  if (!fs.existsSync(runsRoot)) return [];
  return fs.readdirSync(runsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => parseRun(entry.name, path.join(runsRoot, entry.name)))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, limit);
}

export function getTestfallAutomationRun(runId: string): TestfallRunDetail | null {
  const runDir = safeRunDir(runId);
  if (!runDir || !fs.existsSync(runDir)) return null;
  const summary = parseRun(runId, runDir);
  const manifest = asRecord(readJson(path.join(runDir, "review-package-manifest.json"))) ?? asRecord(readJson(path.join(runDir, "automation-run-log.json")));
  const qualityReport = asRecord(readJson(path.join(runDir, "quality-report.json"))) ?? asRecord(manifest?.quality);
  const testcasesJson = asRecord(readJson(path.join(runDir, "testcases.json")));
  const testcases = asArray(testcasesJson?.testcases).map((item) => {
    const record = asRecord(item);
    const testcaseQuality = asRecord(record?.quality);
    const steps = asStepArray(record?.steps);
    return {
      id: asString(record?.id),
      title: asString(record?.title),
      variant: asString(record?.variant),
      category: asString(record?.category),
      priority: asString(record?.priority),
      risk: asString(record?.risk),
      preconditions: asStringArray(record?.preconditions),
      testData: asStringArray(record?.test_data),
      steps,
      expectedResult: asString(record?.expected_result),
      sourceRequirement: asString(record?.source_requirement),
      stepsCount: steps.length,
      quality: testcaseQuality ? {
        score: asNumber(testcaseQuality.score),
        level: asString(testcaseQuality.level),
        domainProfile: asString(testcaseQuality.domain_profile),
        warnings: asStringArray(testcaseQuality.warnings),
      } : undefined,
    };
  });
  const openQuestions = asArray(testcasesJson?.open_questions).map(String);
  const expectedFiles = ["testcases.json", "testcases.md", "testcases.csv", "review-summary.md", "review-package-manifest.json"];

  return {
    ...summary,
    manifest,
    qualityReport,
    summaryMarkdown: readText(path.join(runDir, "review-summary.md")),
    requirementsAnalysisMarkdown: readText(path.join(runDir, "requirements-analysis.md")),
    testcases,
    openQuestions,
    missingFiles: expectedFiles.filter((file) => !fs.existsSync(path.join(runDir, file))),
  };
}

export function getTestfallAutomationCockpit() {
  const runs = getTestfallAutomationRuns(10);
  const latest = runs[0];
  return {
    runsRoot: path.relative(workspace, runsRoot),
    latest,
    runs,
    totals: {
      runs: runs.length,
      testcases: runs.reduce((sum, run) => sum + run.testcaseCount, 0),
      steps: runs.reduce((sum, run) => sum + run.stepCount, 0),
      reviewRequired: runs.filter((run) => run.guardStatus !== "ready_for_review").length,
    },
  };
}
