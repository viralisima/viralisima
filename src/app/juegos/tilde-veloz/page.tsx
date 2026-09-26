import JuegoTildeVeloz from "@/components/JuegoTildeVeloz";

export const metadata = {
  title: "Tilde Veloz | Viralísima",
  description: "¿Sabes de verdad dónde va la tilde? Demuéstralo en 45 segundos",
  openGraph: {
    title: "Tilde Veloz — Viralísima",
    description: "¿Sabes de verdad dónde va la tilde? Demuéstralo en 45 segundos",
    url: "https://www.viralisima.com/juegos/tilde-veloz",
    images: [{ url: "/api/og?quiz=tilde-veloz", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoTildeVeloz />;
}
