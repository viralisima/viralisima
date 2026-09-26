import JuegoRitmoEmoji from "@/components/JuegoRitmoEmoji";

export const metadata = {
  title: "Ritmo Emoji",
  description: "Sigue el patrón de emojis al ritmo",
  alternates: { canonical: "https://www.viralisima.com/juegos/ritmo-emoji" },
  openGraph: {
    title: "Ritmo Emoji — Viralísima",
    description: "Sigue el patrón de emojis al ritmo",
    url: "https://www.viralisima.com/juegos/ritmo-emoji",
    images: [{ url: "/api/og?quiz=ritmo-emoji", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoRitmoEmoji />;
}
