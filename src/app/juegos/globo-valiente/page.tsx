import JuegoGloboValiente from "@/components/JuegoGloboValiente";
import TextoSeo from "@/components/TextoSeo";
import { textoCon } from "@/data/textos-seo";

export const metadata = {
  title: "Globo Valiente",
  description: "Infla, aguanta… ¿te plantas o revientas?",
  alternates: { canonical: "https://www.viralisima.com/juegos/globo-valiente" },
  openGraph: {
    title: "Globo Valiente — Viralísima",
    description: "Infla, aguanta… ¿te plantas o revientas?",
    url: "https://www.viralisima.com/juegos/globo-valiente",
    images: [{ url: "/api/og?quiz=globo-valiente", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <>
      <JuegoGloboValiente />
      <TextoSeo texto={textoCon("juegos/globo-valiente")} />
    </>
  );
}
