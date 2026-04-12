import JuegoReflejos from "@/components/JuegoReflejos";

export const metadata = {
  title: "Test de Reflejos | Viralísima",
  description: "Mide tus reflejos en milisegundos. Click cuando el círculo cambie de color. Gratis, sin registro.",
  openGraph: {
    title: "Test de Reflejos — Viralísima",
    description: "¿Cuántos milisegundos tardas en reaccionar?",
    url: "https://viralisima.com/juegos/reflejos",
    images: [{ url: "/api/og?quiz=reflejos", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoReflejos />;
}
