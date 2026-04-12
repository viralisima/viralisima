import MemeGenerator from "@/components/MemeGenerator";

export const metadata = {
  title: "Generador de Memes | Viralísima",
  description:
    "Crea memes en segundos. Sube tu foto, añade texto arriba y abajo, y descarga tu meme listo para compartir.",
  openGraph: {
    title: "Generador de Memes — Viralísima",
    description: "Crea memes personalizados en 10 segundos.",
    url: "https://viralisima.com/memes",
    images: [{ url: "/api/og?quiz=memes", width: 1200, height: 630 }],
  },
};

export default function MemesPage() {
  return <MemeGenerator />;
}
