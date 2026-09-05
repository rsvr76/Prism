import { MetadataRoute } from "next";
import { ALGORITHM_REGISTRY } from "@/lib/content/algorithms";
import { LEARNING_PATHS_REGISTRY, getAllLessonsForPath } from "@/lib/content/learningPaths";
import { ALL_CHALLENGES } from "@/lib/content/challenges";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prism-flax-seven.vercel.app";

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/workbench`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/paths`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Algorithm detail pages
  for (const algo of ALGORITHM_REGISTRY) {
    routes.push({
      url: `${baseUrl}/library/${algo.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // Learning paths and lessons
  for (const path of LEARNING_PATHS_REGISTRY) {
    routes.push({
      url: `${baseUrl}/paths/${path.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const lesson of getAllLessonsForPath(path)) {
      routes.push({
        url: `${baseUrl}/paths/${path.slug}/${lesson.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  // Practice challenge pages
  for (const ch of ALL_CHALLENGES) {
    routes.push({
      url: `${baseUrl}/practice/${ch.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return routes;
}
