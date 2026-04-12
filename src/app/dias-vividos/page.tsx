import DiasVividos from "@/components/DiasVividos";

export const metadata = {
  title: "¿Cuántos días has vivido? Calculadora | Viralísima",
  description:
    "Descubre en segundos cuántos días, horas y minutos llevas vivos. Mete tu fecha de nacimiento y te lo calculamos al instante.",
  openGraph: {
    title: "¿Cuántos días llevas vivo/a? — Viralísima",
    description: "Una cifra que te hará reflexionar.",
    url: "https://viralisima.com/dias-vividos",
    images: [{ url: "/api/og?quiz=dias-vividos", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <DiasVividos />;
}
