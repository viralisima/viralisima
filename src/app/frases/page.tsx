import FrasesGenerator from "@/components/FrasesGenerator";

export const metadata = {
  title: "Generador de frases virales para redes",
  description:
    "Genera captions, biografías y frases virales para Instagram, TikTok y WhatsApp en segundos. Divertidas, motivacionales, románticas, sarcásticas y más.",
  alternates: { canonical: "https://www.viralisima.com/frases" },
  openGraph: {
    title: "Generador de frases virales — Viralísima",
    description: "La frase perfecta para tu próximo post.",
    url: "https://www.viralisima.com/frases",
    images: [{ url: "/api/og?quiz=frases", width: 1200, height: 630 }],
  },
};

export default function FrasesPage() {
  return <FrasesGenerator />;
}
