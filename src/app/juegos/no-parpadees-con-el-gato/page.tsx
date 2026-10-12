import JuegoNoParpadeesConElGato from "@/components/JuegoNoParpadeesConElGato";

export const metadata = {
  title: "No le quites el ojo al gato",
  description: "El gato tira cosas de la mesa cuando no lo miras. Pílalo.",
  alternates: { canonical: "https://www.viralisima.com/juegos/no-parpadees-con-el-gato" },
  openGraph: {
    title: "No le quites el ojo al gato — Viralísima",
    description: "El gato tira cosas de la mesa cuando no lo miras. Pílalo.",
    url: "https://www.viralisima.com/juegos/no-parpadees-con-el-gato",
    images: [{ url: "/api/og?quiz=no-parpadees-con-el-gato", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <JuegoNoParpadeesConElGato />;
}
