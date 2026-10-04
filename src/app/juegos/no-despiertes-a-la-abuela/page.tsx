import JuegoNoDespiertesALaAbuela from "@/components/JuegoNoDespiertesALaAbuela";

export const metadata = {
  title: "No despiertes a la abuela",
  description: "La abuela duerme la siesta. Que nadie haga ruido.",
  alternates: { canonical: "https://www.viralisima.com/juegos/no-despiertes-a-la-abuela" },
  openGraph: {
    title: "No despiertes a la abuela — Viralísima",
    description: "La abuela duerme la siesta. Que nadie haga ruido.",
    url: "https://www.viralisima.com/juegos/no-despiertes-a-la-abuela",
    images: [{ url: "/api/og?quiz=no-despiertes-a-la-abuela", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoNoDespiertesALaAbuela />;
}
