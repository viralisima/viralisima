import JuegoRitmoEmoji from "@/components/JuegoRitmoEmoji";

export const metadata = {
  title: "Ritmo Emoji | Viralísima",
  description: "Sigue el patrón de emojis al ritmo",
  openGraph: {
    title: "Ritmo Emoji — Viralísima",
    description: "Sigue el patrón de emojis al ritmo",
    url: "https://viralisima.com/juegos/ritmo-emoji",
    images: [{ url: "/api/og?quiz=ritmo-emoji", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoRitmoEmoji />;
}
