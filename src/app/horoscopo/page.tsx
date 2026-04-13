import Link from "next/link";
import { SIGNS } from "@/data/horoscopo";

export const metadata = {
  title: "Horóscopo de hoy en español | Viralísima",
  description:
    "Tu horóscopo diario, personalidad por signo del zodíaco y compatibilidades. En español, para toda LatAm y España.",
};

const BG_BY_SIGN: Record<string, string> = {
  aries: "from-red-500 to-orange-500",
  tauro: "from-emerald-500 to-green-600",
  geminis: "from-yellow-400 to-amber-500",
  cancer: "from-sky-400 to-cyan-500",
  leo: "from-amber-500 to-orange-600",
  virgo: "from-stone-500 to-amber-700",
  libra: "from-pink-400 to-rose-500",
  escorpio: "from-purple-700 to-red-900",
  sagitario: "from-violet-500 to-fuchsia-600",
  capricornio: "from-slate-600 to-slate-800",
  acuario: "from-sky-500 to-blue-600",
  piscis: "from-cyan-500 to-teal-600",
};

export default function Horoscopo() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>

        <div className="text-center my-8">
          <div className="text-5xl mb-2">✨</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Horóscopo de hoy
          </h1>
          <p className="text-slate-600 mt-2">Elige tu signo y descubre qué te espera.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {SIGNS.map((s) => (
            <Link
              key={s.id}
              href={`/horoscopo/${s.id}`}
              className={`bg-gradient-to-br ${BG_BY_SIGN[s.id] ?? "from-slate-500 to-slate-700"} rounded-2xl p-5 text-white hover:scale-105 transition-transform shadow-md`}
            >
              <div className="text-4xl mb-2">{s.emoji}</div>
              <div className="font-black text-lg">{s.name}</div>
              <div className="text-xs opacity-80 mt-1">{s.dates}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
