import HistoriasGenerator from "@/components/HistoriasGenerator";

export const metadata = {
  title: "Generador de Historias Cortas",
  description:
    "Inventa una historia divertida en segundos. Elige personaje, lugar y misión, y obtén una historia única para leer, compartir o regalar.",
  alternates: { canonical: "https://www.viralisima.com/historias" },
  openGraph: {
    title: "Generador de Historias — Viralísima",
    description: "Una historia distinta cada vez. Para niños y adultos.",
    url: "https://www.viralisima.com/historias",
    images: [{ url: "/api/og?quiz=historias", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <HistoriasGenerator />;
}
