import JuegoCuantoDuraUnSegundo from "@/components/JuegoCuantoDuraUnSegundo";
import TextoSeo from "@/components/TextoSeo";
import { TEXTOS } from "@/data/textos-seo";

export const metadata = {
  title: "¿Cuánto dura un segundo?",
  description: "Para el reloj a ciegas justo en el tiempo que te pedimos",
  alternates: { canonical: "https://www.viralisima.com/juegos/cuanto-dura-un-segundo" },
  openGraph: {
    title: "¿Cuánto dura un segundo? — Viralísima",
    description: "Para el reloj a ciegas justo en el tiempo que te pedimos",
    url: "https://www.viralisima.com/juegos/cuanto-dura-un-segundo",
    images: [{ url: "/api/og?quiz=cuanto-dura-un-segundo", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <>
      <JuegoCuantoDuraUnSegundo />
      <TextoSeo texto={TEXTOS["juegos/cuanto-dura-un-segundo"]} />
    </>
  );
}
