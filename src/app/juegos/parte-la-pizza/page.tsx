import JuegoParteLaPizza from "@/components/JuegoParteLaPizza";
import TextoSeo from "@/components/TextoSeo";
import { TEXTOS } from "@/data/textos-seo";

export const metadata = {
  title: "Parte la Pizza",
  description: "¿Eres capaz de partirla justo por la mitad?",
  alternates: { canonical: "https://www.viralisima.com/juegos/parte-la-pizza" },
  openGraph: {
    title: "Parte la Pizza — Viralísima",
    description: "¿Eres capaz de partirla justo por la mitad?",
    url: "https://www.viralisima.com/juegos/parte-la-pizza",
    images: [{ url: "/api/og?quiz=parte-la-pizza", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <>
      <JuegoParteLaPizza />
      <TextoSeo texto={TEXTOS["juegos/parte-la-pizza"]} />
    </>
  );
}
