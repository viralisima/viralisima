import JuegoBloques from "@/components/JuegoBloques";
import TextoSeo from "@/components/TextoSeo";
import { TEXTOS } from "@/data/textos-seo";

export const metadata = {
  title: "Bloques · Puzzle de piezas que caen",
  description:
    "Encaja las piezas que caen y completa líneas para eliminarlas. El puzzle adictivo de siempre, con niveles, pieza siguiente y ranking global. Gratis y sin registro.",
  alternates: { canonical: "https://www.viralisima.com/juegos/bloques" },
  openGraph: {
    title: "Bloques — Viralísima",
    description: "Encaja las piezas y completa líneas. El puzzle adictivo, ahora en tu móvil.",
    url: "https://www.viralisima.com/juegos/bloques",
    images: [{ url: "/api/og?quiz=bloques", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <>
      <JuegoBloques />
      <TextoSeo texto={TEXTOS["juegos/bloques"]} />
    </>
  );
}
