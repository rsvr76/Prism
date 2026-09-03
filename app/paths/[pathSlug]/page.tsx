import { notFound } from "next/navigation";
import { getAllLearningPaths, getLearningPathBySlug } from "@/lib/content/learningPaths";
import PathOverviewClient from "@/components/learning/PathOverviewClient";

interface PathPageProps {
  params: Promise<{ pathSlug: string }>;
}

export function generateStaticParams() {
  const paths = getAllLearningPaths();
  return paths.map((p) => ({
    pathSlug: p.slug,
  }));
}

export default async function PathDetailPage({ params }: PathPageProps) {
  const { pathSlug } = await params;
  const path = getLearningPathBySlug(pathSlug);

  if (!path) {
    notFound();
  }

  return <PathOverviewClient path={path} />;
}
