import type { MetadataRoute } from "next";
import { QUIZZES } from "@/data/quizzes";
import { SIGNS } from "@/data/horoscopo";
import { BLOG } from "@/data/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://viralisima.com";
  const now = new Date();

  const quizEntries = QUIZZES.map((q) => ({
    url: `${base}/quiz/${q.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const resultEntries = QUIZZES.flatMap((q) =>
    q.results.map((r) => ({
      url: `${base}/quiz/${q.slug}/resultado/${r.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  );

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/memes`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/frases`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/generadores/nombre-artista`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/historias`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/edad-mental`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/aura`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/generadores/username`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/compatibilidad`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/dias-vividos`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/edad-perro`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/calculadora-imc`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/horoscopo`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sobre-nosotros`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...BLOG.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...SIGNS.map((s) => ({
      url: `${base}/horoscopo/${s.id}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...quizEntries,
    ...resultEntries,
  ];
}
