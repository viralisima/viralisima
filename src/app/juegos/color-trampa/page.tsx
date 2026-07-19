import JuegoColorTrampa from "@/components/JuegoColorTrampa";

export const metadata = {
  title: "Color Trampa · Test de Stroop | Viralísima",
  description:
    "Pulsa el color de la tinta, no lo que dice la palabra. El test de Stroop que confunde a tu cerebro. 30 segundos, gratis y sin registro.",
  openGraph: {
    title: "Color Trampa — Viralísima",
    description: "¿Tu cerebro aguanta la trampa? Pulsa el color, no la palabra.",
    url: "https://viralisima.com/juegos/color-trampa",
    images: [{ url: "/api/og?quiz=color-trampa", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoColorTrampa />;
}
