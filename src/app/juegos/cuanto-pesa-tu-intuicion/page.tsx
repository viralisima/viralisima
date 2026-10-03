import JuegoCuantoPesaTuIntuicion from "@/components/JuegoCuantoPesaTuIntuicion";

export const metadata = {
  title: "¿Cuánto pesa?",
  description: "Equilibra la balanza a ojo antes de que se acabe el tiempo",
  alternates: { canonical: "https://www.viralisima.com/juegos/cuanto-pesa-tu-intuicion" },
  openGraph: {
    title: "¿Cuánto pesa? — Viralísima",
    description: "Equilibra la balanza a ojo antes de que se acabe el tiempo",
    url: "https://www.viralisima.com/juegos/cuanto-pesa-tu-intuicion",
    images: [{ url: "/api/og?quiz=cuanto-pesa-tu-intuicion", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoCuantoPesaTuIntuicion />;
}
