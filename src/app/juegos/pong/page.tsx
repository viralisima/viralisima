import JuegoPong from "@/components/JuegoPong";

export const metadata = {
  title: "Pong · El clásico contra la máquina | Viralísima",
  description:
    "El mítico Pong contra la máquina: devuelve la bola, que acelera con cada golpe. Aguanta todos los peloteos que puedas. Ranking global, gratis y sin registro.",
  openGraph: {
    title: "Pong — Viralísima",
    description: "Devuelve la bola a la máquina y aguanta el máximo de peloteos. El arcade original.",
    url: "https://viralisima.com/juegos/pong",
    images: [{ url: "/api/og?quiz=pong", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoPong />;
}
