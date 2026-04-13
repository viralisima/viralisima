import JuegoAtrapaPastelitos from "@/components/JuegoAtrapaPastelitos";

export const metadata = {
  title: "Atrapa Pastelitos | Viralísima",
  description: "Toca los pastelitos que pasan arriba y haz que caigan en la bolsa del gatito. Cada 10s va más rápido. ¿Cuántos puedes colar?",
  openGraph: {
    title: "Atrapa Pastelitos — Viralísima",
    description: "Haz caer pastelitos en la bolsa del gatito. Suena miau cuando coles.",
    url: "https://viralisima.com/juegos/atrapa-pastelitos",
    images: [{ url: "/api/og?quiz=atrapa-pastelitos", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoAtrapaPastelitos />;
}
