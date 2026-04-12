import NombreArtistaGenerator from "@/components/NombreArtistaGenerator";

export const metadata = {
  title: "Generador de Nombre de Artista/Banda/Rapero | Viralísima",
  description:
    "¿Cuál sería tu nombre artístico? Descubre tu nombre de rapero, banda de rock, reggaetonero o cantante pop en 5 segundos.",
  openGraph: {
    title: "Generador de Nombre Artístico — Viralísima",
    description: "Tu nombre de escenario en 5 segundos.",
    url: "https://viralisima.com/generadores/nombre-artista",
    images: [{ url: "/api/og?quiz=nombre-artista", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <NombreArtistaGenerator />;
}
