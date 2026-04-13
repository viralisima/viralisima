import IMCCalc from "@/components/IMCCalc";

export const metadata = {
  title: "Calculadora de IMC (Índice de Masa Corporal) | Viralísima",
  description:
    "Calcula tu IMC en segundos con tu peso y altura. Sabrás si estás en peso saludable, bajo peso, sobrepeso u obesidad.",
  openGraph: {
    title: "Calculadora de IMC — Viralísima",
    description: "Peso + altura → IMC al instante.",
    url: "https://viralisima.com/calculadora-imc",
    images: [{ url: "/api/og?quiz=imc", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <IMCCalc />;
}
