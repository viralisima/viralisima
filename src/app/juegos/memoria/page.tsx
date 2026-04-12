import JuegoMemoria from "@/components/JuegoMemoria";

export const metadata = {
  title: "Juego de Memoria Simon | Viralísima",
  description: "Pon a prueba tu memoria. Repite la secuencia de colores. Cada nivel es más difícil. ¿Hasta dónde llegas?",
  openGraph: {
    title: "Memoria Simon — Viralísima",
    description: "¿Cuántos colores seguidos puedes recordar?",
    url: "https://viralisima.com/juegos/memoria",
    images: [{ url: "/api/og?quiz=memoria", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoMemoria />;
}
