import { notFound } from "next/navigation";
import { ALGORITHM_REGISTRY, getAlgorithmBySlug } from "@/lib/content/algorithms";
import AlgorithmDetailClient from "@/components/library/AlgorithmDetailClient";

export function generateStaticParams() {
  return ALGORITHM_REGISTRY.map((algo) => ({
    slug: algo.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AlgorithmDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const algorithm = getAlgorithmBySlug(slug);

  if (!algorithm) {
    notFound();
  }

  return <AlgorithmDetailClient algorithm={algorithm} />;
}
