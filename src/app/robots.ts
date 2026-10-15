import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/og son las imágenes al compartir: Google tiene que poder leerlas (2026-10-16)
        allow: ["/", "/api/og"],
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://www.viralisima.com/sitemap.xml",
    host: "https://www.viralisima.com",
  };
}
