import Compatibilidad from "@/components/Compatibilidad";

export const metadata = {
  title: "Calculadora de Compatibilidad de Pareja | Viralísima",
  description:
    "Mete tu nombre y el de tu crush/pareja y descubre vuestro porcentaje de compatibilidad en segundos. Gratis y compartible.",
  openGraph: {
    title: "¿Cuánto encajáis? — Viralísima",
    description: "2 nombres, 1 porcentaje de compatibilidad.",
    url: "https://viralisima.com/compatibilidad",
    images: [{ url: "/api/og?quiz=compatibilidad", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <Compatibilidad />;
}
