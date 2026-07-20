import JuegoAsteroides from "@/components/JuegoAsteroides";

export const metadata = {
  title: "Asteroides · Arcade clásico | Viralísima",
  description:
    "El clásico arcade de destruir asteroides con tu nave. Gira, propulsa y dispara. Niveles infinitos, ranking global. Gratis y sin registro.",
  openGraph: {
    title: "Asteroides — Viralísima",
    description: "Destruye asteroides con tu nave. El arcade de siempre, ahora en tu móvil.",
    url: "https://viralisima.com/juegos/asteroides",
    images: [{ url: "/api/og?quiz=asteroides", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoAsteroides />;
}
