import EdadMental from "@/components/EdadMental";

export const metadata = {
  title: "Calculadora de Edad Mental | Viralísima",
  description:
    "Descubre tu edad mental en 1 minuto. 8 preguntas rápidas y te calculamos un número exacto. Divertido y compartible.",
  openGraph: {
    title: "Calculadora de Edad Mental — Viralísima",
    description: "¿Qué edad tiene tu cerebro realmente?",
    url: "https://viralisima.com/edad-mental",
    images: [{ url: "/api/og?quiz=edad-mental", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <EdadMental />;
}
