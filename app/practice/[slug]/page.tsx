import { notFound } from "next/navigation";
import { getChallengeBySlug, getAllChallenges } from "@/lib/content/challenges";
import ChallengeWorkbenchClient from "@/components/practice/ChallengeWorkbenchClient";

export async function generateStaticParams() {
  return getAllChallenges().map((c) => ({ slug: c.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ChallengePage({ params }: Props) {
  const { slug } = await params;
  const challenge = getChallengeBySlug(slug);
  if (!challenge) notFound();
  return <ChallengeWorkbenchClient challenge={challenge} />;
}
