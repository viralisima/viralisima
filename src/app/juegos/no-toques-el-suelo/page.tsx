import JuegoNoToquesElSuelo from "@/components/JuegoNoToquesElSuelo";

export const metadata = {
  title: "El suelo es lava",
  description: "Salta de mueble en mueble antes de que la lava te alcance",
  alternates: { canonical: "https://www.viralisima.com/juegos/no-toques-el-suelo" },
  openGraph: {
    title: "El suelo es lava — Viralísima",
    description: "Salta de mueble en mueble antes de que la lava te alcance",
    url: "https://www.viralisima.com/juegos/no-toques-el-suelo",
    images: [{ url: "/api/og?quiz=no-toques-el-suelo", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoNoToquesElSuelo />;
}
