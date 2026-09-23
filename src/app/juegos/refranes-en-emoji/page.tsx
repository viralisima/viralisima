import JuegoRefranesEnEmoji from "@/components/JuegoRefranesEnEmoji";

export const metadata = {
  title: "Refranes en Emoji | Viralísima",
  description: "Adivina el dicho escondido detrás de tres emojis antes de que se acabe el tiempo",
  openGraph: {
    title: "Refranes en Emoji — Viralísima",
    description: "Adivina el dicho escondido detrás de tres emojis antes de que se acabe el tiempo",
    url: "https://www.viralisima.com/juegos/refranes-en-emoji",
    images: [{ url: "/api/og?quiz=refranes-en-emoji", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoRefranesEnEmoji />;
}
