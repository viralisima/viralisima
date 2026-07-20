import JuegoSpaceInvaders from "@/components/JuegoSpaceInvaders";

export const metadata = {
  title: "Space Invaders · Arcade clásico | Viralísima",
  description:
    "El clásico arcade de defender la Tierra de la invasión alienígena. Búnkeres, oleadas y OVNI bonus. Ranking global, gratis y sin registro.",
  openGraph: {
    title: "Space Invaders — Viralísima",
    description: "Destruye la invasión alienígena antes de que llegue abajo. El arcade de siempre en tu móvil.",
    url: "https://viralisima.com/juegos/space-invaders",
    images: [{ url: "/api/og?quiz=space-invaders", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoSpaceInvaders />;
}
