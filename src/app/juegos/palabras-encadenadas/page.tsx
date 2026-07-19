import JuegoPalabrasEncadenadas from "@/components/JuegoPalabrasEncadenadas";

export const metadata = {
  title: "Palabras Encadenadas | Viralísima",
  description:
    "Encadena palabras contrarreloj: cada una empieza por la última letra de la anterior. ¿Cuántas seguidas aguantas? Gratis y sin registro.",
  openGraph: {
    title: "Palabras Encadenadas — Viralísima",
    description: "Gato → oso → ola → … ¿cuántas palabras encadenas sin fallar?",
    url: "https://viralisima.com/juegos/palabras-encadenadas",
    images: [{ url: "/api/og?quiz=palabras-encadenadas", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoPalabrasEncadenadas />;
}
