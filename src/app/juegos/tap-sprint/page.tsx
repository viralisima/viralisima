import JuegoTapSprint from "@/components/JuegoTapSprint";

export const metadata = {
  title: "Tap Sprint — ¿Cuántos clicks en 10 segundos? | Viralísima",
  description: "Pon a prueba tus dedos. ¿Cuántos clicks puedes hacer en 10 segundos? Récord personal y compartible.",
  openGraph: {
    title: "Tap Sprint — Viralísima",
    description: "10 segundos, miles de clicks. ¿Cuántos haces?",
    url: "https://viralisima.com/juegos/tap-sprint",
    images: [{ url: "/api/og?quiz=tap-sprint", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoTapSprint />;
}
