import { notFound } from "next/navigation";
import { getMissionData, getWorkspaceItemDetail } from "@/lib/openclaw-data";
import { isTconsultingItem } from "@/lib/tconsulting-data";
import { Shell } from "@/components/mission-components";
import { TActionButton, TDetail, THeader, TPage } from "@/components/tconsulting-components";

export const dynamic = "force-dynamic";

export default async function TconsultingTaskDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getMissionData();
  const item = getWorkspaceItemDetail("tasks", slug);
  if (!item || !isTconsultingItem(item)) notFound();

  return (
    <Shell data={data} variant="tconsulting">
      <TPage>
        <THeader eyebrow="Tconsulting Task" title={item.title} description="Eigene Tconsulting-Aufgabendetailseite. Bleibt im Kunden-Cockpit und springt nicht zur offiziellen Mission Control." action={<TActionButton href="/tconsulting/tasks">Zurück zu Tconsulting Tasks</TActionButton>} />
        <TDetail item={item} type="Task" />
      </TPage>
    </Shell>
  );
}
