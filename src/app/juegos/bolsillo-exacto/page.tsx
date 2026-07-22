import JuegoBolsilloExacto from "@/components/JuegoBolsilloExacto";

export const metadata = {
  title: "Bolsillo Exacto | Viralísima",
  description: "Para la moneda justo en el objetivo",
  openGraph: {
    title: "Bolsillo Exacto — Viralísima",
    description: "Para la moneda justo en el objetivo",
    url: "https://viralisima.com/juegos/bolsillo-exacto",
    images: [{ url: "/api/og?quiz=bolsillo-exacto", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoBolsilloExacto />;
}
