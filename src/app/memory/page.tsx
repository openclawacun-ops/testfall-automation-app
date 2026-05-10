import { ItemCard, PageHeader, Shell } from "@/components/mission-components";
import { getMissionData } from "@/lib/openclaw-data";

export const dynamic = "force-dynamic";

export default function MemoryPage() {
  const data = getMissionData();
  return (
    <Shell data={data}>
      <PageHeader eyebrow="Memory" title="Wissensspeicher" description="Langzeit- und Tagesmemory aus den Agent-Workspaces. Nur echte Dateien, sortiert nach letzter Ã„nderung." />
      <div className="grid gap-4 p-6 md:p-9 xl:grid-cols-2">{data.memory.map((item) => <ItemCard key={item.path} item={item} dense />)}</div>
    </Shell>
  );
}

