import { notFound } from "next/navigation";
import { getMissionData, getWorkspaceItemDetail } from "@/lib/openclaw-data";
import { isTconsultingItem } from "@/lib/tconsulting-data";
import { Shell } from "@/components/mission-components";
import { TActionButton, TDetail, THeader, TPage } from "@/components/tconsulting-components";

export const dynamic = "force-dynamic";

export default async function TconsultingProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getMissionData();
  const item = getWorkspaceItemDetail("projects", slug);
  if (!item || !isTconsultingItem(item)) notFound();

  return (
    <Shell data={data} variant="tconsulting">
      <TPage>
        <THeader eyebrow="Tconsulting Projekt" title={item.title} description="Eigene Tconsulting-Projektdetailseite. Bleibt im Kunden-Cockpit und springt nicht zur offiziellen Mission Control." action={<TActionButton href="/tconsulting/projects">Zurück zu Tconsulting Projekten</TActionButton>} />
        <TDetail item={item} type="Projekt" />
      </TPage>
    </Shell>
  );
}
