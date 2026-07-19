import Link from "next/link";
import PerfilCliente from "@/components/PerfilCliente";

export const metadata = {
  title: "Mi perfil · Guarda tus récords | Viralísima",
  description:
    "Registro voluntario con apodo y PIN para guardar tus puntuaciones de los juegos en cualquier dispositivo. Sin email ni datos personales.",
  robots: { index: false },
};

export default function Page() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-black text-white">
      <div className="max-w-md mx-auto px-4 pt-10 pb-16">
        <Link href="/juegos" className="text-sm opacity-70 hover:opacity-100">← Juegos</Link>
        <div className="text-center my-8">
          <div className="text-5xl mb-2">🏆</div>
          <h1 className="text-3xl md:text-4xl font-black">Guarda tus récords</h1>
          <p className="opacity-70 mt-2 text-sm">Registro voluntario con apodo y PIN. Sin email, sin datos personales.</p>
        </div>
        <PerfilCliente />
      </div>
    </main>
  );
}
