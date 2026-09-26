import JuegoAtrapaLaPalabra from "@/components/JuegoAtrapaLaPalabra";

export const metadata = {
  title: "Atrapa la Palabra",
  description: "Forma palabras antes de que caigan al suelo",
  alternates: { canonical: "https://www.viralisima.com/juegos/atrapa-la-palabra" },
  openGraph: {
    title: "Atrapa la Palabra — Viralísima",
    description: "Forma palabras antes de que caigan al suelo",
    url: "https://www.viralisima.com/juegos/atrapa-la-palabra",
    images: [{ url: "/api/og?quiz=atrapa-la-palabra", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoAtrapaLaPalabra />;
}
