import JuegoMamaDice from "@/components/JuegoMamaDice";
import TextoSeo from "@/components/TextoSeo";
import { textoCon } from "@/data/textos-seo";

export const metadata = {
  title: "Mamá Dice",
  description: "Obedece solo cuando lo dice mamá… ¡y rápido!",
  alternates: { canonical: "https://www.viralisima.com/juegos/mama-dice" },
  openGraph: {
    title: "Mamá Dice — Viralísima",
    description: "Obedece solo cuando lo dice mamá… ¡y rápido!",
    url: "https://www.viralisima.com/juegos/mama-dice",
    images: [{ url: "/api/og?quiz=mama-dice", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <>
      <JuegoMamaDice />
      <TextoSeo texto={textoCon("juegos/mama-dice")} />
    </>
  );
}
