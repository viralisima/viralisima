import JuegoGloboValiente from "@/components/JuegoGloboValiente";

export const metadata = {
  title: "Globo Valiente | Viralísima",
  description: "Infla, aguanta… ¿te plantas o revientas?",
  openGraph: {
    title: "Globo Valiente — Viralísima",
    description: "Infla, aguanta… ¿te plantas o revientas?",
    url: "https://www.viralisima.com/juegos/globo-valiente",
    images: [{ url: "/api/og?quiz=globo-valiente", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoGloboValiente />;
}
