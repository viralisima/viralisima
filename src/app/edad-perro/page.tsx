import EdadPerro from "@/components/EdadPerro";

export const metadata = {
  title: "Calculadora de la Edad Real de tu Perro (años humanos) | Viralísima",
  description:
    "Descubre cuántos años humanos tiene tu perro según su tamaño. Fórmula veterinaria actualizada, más precisa que multiplicar por 7.",
  openGraph: {
    title: "La edad real de tu perro — Viralísima",
    description: "Cuántos años humanos tiene tu perro.",
    url: "https://viralisima.com/edad-perro",
    images: [{ url: "/api/og?quiz=edad-perro", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <EdadPerro />;
}
