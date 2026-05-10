import { ItemCard, PageHeader, Shell } from "@/components/mission-components";
import { getMissionData } from "@/lib/openclaw-data";

export const dynamic = "force-dynamic";

export default function DocsPage() {
  const data = getMissionData();
  return (
    <Shell data={data}>
      <PageHeader eyebrow="Docs" title="Dokumente & Arbeitsdateien" description="Markdown-, JSON- und Textdateien aus den relevanten Workspace-Roots. Mission-Control-Build-Artefakte und node_modules bleiben drauÃŸen." />
      <div className="grid gap-4 p-6 md:p-9 xl:grid-cols-2">{data.docs.slice(0, 80).map((item) => <ItemCard key={item.path} item={item} dense />)}</div>
    </Shell>
  );
}

