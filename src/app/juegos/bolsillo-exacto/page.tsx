import JuegoBolsilloExacto from "@/components/JuegoBolsilloExacto";
import TextoSeo from "@/components/TextoSeo";
import { TEXTOS } from "@/data/textos-seo";

export const metadata = {
  title: "Bolsillo Exacto",
  description: "Para la moneda justo en el objetivo",
  alternates: { canonical: "https://www.viralisima.com/juegos/bolsillo-exacto" },
  openGraph: {
    title: "Bolsillo Exacto — Viralísima",
    description: "Para la moneda justo en el objetivo",
    url: "https://www.viralisima.com/juegos/bolsillo-exacto",
    images: [{ url: "/api/og?quiz=bolsillo-exacto", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <>
      <JuegoBolsilloExacto />
      <TextoSeo texto={TEXTOS["juegos/bolsillo-exacto"]} />
    </>
  );
}
