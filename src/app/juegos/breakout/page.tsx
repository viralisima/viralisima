import JuegoBreakout from "@/components/JuegoBreakout";
import TextoSeo from "@/components/TextoSeo";
import { textoCon } from "@/data/textos-seo";

export const metadata = {
  title: "Breakout · Rompe ladrillos",
  description:
    "El clásico Breakout: rebota la bola con la paleta y destruye todos los ladrillos. 3 vidas, niveles infinitos y ranking global. Gratis y sin registro.",
  alternates: { canonical: "https://www.viralisima.com/juegos/breakout" },
  openGraph: {
    title: "Breakout — Viralísima",
    description: "Rebota la bola y rompe todos los ladrillos. El arcade de siempre en tu móvil.",
    url: "https://www.viralisima.com/juegos/breakout",
    images: [{ url: "/api/og?quiz=breakout", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <>
      <JuegoBreakout />
      <TextoSeo texto={textoCon("juegos/breakout")} />
    </>
  );
}
