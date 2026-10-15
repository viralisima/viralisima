import type { MetadataRoute } from "next";
import { QUIZZES } from "@/data/quizzes";
import { SIGNS } from "@/data/horoscopo";
import { BLOG } from "@/data/blog";
import { GAMES as JUEGOS } from "@/lib/leaderboard";

// 2026-10-16: fuera las páginas de resultado de quiz y los rankings (noindex, contenido fino) y fuera el
// lastmod falso (antes todas llevaban la hora del build). Sólo llevan fecha el blog (la del post) y el
// horóscopo, que cambia cada día de verdad.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.viralisima.com";
  const hoy = new Date();

  const fijas: [string, number][] = [
    ["", 1], ["/edad-perro", 0.9], ["/dias-vividos", 0.9], ["/calculadora-imc", 0.9], ["/compatibilidad", 0.9],
    ["/edad-mental", 0.9], ["/aura", 0.9], ["/generadores/nombre-artista", 0.9], ["/generadores/username", 0.9],
    ["/memes", 0.8], ["/frases", 0.8], ["/historias", 0.8], ["/juegos", 0.9], ["/blog", 0.8],
    ["/sobre-nosotros", 0.3], ["/contacto", 0.3], ["/privacidad", 0.2], ["/terminos", 0.2],
  ];

  return [
    ...fijas.map(([ruta, priority]) => ({ url: `${base}${ruta}`, priority })),
    { url: `${base}/horoscopo`, lastModified: hoy, changeFrequency: "daily" as const, priority: 0.8 },
    ...SIGNS.map((s) => ({ url: `${base}/horoscopo/${s.id}`, lastModified: hoy, changeFrequency: "daily" as const, priority: 0.7 })),
    ...BLOG.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.date), priority: 0.7 })),
    ...QUIZZES.map((q) => ({ url: `${base}/quiz/${q.slug}`, priority: 0.8 })),
    ...Object.keys(JUEGOS).map((slug) => ({ url: `${base}/juegos/${slug}`, priority: 0.7 })),
  ];
}
