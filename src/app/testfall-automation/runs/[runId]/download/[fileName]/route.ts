import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getTestfallAutomationArtifactPath } from "@/lib/testfall-automation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ runId: string; fileName: string }> };

const contentTypes: Record<string, string> = {
  ".csv": "text/csv; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".zip": "application/zip",
  ".eml": "message/rfc822",
};

export async function GET(_request: Request, { params }: Props) {
  const { runId, fileName } = await params;
  const filePath = getTestfallAutomationArtifactPath(runId, decodeURIComponent(fileName));
  if (!filePath) return new NextResponse("Not found", { status: 404 });

  const buffer = fs.readFileSync(filePath);
  const safeName = path.basename(filePath).replace(/[\r\n"]/g, "_");
  return new NextResponse(buffer, {
    headers: {
      "content-type": contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "content-length": String(buffer.byteLength),
      "content-disposition": `attachment; filename="${safeName}"`,
      "x-content-type-options": "nosniff",
    },
  });
}
