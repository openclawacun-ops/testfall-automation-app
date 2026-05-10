import { ItemDetailPage } from "@/components/item-detail";

export const dynamic = "force-dynamic";

export default async function TaskDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ItemDetailPage kind="tasks" slug={slug} />;
}
