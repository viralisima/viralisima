import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // El slug llevaba «í» y salía en el sitemap mal codificado (404). Ahora es ASCII;
      // la variante vieja (con la tilde en cualquier codificación) redirige a la nueva.
      {
        source: "/blog/cosas-que-hac:x([^i/][^/]*)amos-cuando-se-iba-la-luz",
        destination: "/blog/cosas-que-haciamos-cuando-se-iba-la-luz",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
