import { ItemDetailPage } from "@/components/item-detail";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ItemDetailPage kind="projects" slug={slug} />;
}
