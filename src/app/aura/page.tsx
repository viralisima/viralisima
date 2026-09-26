import AuraGenerator from "@/components/AuraGenerator";

export const metadata = {
  title: "Generador de Aura: ¿De qué color es tu energía?",
  description:
    "Descubre el color de tu aura según tu energía, personalidad y vibra. Resultado visual compartible.",
  alternates: { canonical: "https://www.viralisima.com/aura" },
  openGraph: {
    title: "¿De qué color es tu aura? — Viralísima",
    description: "Un test rápido que te da tu color de aura y personalidad.",
    url: "https://www.viralisima.com/aura",
    images: [{ url: "/api/og?quiz=aura", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <AuraGenerator />;
}
