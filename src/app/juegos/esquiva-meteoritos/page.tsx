import JuegoEsquivaMeteoritos from "@/components/JuegoEsquivaMeteoritos";

export const metadata = {
  title: "Esquiva Meteoritos | Viralísima",
  description: "Mueve tu nave y sobrevive el máximo tiempo",
  openGraph: {
    title: "Esquiva Meteoritos — Viralísima",
    description: "Mueve tu nave y sobrevive el máximo tiempo",
    url: "https://viralisima.com/juegos/esquiva-meteoritos",
    images: [{ url: "/api/og?quiz=esquiva-meteoritos", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoEsquivaMeteoritos />;
}
