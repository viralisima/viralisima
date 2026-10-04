import NombreArtistaGenerator from "@/components/NombreArtistaGenerator";
import TextoSeo from "@/components/TextoSeo";
import { TEXTOS } from "@/data/textos-seo";

export const metadata = {
  title: "Generador de Nombre de Artista/Banda/Rapero",
  description:
    "¿Cuál sería tu nombre artístico? Descubre tu nombre de rapero, banda de rock, reggaetonero o cantante pop en 5 segundos.",
  alternates: { canonical: "https://www.viralisima.com/generadores/nombre-artista" },
  openGraph: {
    title: "Generador de Nombre Artístico — Viralísima",
    description: "Tu nombre de escenario en 5 segundos.",
    url: "https://www.viralisima.com/generadores/nombre-artista",
    images: [{ url: "/api/og?quiz=nombre-artista", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <>
      <NombreArtistaGenerator />
      <TextoSeo texto={TEXTOS["generadores/nombre-artista"]} />
    </>
  );
}
