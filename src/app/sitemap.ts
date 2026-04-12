import type { MetadataRoute } from "next";
import { QUIZZES } from "@/data/quizzes";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://viralisima.com";
  const now = new Date();

  const quizEntries = QUIZZES.map((q) => ({
    url: `${base}/quiz/${q.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...quizEntries,
  ];
}
