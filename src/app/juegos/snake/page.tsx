import JuegoSnake from "@/components/JuegoSnake";

export const metadata = {
  title: "Snake · La serpiente clásica | Viralísima",
  description:
    "El clásico Snake: come, crece y no choques. Cada manzana te hace más largo y más rápido. Ranking global, gratis y sin registro.",
  openGraph: {
    title: "Snake — Viralísima",
    description: "Come, crece y no choques. La serpiente de siempre en tu móvil.",
    url: "https://viralisima.com/juegos/snake",
    images: [{ url: "/api/og?quiz=snake", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoSnake />;
}
