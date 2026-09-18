import JuegoReyPorUnMinuto from "@/components/JuegoReyPorUnMinuto";

export const metadata = {
  title: "Rey por un minuto | Viralísima",
  description: "Gobierna 60 segundos sin arruinar el reino",
  openGraph: {
    title: "Rey por un minuto — Viralísima",
    description: "Gobierna 60 segundos sin arruinar el reino",
    url: "https://viralisima.com/juegos/rey-por-un-minuto",
    images: [{ url: "/api/og?quiz=rey-por-un-minuto", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoReyPorUnMinuto />;
}
