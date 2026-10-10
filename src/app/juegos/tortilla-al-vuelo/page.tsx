import JuegoTortillaAlVuelo from "@/components/JuegoTortillaAlVuelo";

export const metadata = {
  title: "Tortilla al Vuelo",
  description: "Dale la vuelta sin que acabe en el suelo",
  alternates: { canonical: "https://www.viralisima.com/juegos/tortilla-al-vuelo" },
  openGraph: {
    title: "Tortilla al Vuelo — Viralísima",
    description: "Dale la vuelta sin que acabe en el suelo",
    url: "https://www.viralisima.com/juegos/tortilla-al-vuelo",
    images: [{ url: "/api/og?quiz=tortilla-al-vuelo", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoTortillaAlVuelo />;
}
