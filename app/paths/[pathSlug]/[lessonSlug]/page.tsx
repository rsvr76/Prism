import { notFound } from "next/navigation";
import {
  getAllLearningPaths,
  getAllLessonsForPath,
  getLessonBySlug,
} from "@/lib/content/learningPaths";
import { getAlgorithmBySlug } from "@/lib/content/algorithms";
import LessonViewClient from "@/components/learning/LessonViewClient";

interface LessonPageProps {
  params: Promise<{
    pathSlug: string;
    lessonSlug: string;
  }>;
}

export function generateStaticParams() {
  const paths = getAllLearningPaths();
  const paramsList: { pathSlug: string; lessonSlug: string }[] = [];

  for (const path of paths) {
    const lessons = getAllLessonsForPath(path);
    for (const lesson of lessons) {
      paramsList.push({
        pathSlug: path.slug,
        lessonSlug: lesson.slug,
      });
    }
  }

  return paramsList;
}

export default async function LessonDetailPage({ params }: LessonPageProps) {
  const { pathSlug, lessonSlug } = await params;
  const lookup = getLessonBySlug(pathSlug, lessonSlug);

  if (!lookup) {
    notFound();
  }

  const { path, stage, lesson, prevLesson, nextLesson } = lookup;
  const algorithm = getAlgorithmBySlug(lesson.algorithmSlug);

  return (
    <LessonViewClient
      path={path}
      stage={stage}
      lesson={lesson}
      algorithm={algorithm}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}
