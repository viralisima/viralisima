import JuegoPorteroDeFiesta from "@/components/JuegoPorteroDeFiesta";

export const metadata = {
  title: "Portero de Fiesta | Viralísima",
  description: "Deja pasar solo a quien cumpla la norma… que cambia cada 10 segundos",
  openGraph: {
    title: "Portero de Fiesta — Viralísima",
    description: "Deja pasar solo a quien cumpla la norma… que cambia cada 10 segundos",
    url: "https://www.viralisima.com/juegos/portero-de-fiesta",
    images: [{ url: "/api/og?quiz=portero-de-fiesta", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoPorteroDeFiesta />;
}
